import React, { useMemo, useState } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  ShieldCheck, 
  Sparkles, 
  Play, 
  Clock, 
  Cpu, 
  Layers,
  ArrowRight,
  TrendingUp,
  Wrench
} from 'lucide-react';
import { useRegexStore } from '../../store/useRegexStore';
import { analyzeRegexPerformance } from '../../parser/redosAnalyzer';
import { D3ComplexityChart } from './D3ComplexityChart';
import { DoubleBezelCard } from '../common/DoubleBezelCard';

export const PerformanceView: React.FC = () => {
  const { pattern, flags, setPattern, setActiveView } = useRegexStore();
  const [benchmarking, setBenchmarking] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState<{ timeMs: number; steps: number; completed: boolean } | null>(null);

  const analysis = useMemo(() => {
    return analyzeRegexPerformance(pattern);
  }, [pattern]);

  const runAdversarialBenchmark = () => {
    setBenchmarking(true);
    setBenchmarkResult(null);

    setTimeout(() => {
      try {
        const adversarialString = 'a'.repeat(24) + '!';
        const t0 = performance.now();
        const rx = new RegExp(pattern, flags);
        rx.test(adversarialString);
        const elapsed = Math.round((performance.now() - t0) * 100) / 100;

        setBenchmarkResult({
          timeMs: elapsed,
          steps: Math.max(1, Math.round(elapsed * 1200)),
          completed: true,
        });
      } catch (err) {
        setBenchmarkResult({
          timeMs: 999.9,
          steps: 50000,
          completed: false,
        });
      } finally {
        setBenchmarking(false);
      }
    }, 50);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
        return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
      case 'medium':
        return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
      case 'low':
        return { text: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
      default:
        return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
    }
  };

  const riskTheme = getRiskColor(analysis.riskLevel);

  return (
    <div className="max-w-[1120px] mx-auto px-6 sm:px-10 pt-4 pb-24 space-y-10">
      {/* Top Header Card */}
      <DoubleBezelCard innerClassName="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[34px] leading-none font-semibold tracking-[-0.03em] text-foreground">
            Speed & Loop Safety Check
          </h1>
          <p className="text-[15px] text-foreground-muted mt-3 max-w-xl leading-snug">
            Check if your regex could get stuck in slow loops or freeze a browser when checking long text.
          </p>
        </div>

        {/* Quick action to playground */}
        <button
          onClick={() => setActiveView('playground')}
          className="px-4 py-2 rounded-xl bg-surface-elevated hover:bg-surface text-foreground border border-border text-xs font-semibold flex items-center gap-1.5 transition-all self-stretch md:self-auto justify-center"
        >
          <Play className="w-3.5 h-3.5" />
          Open Playground
        </button>
      </DoubleBezelCard>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Risk Score Meter */}
        <DoubleBezelCard innerClassName={`p-6 space-y-3 ${riskTheme.bg} ${riskTheme.border}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground-muted flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-primary" />
              Slow Loop Risk
            </span>
            <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold uppercase border ${riskTheme.bg} ${riskTheme.text} ${riskTheme.border}`}>
              {analysis.riskLevel}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-semibold font-mono ${riskTheme.text}`}>
              {analysis.riskScore}
            </span>
            <span className="text-xs text-foreground-dim font-mono">/ 100 Risk Score</span>
          </div>

          <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(100, analysis.riskScore)}%` }}
              className={`h-full transition-all duration-500 ${
                analysis.riskLevel === 'critical' ? 'bg-red-500' :
                analysis.riskLevel === 'medium' ? 'bg-amber-500' :
                analysis.riskLevel === 'low' ? 'bg-teal-500' : 'bg-emerald-500'
              }`}
            />
          </div>
        </DoubleBezelCard>

        {/* Complexity Class */}
        <DoubleBezelCard innerClassName="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground/70 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-primary" />
              Pattern Speed & Efficiency
            </span>
          </div>

          <div className="text-2xl font-semibold font-mono text-foreground">
            {analysis.complexityCategory}
          </div>

          <p className="text-xs text-foreground/60 leading-relaxed">
            {analysis.complexityCategory.includes('Exponential')
              ? 'Watch out: This pattern can freeze the browser or server because it tries too many combinations when text repeats.'
              : analysis.complexityCategory.includes('Polynomial')
              ? 'Caution: Can be a bit slow on really long text with repeated words or letters.'
              : 'Super fast! The engine checks each letter directly without getting stuck in loops.'}
          </p>
        </DoubleBezelCard>

        {/* Adversarial Benchmark Runner */}
        <DoubleBezelCard innerClassName="p-6 space-y-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-foreground/70 flex items-center gap-1.5 mb-2">
              <Clock className="w-4 h-4 text-primary" />
              Quick Speed Test
            </span>
            <p className="text-xs text-foreground/60">
              Test how fast this pattern runs on a sample tricky 25-letter text.
            </p>
          </div>

          <div>
            {benchmarkResult ? (
              <div className="p-2.5 rounded-lg bg-background border border-border text-xs font-mono space-y-1 mb-2">
                <div className="flex justify-between">
                  <span className="text-foreground/60">Execution Time:</span>
                  <span className="font-bold text-foreground">{benchmarkResult.timeMs} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Simulated Steps:</span>
                  <span className="font-bold text-foreground">{benchmarkResult.steps.toLocaleString()}</span>
                </div>
              </div>
            ) : null}

            <button
              onClick={runAdversarialBenchmark}
              disabled={benchmarking}
              className="w-full py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {benchmarking ? 'Checking Speed...' : 'Run Speed Test'}
            </button>
          </div>
        </DoubleBezelCard>
      </div>

      {/* D3 Theoretical Execution Curve */}
      <D3ComplexityChart
        riskScore={analysis.riskScore}
        complexityCategory={analysis.complexityCategory}
      />

      {/* Issues & Anti-Patterns Detected */}
      <DoubleBezelCard innerClassName="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Detected Anti-Patterns & Bottlenecks
          </h3>
          <span className="text-xs font-mono text-foreground/50">
            {analysis.issues.length} Issues Found
          </span>
        </div>

        {analysis.issues.length === 0 ? (
          <div className="p-6 text-center space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-foreground">Clean Pattern</h4>
            <p className="text-xs text-foreground/60 max-w-md mx-auto">
              No nested quantifiers or exponential backtracking vectors detected. This pattern should evaluate safely in high-throughput production environments.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {analysis.issues.map((issue, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-card border border-red-500/20 text-xs text-foreground leading-relaxed flex items-start gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-red-500/10 text-red-400 font-mono text-[11px] flex items-center justify-center font-bold mt-0.5 shrink-0">
                  !
                </div>
                <div>{issue}</div>
              </div>
            ))}
          </div>
        )}
      </DoubleBezelCard>

      {/* Optimization Recommendations */}
      <DoubleBezelCard innerClassName="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Optimization & Hardening Recommendations
          </h3>
        </div>

        <div className="space-y-3">
          {analysis.optimizations.map((opt, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-card border border-border/70 flex items-start gap-3 text-xs"
            >
              <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-mono text-xs flex items-center justify-center font-bold mt-0.5 shrink-0">
                {idx + 1}
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-foreground">Guideline:</span>
                <p className="text-foreground/70 leading-relaxed">{opt}</p>
              </div>
            </div>
          ))}
        </div>
      </DoubleBezelCard>
    </div>
  );
};
