import React, { useState } from 'react';
import { useRegexStore } from '../../store/useRegexStore';
import { RegexMatch } from '../../types/regex';
import { Layers, Copy, Check, Info, Bug, ChevronRight } from 'lucide-react';

export const MatchInspector: React.FC = () => {
  const { getMatches, setActiveView, hoveredGroupIndex, setHoveredGroupIndex } = useRegexStore();
  const [copiedMatchIdx, setCopiedMatchIdx] = useState<number | null>(null);

  const analysis = getMatches();

  const handleCopyMatch = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedMatchIdx(idx);
    setTimeout(() => setCopiedMatchIdx(null), 1800);
  };

  return (
    <div className="space-y-3 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <label className="text-xs font-semibold text-foreground-muted flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-primary" /> Match Inspector ({analysis.count})
        </label>
        {analysis.count === 0 && analysis.isValid && (
          <button
            onClick={() => setActiveView('debugger')}
            className="flex items-center gap-1 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
          >
            <Bug className="w-3 h-3" /> Why no match? <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Match Cards List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[220px]">
        {analysis.count === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 rounded-xl bg-surface-subtle/50 border border-dashed border-border-subtle text-center">
            <div className="w-10 h-10 rounded-xl bg-surface-elevated flex items-center justify-center text-foreground-dim mb-3">
              <Info className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-foreground">No Matches Found</p>
            <p className="text-xs text-foreground-muted mt-1 max-w-xs">
              The pattern did not match any section of the test string. Check your anchors, casing, or open the Debugger for diagnosis.
            </p>
            <button
              onClick={() => setActiveView('debugger')}
              className="mt-4 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Bug className="w-3.5 h-3.5" /> Diagnose in Regex Debugger
            </button>
          </div>
        ) : (
          analysis.matches.map((match: RegexMatch, mIdx: number) => (
            <div
              key={`match-card-${mIdx}`}
              className="p-3.5 rounded-xl bg-surface-subtle border border-border-subtle hover:border-primary/30 transition-all space-y-2.5"
            >
              {/* Match Header */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-primary/15 text-primary font-mono text-xs font-bold border border-primary/20">
                    Match #{mIdx + 1}
                  </span>
                  <span className="text-xs text-foreground-dim font-mono">
                    [{match.start}, {match.end}] ({match.end - match.start} chars)
                  </span>
                </div>

                <button
                  onClick={() => handleCopyMatch(match.text, mIdx)}
                  className="p-1 rounded-md text-foreground-dim hover:text-foreground hover:bg-surface-elevated transition-colors"
                  title="Copy match string"
                >
                  {copiedMatchIdx === mIdx ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Matched text box */}
              <div className="p-2.5 rounded-lg bg-muted/50 border border-border/80 font-mono text-xs text-foreground break-all select-text">
                {match.text}
              </div>

              {/* Capture Groups table */}
              {match.groups.length > 0 && (
                <div className="pt-1 space-y-1.5">
                  <span className="text-[11px] uppercase font-semibold text-foreground-dim tracking-wider">
                    Capture Groups ({match.groups.length})
                  </span>
                  <div className="space-y-1">
                    {match.groups.map((group, gIdx) => {
                      const isHovered = hoveredGroupIndex === group.index;
                      const pillBorder = `group-highlight-${group.index % 8}`;

                      return (
                        <div
                          key={`grp-item-${mIdx}-${gIdx}`}
                          onMouseEnter={() => setHoveredGroupIndex(group.index)}
                          onMouseLeave={() => setHoveredGroupIndex(null)}
                          className={`p-2 rounded-lg bg-surface-elevated/60 flex items-center justify-between text-xs transition-all cursor-pointer ${
                            isHovered ? 'ring-1 ring-primary bg-surface-elevated' : 'hover:bg-surface-elevated'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold ${pillBorder}`}>
                              ${group.index}
                            </span>
                            {group.name && (
                              <span className="text-xs font-medium text-purple-400 font-mono">
                                &lt;{group.name}&gt;
                              </span>
                            )}
                            <span className="font-mono text-xs text-foreground truncate max-w-[180px]">
                              "{group.text}"
                            </span>
                          </div>

                          <span className="text-[11px] font-mono text-foreground-dim shrink-0">
                            [{group.start}, {group.end}]
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
