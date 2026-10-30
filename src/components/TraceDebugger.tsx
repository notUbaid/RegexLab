import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Wrench } from 'lucide-react';
import { TraceStep } from '../engine/types';
import { soundFX } from '../utils/soundEffects';

interface TraceDebuggerProps {
  trace: TraceStep[];
  testText: string;
  pattern: string;
  flags: string;
  onApplyFix?: (pattern: string, flags: string) => void;
}

export const TraceDebugger: React.FC<TraceDebuggerProps> = ({
  trace,
  testText,
  pattern,
  flags,
  onApplyFix,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset step index when trace changes
  useEffect(() => {
    setCurrentStepIdx(0);
    setIsPlaying(false);
  }, [trace]);

  // Play audio tick on step advance
  useEffect(() => {
    if (trace.length > 0 && currentStepIdx > 0) {
      soundFX.playStepTick();
    }
  }, [currentStepIdx]);

  // Autoplay loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIdx((prev) => {
          if (prev >= trace.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 350);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, trace.length]);

  const currentStep = trace[currentStepIdx] || trace[0];

  // Failure diagnosis
  const failureStep = trace.find((s) => s.action === 'fail');
  const hasMatched = trace.some((s) => s.action === 'success');

  const actionColor = (action: string) => {
    switch (action) {
      case 'success':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'fail':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'backtrack':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'branch':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
      default:
        return 'text-foreground bg-surface-elevated border-border';
    }
  };

  return (
    <div className="h-full flex flex-col bg-surface p-3 select-none font-mono text-xs overflow-hidden">
      {/* Playback Controls & Status */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              soundFX.playLatch();
              setIsPlaying(false);
              setCurrentStepIdx(0);
            }}
            className="p-1 rounded text-foreground-dim hover:text-foreground hover:bg-surface-elevated transition-colors"
            title="First step"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIdx((p) => Math.max(0, p - 1));
            }}
            className="p-1 rounded text-foreground-dim hover:text-foreground hover:bg-surface-elevated transition-colors"
            title="Previous step"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              soundFX.playLatch();
              setIsPlaying(!isPlaying);
            }}
            className="px-2 py-1 rounded bg-foreground text-background font-semibold flex items-center gap-1 text-[11px] transition-all hover:bg-foreground/90 active:scale-95 shadow-sm"
            title={isPlaying ? 'Pause trace' : 'Auto-play trace'}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIdx((p) => Math.min(trace.length - 1, p + 1));
            }}
            className="p-1 rounded text-foreground-dim hover:text-foreground hover:bg-surface-elevated transition-colors"
            title="Next step"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-foreground-dim">
          <span>
            Step <strong className="text-foreground">{trace.length ? currentStepIdx + 1 : 0}</strong> of {trace.length}
          </span>
          {currentStep && (
            <span
              className={`px-1.5 py-0.2 rounded border text-[10px] uppercase font-semibold ${actionColor(
                currentStep.action
              )}`}
            >
              {currentStep.action}
            </span>
          )}
        </div>
      </div>

      {/* 1-Click Fix Banner if failed */}
      {!hasMatched && failureStep && onApplyFix && (
        <div className="p-2 mb-2 rounded bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-[11px] animate-modal-pop">
          <div className="flex items-center gap-2 text-rose-300">
            <span>
              Failed at char <strong>'{failureStep.char}'</strong> (index {failureStep.charIndex}): {failureStep.explanation}
            </span>
          </div>
          {pattern.startsWith('^') && (
            <button
              onClick={() => {
                soundFX.playSuccess();
                onApplyFix(pattern.replace(/^\^/, '').replace(/\$$/, ''), flags);
              }}
              className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 flex items-center gap-1 transition-all active:scale-95"
            >
              <Wrench className="w-3 h-3" />
              <span>Remove anchors (^, $)</span>
            </button>
          )}
        </div>
      )}

      {/* Trace Table */}
      <div className="flex-1 min-h-0 overflow-y-auto border border-border rounded bg-surface-subtle">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-[10px] uppercase text-foreground-dim bg-surface sticky top-0 z-10">
              <th className="py-1.5 px-2.5 w-12">Step</th>
              <th className="py-1.5 px-2 w-16">Char</th>
              <th className="py-1.5 px-2 w-24">Action</th>
              <th className="py-1.5 px-2">Matched So Far</th>
              <th className="py-1.5 px-2">Engine State / Explanation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 font-mono text-[11px]">
            {trace.map((step, idx) => {
              const isCurrent = idx === currentStepIdx;
              return (
                <tr
                  key={idx}
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStepIdx(idx);
                  }}
                  className={`cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-amber-400/15 text-amber-300 font-semibold shadow-inner border-l-2 border-l-amber-400'
                      : 'hover:bg-surface text-foreground-muted'
                  }`}
                >
                  <td className="py-1 px-2.5 text-foreground-dim">#{step.stepIndex}</td>
                  <td className="py-1 px-2">
                    <span className="px-1.5 py-0.2 rounded bg-surface border border-border text-foreground font-bold">
                      {step.char === ' ' ? '⎵' : step.char || '∅'}
                    </span>
                  </td>
                  <td className="py-1 px-2">
                    <span
                      className={`px-1 rounded border text-[10px] uppercase ${actionColor(
                        step.action
                      )}`}
                    >
                      {step.action}
                    </span>
                  </td>
                  <td className="py-1 px-2 text-foreground truncate max-w-[120px]">
                    {step.matchedSoFar || '—'}
                  </td>
                  <td className="py-1 px-2 text-foreground-dim text-[11px]">
                    {step.explanation}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
