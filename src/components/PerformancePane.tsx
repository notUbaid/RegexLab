import React, { useState } from 'react';
import { ComplexityAnalysis } from '../engine/types';
import { ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2, Play } from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

interface PerformancePaneProps {
  complexity: ComplexityAnalysis;
  pattern: string;
  onApplyAlternative?: (pattern: string) => void;
}

export const PerformancePane: React.FC<PerformancePaneProps> = ({
  complexity,
  pattern,
  onApplyAlternative,
}) => {
  const [stressTesting, setStressTesting] = useState(false);
  const [stressResults, setStressResults] = useState<{ len: number; timeMs: number }[] | null>(null);

  const runAdversarialTest = () => {
    soundFX.playSwitch(true);
    setStressTesting(true);
    setStressResults(null);

    setTimeout(() => {
      const results: { len: number; timeMs: number }[] = [];
      const lengths = [10, 15, 20, 25];

      try {
        const rx = new RegExp(pattern);
        for (const len of lengths) {
          const testStr = 'a'.repeat(len) + '!';
          const t0 = performance.now();
          rx.test(testStr);
          const t1 = performance.now();
          results.push({ len, timeMs: Number((t1 - t0).toFixed(3)) });
        }
      } catch {
        results.push({ len: 0, timeMs: 999 });
      }

      setStressResults(results);
      setStressTesting(false);

      const hasSlow = results.some((r) => r.timeMs > 50);
      if (hasSlow || complexity.riskLevel === 'critical') {
        soundFX.playWarning();
      } else {
        soundFX.playSuccess();
      }
    }, 50);
  };

  const riskBadge = (level: string) => {
    switch (level) {
      case 'critical':
        return {
          label: 'Critical ReDoS Risk',
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
          barColor: 'bg-rose-500',
        };
      case 'medium':
        return {
          label: 'Moderate Polynomial Risk',
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
          barColor: 'bg-amber-500',
        };
      default:
        return {
          label: 'Safe Expression',
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
          barColor: 'bg-emerald-500',
        };
    }
  };

  const badge = riskBadge(complexity.riskLevel);

  return (
    <div className="h-full overflow-y-auto bg-surface p-3 select-none font-mono text-xs space-y-3">
      {/* Risk Summary Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded border text-[11px] uppercase font-semibold ${badge.color}`}
          >
            {badge.label}
          </span>
          <span className="text-foreground-dim text-[11px]">
            Complexity: <strong className="text-foreground">{complexity.timeComplexity}</strong>
          </span>
        </div>

        <span className="text-foreground-dim text-[11px]">
          Risk Score: <strong className="text-foreground">{complexity.riskScore}</strong> / 100
        </span>
      </div>

      {/* Metric Flame / Progress Bar */}
      <div className="space-y-1">
        <div className="w-full h-1.5 rounded-full bg-surface-elevated overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${badge.barColor}`}
            style={{ width: `${Math.max(5, complexity.riskScore)}%` }}
          />
        </div>
      </div>

      {/* Explanation */}
      <div className="p-2.5 rounded bg-surface-subtle border border-border text-[11px] leading-relaxed text-foreground-muted">
        {complexity.explanation}
      </div>

      {/* Vulnerable Subpatterns (if any) */}
      {complexity.vulnerableSubpatterns.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-rose-400">
            Detected Vulnerable Constructs:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {complexity.vulnerableSubpatterns.map((sub, idx) => (
              <code
                key={idx}
                className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 text-xs"
              >
                {sub}
              </code>
            ))}
          </div>

          {complexity.safeAlternative && onApplyAlternative && (
            <div className="pt-2 flex items-center gap-2">
              <span className="text-foreground-dim text-[11px]">Recommended fix:</span>
              <code className="text-emerald-400 bg-surface-elevated px-1.5 py-0.5 rounded border border-border">
                {complexity.safeAlternative}
              </code>
              <button
                onClick={() => {
                  soundFX.playSuccess();
                  onApplyAlternative(complexity.safeAlternative!);
                }}
                className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] transition-colors"
              >
                Apply Fix
              </button>
            </div>
          )}
        </div>
      )}

      {/* Adversarial Stress Test */}
      <div className="pt-2 border-t border-border flex items-center justify-between">
        <div className="text-[11px] text-foreground-dim">
          Speed test against long strings (checks for slow backtracking)
        </div>
        <button
          onClick={runAdversarialTest}
          disabled={stressTesting}
          className="px-2.5 py-1 rounded bg-surface-elevated hover:bg-surface-elevated/80 border border-border text-foreground text-[11px] flex items-center gap-1.5 transition-colors"
        >
          <Play className="w-3 h-3" />
          <span>{stressTesting ? 'Benchmarking...' : 'Run Benchmark'}</span>
        </button>
      </div>

      {stressResults && (
        <div className="grid grid-cols-4 gap-2 pt-1">
          {stressResults.map((r, i) => (
            <div key={i} className="p-2 rounded bg-surface-subtle border border-border text-center">
              <div className="text-[10px] text-foreground-dim font-mono">{r.len} chars</div>
              <div className="text-xs font-semibold text-foreground font-mono mt-0.5">
                {r.timeMs} ms
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
