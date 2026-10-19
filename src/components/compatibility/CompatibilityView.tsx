import React, { useMemo, useState } from 'react';
import { 
  Globe, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Copy, 
  Check, 
  Play, 
  Cpu, 
  Terminal, 
  Code2,
  Filter
} from 'lucide-react';
import { useRegexStore } from '../../store/useRegexStore';
import { checkEngineCompatibility } from '../../parser/compatibility';
import { DoubleBezelCard } from '../common/DoubleBezelCard';

export const CompatibilityView: React.FC = () => {
  const { pattern, flags, setActiveView } = useRegexStore();
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});
  const [filterMode, setFilterMode] = useState<'all' | 'supported' | 'warnings'>('all');

  const compatibilityList = useMemo(() => {
    return checkEngineCompatibility(pattern, flags);
  }, [pattern, flags]);

  const supportedCount = compatibilityList.filter((item) => item.supported).length;

  const filteredList = useMemo(() => {
    if (filterMode === 'supported') {
      return compatibilityList.filter((item) => item.supported && item.warnings.length === 0);
    }
    if (filterMode === 'warnings') {
      return compatibilityList.filter((item) => !item.supported || item.warnings.length > 0);
    }
    return compatibilityList;
  }, [compatibilityList, filterMode]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMap((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedMap((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  return (
    <div className="max-w-[1120px] mx-auto px-6 sm:px-10 pt-4 pb-24 space-y-10">
      {/* Top Header Card */}
      <DoubleBezelCard innerClassName="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[34px] leading-none font-semibold tracking-[-0.03em] text-foreground">
            Does It Work in Your Language?
          </h1>
          <p className="text-[15px] text-foreground-muted mt-3 max-w-xl leading-snug">
            See if your regex pattern works in Python, JavaScript, Java, Go, Rust, or C# without syntax errors.
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

      {/* Overview Banner */}
      <DoubleBezelCard innerClassName="p-5 bg-primary/5 border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg font-mono border border-primary/20 shrink-0">
            {supportedCount}/{compatibilityList.length}
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {supportedCount === compatibilityList.length
                ? 'Universal Portability Achieved'
                : `${supportedCount} of ${compatibilityList.length} Engines Supported`}
            </h3>
            <p className="text-xs text-foreground/60">
              Evaluated for: <code className="font-mono text-xs">/{pattern}/{flags}</code>
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterMode === 'all' ? 'bg-card text-foreground shadow-sm' : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            All (7)
          </button>
          <button
            onClick={() => setFilterMode('supported')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterMode === 'supported' ? 'bg-card text-foreground shadow-sm' : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            Fully Supported ({supportedCount})
          </button>
          <button
            onClick={() => setFilterMode('warnings')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterMode === 'warnings' ? 'bg-card text-foreground shadow-sm' : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            Warnings / Unsupported ({compatibilityList.length - supportedCount})
          </button>
        </div>
      </DoubleBezelCard>

      {/* Engine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredList.map((item) => {
          const isCopied = copiedMap[item.engine] || false;
          return (
            <DoubleBezelCard
              key={item.engine}
              innerClassName="p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      {item.name}
                    </h3>
                    <span className="text-xs font-mono text-foreground/50">
                      {item.version}
                    </span>
                  </div>

                  {item.supported ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Supported
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                      <XCircle className="w-3.5 h-3.5" /> Incompatible
                    </span>
                  )}
                </div>

                {/* Warnings */}
                {item.warnings.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1.5 text-xs text-amber-300">
                    <div className="font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      Syntax Warning
                    </div>
                    {item.warnings.map((w, idx) => (
                      <p key={idx} className="text-xs leading-relaxed opacity-90 pl-5">
                        {w}
                      </p>
                    ))}
                  </div>
                )}

                {/* Engine Notes */}
                <div className="space-y-1 text-xs text-foreground/70">
                  {item.notes.map((note, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 shrink-0" />
                      <span className="text-xs leading-relaxed">{note}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equivalent Pattern / Snippet */}
              {item.equivalentPattern && (
                <div className="pt-3 border-t border-border space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground/60">
                    <span>Equivalent Pattern:</span>
                    <button
                      onClick={() => handleCopy(item.engine, item.equivalentPattern!)}
                      className="text-primary hover:underline flex items-center gap-1 text-[11px]"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {isCopied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre className="p-2 rounded bg-background border border-border font-mono text-xs text-foreground overflow-x-auto select-all">
                    {item.equivalentPattern}
                  </pre>
                </div>
              )}
            </DoubleBezelCard>
          );
        })}
      </div>
    </div>
  );
};
