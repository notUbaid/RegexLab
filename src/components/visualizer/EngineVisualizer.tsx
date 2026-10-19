import React, { useEffect, useMemo, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  Search,
  Code2,
  Activity,
  ListOrdered
} from 'lucide-react';
import { useRegexStore } from '../../store/useRegexStore';
import { simulateRegexExecution } from '../../parser/stateMachine';
import { tokenizeRegex } from '../../parser/tokenizer';
import { soundFX } from '../../utils/soundEffects';
import { D3StateMachineGraph } from './D3StateMachineGraph';
import { DoubleBezelCard } from '../common/DoubleBezelCard';

export const EngineVisualizer: React.FC = () => {
  const { 
    pattern, 
    flags, 
    testText, 
    currentStepIndex, 
    setCurrentStepIndex,
    isPlaying, 
    setIsPlaying, 
    playbackSpeed, 
    setPlaybackSpeed,
    setActiveView
  } = useRegexStore();

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  // Tokenize regex pattern for D3 finite state machine
  const tokens = useMemo(() => {
    return tokenizeRegex(pattern);
  }, [pattern]);

  // Generate simulation trace steps
  const steps = useMemo(() => {
    return simulateRegexExecution(pattern, testText, flags);
  }, [pattern, testText, flags]);

  const currentStep = steps[currentStepIndex] || steps[0];

  // Play micro-haptic sound on step update
  useEffect(() => {
    if (currentStep?.isBacktracking) {
      soundFX.playWarning();
    } else if (currentStep?.action === 'success') {
      soundFX.playSuccess();
    } else if (currentStep) {
      soundFX.playStepTick();
    }
  }, [currentStepIndex]);

  // Auto-play interval handling
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.max(100, Math.floor(600 / playbackSpeed));
      timerRef.current = setInterval(() => {
        const nextIdx = useRegexStore.getState().currentStepIndex + 1;
        if (nextIdx >= steps.length) {
          setIsPlaying(false);
          if (timerRef.current) clearInterval(timerRef.current);
        } else {
          setCurrentStepIndex(nextIdx);
        }
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, steps.length, setCurrentStepIndex, setIsPlaying]);

  // Auto-scroll log to keep current step visible
  useEffect(() => {
    if (logContainerRef.current) {
      const activeItem = logContainerRef.current.querySelector('[data-active="true"]');
      if (activeItem) {
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentStepIndex]);

  const handlePlayPause = () => {
    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleStepBack = () => {
    setIsPlaying(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Found Match!
          </span>
        );
      case 'fail':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
            <XCircle className="w-3.5 h-3.5" /> No Match Here
          </span>
        );
      case 'backtrack':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" /> Backing Up (trying another path)
          </span>
        );
      case 'branch_start':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            Checking Options
          </span>
        );
      case 'match_char':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30">
            Matched Letter
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-elevated text-foreground-muted border border-border">
            {action.replace('_', ' ')}
          </span>
        );
    }
  };

  if (!pattern) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <DoubleBezelCard innerClassName="p-12 text-center">
          <Code2 className="w-12 h-12 text-primary mx-auto mb-4 opacity-80" />
          <h2 className="text-xl font-bold text-foreground mb-2">No Regex Pattern Entered Yet</h2>
          <p className="text-sm text-foreground-muted mb-6 max-w-md mx-auto">
            Type a pattern in the Playground first, then come back here to watch it read your text one letter at a time!
          </p>
          <button
            onClick={() => setActiveView('playground')}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-fg font-medium text-sm hover:opacity-90 transition-all shadow-md shadow-primary/20"
          >
            Go to Playground
          </button>
        </DoubleBezelCard>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header Card */}
      <DoubleBezelCard innerClassName="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
              Interactive Guide
            </span>
            <span className="text-xs text-foreground-muted flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-primary" />
              Step-by-Step Reader
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Step-by-Step Matcher
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Watch regex read your text letter by letter. See when it matches, when it skips ahead, and when it backs up to try another way.
          </p>
        </div>

        {/* Playback Controls Toolbar */}
        <div className="flex items-center gap-2 bg-muted/60 p-2 rounded-xl border border-border/80 self-stretch md:self-auto justify-between md:justify-start">
          <button
            onClick={handleReset}
            title="Reset to beginning"
            className="p-2 rounded-lg hover:bg-card text-foreground/70 hover:text-foreground transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleStepBack}
            disabled={currentStepIndex <= 0}
            title="Step Backward"
            className="p-2 rounded-lg hover:bg-card text-foreground/70 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={handlePlayPause}
            title={isPlaying ? 'Pause' : 'Play Execution'}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold flex items-center gap-1.5 hover:opacity-90 transition-all shadow-sm"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span className="text-xs font-mono">{isPlaying ? 'Pause' : 'Step Run'}</span>
          </button>

          <button
            onClick={handleStepForward}
            disabled={currentStepIndex >= steps.length - 1}
            title="Step Forward"
            className="p-2 rounded-lg hover:bg-card text-foreground/70 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Speed Toggle */}
          <div className="flex items-center gap-1 ml-2 border-l border-border/60 pl-2">
            {[0.5, 1, 2, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-2 py-1 rounded text-[11px] font-mono font-medium transition-all ${
                  playbackSpeed === speed
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'text-foreground/60 hover:text-foreground'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </DoubleBezelCard>

      {/* Main Visualizer Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Ribbons & Current Step State */}
        <div className="lg:col-span-8 space-y-6">
          {/* Timeline Scrubber */}
          <DoubleBezelCard innerClassName="p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-foreground/70">
              <span className="font-mono flex items-center gap-1.5">
                <ListOrdered className="w-3.5 h-3.5 text-primary" />
                Step Frame: <strong className="text-foreground">{currentStepIndex + 1}</strong> of{' '}
                <strong className="text-foreground">{steps.length}</strong>
              </span>
              <span className="font-mono text-[11px]">
                {Math.round(((currentStepIndex + 1) / Math.max(1, steps.length)) * 100)}% Complete
              </span>
            </div>

            <div className="relative">
              <input
                type="range"
                min={0}
                max={Math.max(0, steps.length - 1)}
                value={currentStepIndex}
                onChange={(e) => {
                  setIsPlaying(false);
                  setCurrentStepIndex(parseInt(e.target.value, 10));
                }}
                className="w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </DoubleBezelCard>

          {/* D3 Finite Automaton State Graph */}
          <D3StateMachineGraph
            tokens={tokens}
            currentStep={currentStep}
            className="shadow-xl"
          />

          {/* Pattern Token Ribbon */}
          <DoubleBezelCard innerClassName="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-foreground/60 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-primary" />
                Active Pattern Evaluation
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-foreground/70 border border-border">
                /{pattern}/{flags}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-background/80 border border-border/80 font-mono text-base overflow-x-auto flex items-center gap-1">
              {pattern.split('').map((char, idx) => {
                const isActive = currentStep?.token 
                  ? idx >= currentStep.token.start && idx < currentStep.token.end
                  : false;
                return (
                  <span
                    key={idx}
                    className={`px-1.5 py-1 rounded transition-all duration-150 ${
                      isActive
                        ? 'bg-primary text-primary-foreground font-bold shadow-md shadow-primary/30 ring-2 ring-primary ring-offset-2 ring-offset-background'
                        : 'text-foreground/80 hover:bg-muted/50'
                    }`}
                  >
                    {char}
                  </span>
                );
              })}
            </div>
          </DoubleBezelCard>

          {/* Text Cursor Ribbon */}
          <DoubleBezelCard innerClassName="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-foreground/60 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-primary" />
                Input Text Cursor Tracker
              </span>
              <span className="text-xs font-mono text-foreground/60">
                Cursor Index: <strong className="text-foreground">{currentStep?.textIndex ?? 0}</strong> / {testText.length}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-background/80 border border-border/80 font-mono text-base overflow-x-auto whitespace-pre">
              {testText.length === 0 ? (
                <span className="text-foreground/40 italic">Empty test text</span>
              ) : (
                testText.split('').map((char, idx) => {
                  const isCursor = idx === currentStep?.textIndex;
                  const isMatched = idx < (currentStep?.textIndex ?? 0);
                  return (
                    <span
                      key={idx}
                      className={`inline-block px-1 py-0.5 rounded transition-all duration-150 ${
                        isCursor
                          ? 'bg-amber-500 text-black font-bold ring-2 ring-amber-400 ring-offset-1 ring-offset-background shadow-md'
                          : isMatched
                          ? 'bg-emerald-500/20 text-emerald-400 font-medium'
                          : 'text-foreground/75'
                      }`}
                    >
                      {char === '\n' ? '\\n' : char}
                    </span>
                  );
                })
              )}
            </div>
          </DoubleBezelCard>

          {/* Current Step Detailed Card */}
          <DoubleBezelCard innerClassName="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Current Engine Action
              </h3>
              {currentStep && getActionBadge(currentStep.action)}
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-2">
              <p className="text-sm text-foreground font-medium leading-relaxed">
                {currentStep?.description || 'Engine idle.'}
              </p>

              {currentStep?.charTested !== undefined && (
                <div className="flex items-center gap-4 text-xs font-mono pt-2 border-t border-border/40">
                  <span className="text-foreground/70">
                    Testing Char: <span className="text-primary font-bold px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">'{currentStep.charTested}'</span>
                  </span>
                  {currentStep.token && (
                    <span className="text-foreground/70">
                      Against Token: <span className="text-foreground font-bold px-1.5 py-0.5 rounded bg-muted border border-border">{currentStep.token.raw}</span> ({currentStep.token.title})
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Backtracking Notice */}
            {currentStep?.isBacktracking && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-400 text-xs">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <strong className="font-semibold block mb-0.5">Engine Backtracked</strong>
                  The previous branch failed to match the rest of the expression. The regex engine rolls back the cursor and tests the next branch or quantifier state.
                </div>
              </div>
            )}
          </DoubleBezelCard>
        </div>

        {/* Right Column: Execution Step History Log */}
        <div className="lg:col-span-4">
          <DoubleBezelCard innerClassName="p-5 flex flex-col h-[640px]">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-primary" />
                Execution Log
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted text-foreground/60 border border-border">
                {steps.length} Frames
              </span>
            </div>

            <div 
              ref={logContainerRef}
              className="flex-1 overflow-y-auto space-y-2 pt-3 pr-1 font-mono text-xs"
            >
              {steps.map((step, idx) => {
                const isActive = idx === currentStepIndex;
                const isBacktrack = step.isBacktracking;
                return (
                  <button
                    key={step.stepIndex}
                    data-active={isActive}
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentStepIndex(idx);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-primary/15 border-primary/40 text-foreground ring-1 ring-primary/30 shadow-sm'
                        : isBacktrack
                        ? 'bg-amber-500/5 border-amber-500/20 text-foreground/80 hover:bg-amber-500/10'
                        : 'bg-card/40 border-border/40 text-foreground/70 hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground/60'
                      }`}>
                        #{idx + 1}
                      </span>
                      <span className="text-[10px] text-foreground/50">
                        Cursor: {step.textIndex}
                      </span>
                    </div>
                    <div className="truncate font-sans font-medium text-xs">
                      {step.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </DoubleBezelCard>
        </div>
      </div>
    </div>
  );
};
