import React, { useMemo } from 'react';
import { 
  Bug, 
  CheckCircle2, 
  XCircle, 
  Lightbulb, 
  ArrowRight, 
  Sparkles, 
  Play, 
  HelpCircle,
  AlertOctagon,
  Search,
  Code2,
  Wrench
} from 'lucide-react';
import { useRegexStore } from '../../store/useRegexStore';
import { diagnoseRegexFailure } from '../../parser/debugger';
import { DoubleBezelCard } from '../common/DoubleBezelCard';

export const RegexDebuggerView: React.FC = () => {
  const { pattern, flags, testText, setPattern, setFlags, setTestText, setActiveView } = useRegexStore();

  const diagnosis = useMemo(() => {
    return diagnoseRegexFailure(pattern, testText, flags);
  }, [pattern, testText, flags]);

  const handleApplyFix = (fix: string) => {
    // Check if fix recommends adding insensitive flag 'i'
    if (fix.toLowerCase().includes("flag 'i'") || fix.toLowerCase().includes('case-insensitive')) {
      if (!flags.includes('i')) {
        setFlags(flags + 'i');
      }
    } else if (fix.toLowerCase().includes('remove anchor') || fix.toLowerCase().includes('^') || fix.toLowerCase().includes('$')) {
      const unanchored = pattern.replace(/^\^/, '').replace(/\$$/, '');
      setPattern(unanchored);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header Card */}
      <DoubleBezelCard innerClassName="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
              Helper Tool
            </span>
            <span className="text-xs text-foreground-muted flex items-center gap-1">
              <Bug className="w-3.5 h-3.5 text-primary" />
              Match Helper
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Fix My Regex: Find Where It Stopped
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Find out exactly which letter caused your regex to stop matching, see what character it was looking for, and get 1-click tips to fix it.
          </p>
        </div>

        {/* Quick action to playground */}
        <button
          onClick={() => setActiveView('playground')}
          className="px-4 py-2 rounded-xl bg-card hover:bg-muted text-foreground border border-border text-xs font-semibold flex items-center gap-1.5 transition-all self-stretch md:self-auto justify-center"
        >
          <Play className="w-3.5 h-3.5" />
          Open Playground
        </button>
      </DoubleBezelCard>

      {/* Main Diagnostic Status Hero */}
      {diagnosis.matched ? (
        <DoubleBezelCard innerClassName="p-8 bg-emerald-500/5 border-emerald-500/20 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-emerald-400">Match Succeeded!</h2>
            <p className="text-sm text-foreground/70 max-w-lg mx-auto">
              Your pattern <code className="font-mono text-xs px-2 py-0.5 rounded bg-muted">/{pattern}/{flags}</code> successfully matched the target text without any syntactic or semantic mismatches.
            </p>
          </div>
        </DoubleBezelCard>
      ) : (
        <DoubleBezelCard innerClassName="p-6 bg-red-500/5 border-red-500/20 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                  Mismatch Detected
                </span>
                {diagnosis.failureIndex >= 0 && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                    Failed at Character Index {diagnosis.failureIndex}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-foreground">
                {diagnosis.explanation}
              </h2>
            </div>
          </div>
        </DoubleBezelCard>
      )}

      {/* Visual Character Failure Ribbon */}
      {!diagnosis.matched && diagnosis.failureIndex >= 0 && (
        <DoubleBezelCard innerClassName="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground/70 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-primary" />
              Mismatch Location in Text
            </span>
            <span className="text-xs font-mono text-foreground/50">
              Target Index: {diagnosis.failureIndex}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-background border border-border font-mono text-base overflow-x-auto whitespace-pre">
            {testText.split('').map((char, idx) => {
              const isFailure = idx === diagnosis.failureIndex;
              const isBefore = idx < diagnosis.failureIndex;
              return (
                <span
                  key={idx}
                  className={`inline-block px-1 py-0.5 rounded transition-all ${
                    isFailure
                      ? 'bg-red-500 text-white font-extrabold ring-4 ring-red-500/30 scale-110 shadow-lg'
                      : isBefore
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'text-foreground/60'
                  }`}
                  title={`Index ${idx}: '${char}'`}
                >
                  {char === '\n' ? '\\n' : char}
                </span>
              );
            })}
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-foreground/60 pt-2 border-t border-border/40">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/30" /> Matched prior to failure
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-red-500" /> Point of failure
            </span>
          </div>
        </DoubleBezelCard>
      )}

      {/* Comparison: Expected vs Actual */}
      {!diagnosis.matched && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Expected */}
          <DoubleBezelCard innerClassName="p-5 space-y-3 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
              <Code2 className="w-4 h-4" />
              What Pattern Expected
            </div>
            <div className="p-4 rounded-xl bg-background border border-border">
              <p className="text-base font-mono font-bold text-foreground">
                {diagnosis.expectedDescription}
              </p>
            </div>
            <p className="text-xs text-foreground/60">
              Your regex pattern was looking for this character or rule at this point in the text.
            </p>
          </DoubleBezelCard>

          {/* Actual Found */}
          <DoubleBezelCard innerClassName="p-5 space-y-3 bg-amber-500/5 border-amber-500/20">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <AlertOctagon className="w-4 h-4" />
              What Was Found in Input
            </div>
            <div className="p-4 rounded-xl bg-background border border-border">
              <p className="text-base font-mono font-bold text-foreground">
                {diagnosis.actualChar ? `'${diagnosis.actualChar}'` : 'End of String (EOF)'}
              </p>
            </div>
            <p className="text-xs text-foreground/60">
              The input text provided this character, which failed the token's matching predicate.
            </p>
          </DoubleBezelCard>
        </div>
      )}

      {/* Suggested Fixes Card */}
      {!diagnosis.matched && diagnosis.suggestedFixes.length > 0 && (
        <DoubleBezelCard innerClassName="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Wrench className="w-4 h-4 text-primary" />
              Actionable Fix Recommendations
            </h3>
            <span className="text-xs text-foreground/50">
              {diagnosis.suggestedFixes.length} Suggestions
            </span>
          </div>

          <div className="space-y-3">
            {diagnosis.suggestedFixes.map((fix, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-card border border-border/70 hover:border-primary/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary font-mono text-xs flex items-center justify-center font-bold mt-0.5 shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-xs font-medium text-foreground leading-relaxed">
                    {fix}
                  </p>
                </div>

                <button
                  onClick={() => handleApplyFix(fix)}
                  className="px-3 py-1.5 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground text-foreground text-xs font-semibold transition-all shrink-0 self-end sm:self-auto"
                >
                  Apply Fix
                </button>
              </div>
            ))}
          </div>
        </DoubleBezelCard>
      )}

      {/* Live Sample Text Editor */}
      <DoubleBezelCard innerClassName="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" />
            Live Test Text Subject
          </h3>
          <span className="text-xs font-mono text-foreground/50">
            {testText.length} characters
          </span>
        </div>

        <textarea
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          rows={4}
          placeholder="Type or paste text to debug against regex..."
          className="w-full p-3 rounded-xl bg-background border border-border font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-y"
        />
      </DoubleBezelCard>
    </div>
  );
};
