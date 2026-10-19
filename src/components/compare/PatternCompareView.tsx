import React, { useMemo } from 'react';
import { 
  GitCompare, 
  Sparkles, 
  Clock, 
  Cpu, 
  Globe, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ShieldCheck, 
  Award,
  Layers,
  Code2
} from 'lucide-react';
import { useRegexStore } from '../../store/useRegexStore';
import { analyzeRegexPerformance } from '../../parser/redosAnalyzer';
import { checkEngineCompatibility } from '../../parser/compatibility';
import { translateRegex } from '../../parser/translator';
import { DoubleBezelCard } from '../common/DoubleBezelCard';

export const PatternCompareView: React.FC = () => {
  const { 
    pattern, 
    flags, 
    comparePattern, 
    compareFlags, 
    testText, 
    setPattern, 
    setComparePattern, 
    setTestText 
  } = useRegexStore();

  // Pattern A evaluations
  const perfA = useMemo(() => analyzeRegexPerformance(pattern), [pattern]);
  const compatA = useMemo(() => checkEngineCompatibility(pattern, flags), [pattern, flags]);
  const transA = useMemo(() => translateRegex(pattern), [pattern]);
  const matchesA = useMemo(() => {
    try {
      const rx = new RegExp(pattern, flags);
      const m = testText.match(rx);
      return m ? m.length : 0;
    } catch {
      return 0;
    }
  }, [pattern, flags, testText]);

  // Pattern B evaluations
  const perfB = useMemo(() => analyzeRegexPerformance(comparePattern), [comparePattern]);
  const compatB = useMemo(() => checkEngineCompatibility(comparePattern, compareFlags), [comparePattern, compareFlags]);
  const transB = useMemo(() => translateRegex(comparePattern), [comparePattern]);
  const matchesB = useMemo(() => {
    try {
      const rx = new RegExp(comparePattern, compareFlags);
      const m = testText.match(rx);
      return m ? m.length : 0;
    } catch {
      return 0;
    }
  }, [comparePattern, compareFlags, testText]);

  const compatCountA = compatA.filter((c) => c.supported).length;
  const compatCountB = compatB.filter((c) => c.supported).length;

  // Determine recommendation winner
  const winner = useMemo(() => {
    let scoreA = 0;
    let scoreB = 0;

    // Lower risk score is better
    if (perfA.riskScore < perfB.riskScore) scoreA += 2;
    else if (perfB.riskScore < perfA.riskScore) scoreB += 2;

    // Shorter length (readability)
    if (pattern.length < comparePattern.length) scoreA += 1;
    else if (comparePattern.length < pattern.length) scoreB += 1;

    // Higher portability
    if (compatCountA > compatCountB) scoreA += 2;
    else if (compatCountB > compatCountA) scoreB += 2;

    if (scoreA > scoreB) return 'A';
    if (scoreB > scoreA) return 'B';
    return 'Tie';
  }, [perfA, perfB, pattern, comparePattern, compatCountA, compatCountB]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header Card */}
      <DoubleBezelCard innerClassName="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
              Diff & Benchmarking
            </span>
            <span className="text-xs text-foreground/60 flex items-center gap-1">
              <GitCompare className="w-3.5 h-3.5 text-primary" />
              Smart Pattern Comparison
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Side-by-Side Pattern Comparison
          </h1>
          <p className="text-xs text-foreground/70 mt-0.5">
            Compare two regular expressions on readability, execution complexity, ReDoS safety, and cross-engine portability.
          </p>
        </div>

        {/* Winner Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
          <Award className="w-4 h-4" />
          <span>
            {winner === 'A' ? 'Pattern A Recommended' : winner === 'B' ? 'Pattern B Recommended' : 'Balanced Tradeoffs'}
          </span>
        </div>
      </DoubleBezelCard>

      {/* Dual Input Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pattern A Input */}
        <DoubleBezelCard innerClassName="p-5 space-y-3 border-amber-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-400 font-bold font-mono text-xs flex items-center justify-center border border-amber-500/20">
                A
              </span>
              <h3 className="text-sm font-bold text-foreground">Pattern A (First Pattern)</h3>
            </div>
            <span className="text-xs font-mono text-foreground/50">{pattern.length} chars</span>
          </div>

          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Pattern A regex..."
            className="w-full px-3 py-2 rounded-xl bg-background border border-border font-mono text-xs text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <div className="flex items-center gap-3 text-xs text-foreground/60">
            <span>Flags: <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground font-bold">{flags}</code></span>
            <span>Matches on text: <strong className="text-foreground">{matchesA}</strong></span>
          </div>
        </DoubleBezelCard>

        {/* Pattern B Input */}
        <DoubleBezelCard innerClassName="p-5 space-y-3 border-orange-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-orange-500/10 text-orange-400 font-bold font-mono text-xs flex items-center justify-center border border-orange-500/20">
                B
              </span>
              <h3 className="text-sm font-bold text-foreground">Pattern B (Second Pattern)</h3>
            </div>
            <span className="text-xs font-mono text-foreground/50">{comparePattern.length} chars</span>
          </div>

          <input
            type="text"
            value={comparePattern}
            onChange={(e) => setComparePattern(e.target.value)}
            placeholder="Pattern B regex..."
            className="w-full px-3 py-2 rounded-xl bg-background border border-border font-mono text-xs text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <div className="flex items-center gap-3 text-xs text-foreground/60">
            <span>Flags: <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground font-bold">{compareFlags}</code></span>
            <span>Matches on text: <strong className="text-foreground">{matchesB}</strong></span>
          </div>
        </DoubleBezelCard>
      </div>

      {/* Comparative Metrics Matrix Table */}
      <DoubleBezelCard innerClassName="p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2 pb-2 border-b border-border">
          <Cpu className="w-4 h-4 text-primary" />
          Which Pattern Works Better? (Comparison)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border/80 text-foreground/60">
                <th className="py-2.5 font-semibold">What We Are Comparing</th>
                <th className="py-2.5 font-semibold text-amber-400">Pattern A</th>
                <th className="py-2.5 font-semibold text-orange-400">Pattern B</th>
                <th className="py-2.5 font-semibold text-right">Winner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-mono">
              <tr>
                <td className="py-3 font-sans font-medium text-foreground">Length (Conciseness)</td>
                <td className="py-3 text-foreground font-bold">{pattern.length} characters</td>
                <td className="py-3 text-foreground font-bold">{comparePattern.length} characters</td>
                <td className="py-3 text-right font-sans font-bold">
                  {pattern.length < comparePattern.length ? (
                    <span className="text-emerald-400">Pattern A ({comparePattern.length - pattern.length} chars shorter)</span>
                  ) : pattern.length > comparePattern.length ? (
                    <span className="text-emerald-400">Pattern B ({pattern.length - comparePattern.length} chars shorter)</span>
                  ) : (
                    <span className="text-foreground/50">Equal</span>
                  )}
                </td>
              </tr>

              <tr>
                <td className="py-3 font-sans font-medium text-foreground">Time Complexity</td>
                <td className="py-3 text-foreground font-bold">{perfA.complexityCategory}</td>
                <td className="py-3 text-foreground font-bold">{perfB.complexityCategory}</td>
                <td className="py-3 text-right font-sans font-bold">
                  {perfA.complexityCategory === perfB.complexityCategory ? (
                    <span className="text-foreground/50">Equivalent</span>
                  ) : perfA.complexityCategory.includes('Linear') ? (
                    <span className="text-emerald-400">Pattern A (Linear)</span>
                  ) : (
                    <span className="text-emerald-400">Pattern B (Linear)</span>
                  )}
                </td>
              </tr>

              <tr>
                <td className="py-3 font-sans font-medium text-foreground">ReDoS Risk Score</td>
                <td className="py-3 text-foreground font-bold">{perfA.riskScore} / 100</td>
                <td className="py-3 text-foreground font-bold">{perfB.riskScore} / 100</td>
                <td className="py-3 text-right font-sans font-bold">
                  {perfA.riskScore < perfB.riskScore ? (
                    <span className="text-emerald-400">Pattern A is safer (-{perfB.riskScore - perfA.riskScore} risk)</span>
                  ) : perfA.riskScore > perfB.riskScore ? (
                    <span className="text-emerald-400">Pattern B is safer (-{perfA.riskScore - perfB.riskScore} risk)</span>
                  ) : (
                    <span className="text-foreground/50">Equivalent Risk</span>
                  )}
                </td>
              </tr>

              <tr>
                <td className="py-3 font-sans font-medium text-foreground">Cross-Engine Support</td>
                <td className="py-3 text-foreground font-bold">{compatCountA} / 7 Engines</td>
                <td className="py-3 text-foreground font-bold">{compatCountB} / 7 Engines</td>
                <td className="py-3 text-right font-sans font-bold">
                  {compatCountA > compatCountB ? (
                    <span className="text-emerald-400">Pattern A (+{compatCountA - compatCountB} engines)</span>
                  ) : compatCountA < compatCountB ? (
                    <span className="text-emerald-400">Pattern B (+{compatCountB - compatCountA} engines)</span>
                  ) : (
                    <span className="text-foreground/50">Equal Portability</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </DoubleBezelCard>

      {/* Shared Test Text Box */}
      <DoubleBezelCard innerClassName="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Shared Test Input
          </h3>
          <span className="text-xs font-mono text-foreground/50">{testText.length} characters</span>
        </div>

        <textarea
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          rows={3}
          className="w-full p-3 rounded-xl bg-background border border-border font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-y"
          placeholder="Enter text to evaluate both patterns simultaneously..."
        />
      </DoubleBezelCard>
    </div>
  );
};
