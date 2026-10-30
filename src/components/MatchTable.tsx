import React, { useState, useMemo } from 'react';
import { Copy, Check, GitCompare, Replace, ListFilter, ArrowRight } from 'lucide-react';
import { RegexAnalysisResult, RegexMatch } from '../engine/types';
import { analyzeRegex } from '../engine/analyze';
import { soundFX } from '../utils/soundEffects';

interface MatchTableProps {
  analysis: RegexAnalysisResult;
  testText: string;
  hoveredGroupIndex: number | null;
  onHoverGroup: (index: number | null) => void;
  replacementText: string;
  onReplacementTextChange: (text: string) => void;
  comparePattern: string;
  compareFlags: string;
  onComparePatternChange: (pattern: string) => void;
  onCompareFlagsChange: (flags: string) => void;
}

export const MatchTable: React.FC<MatchTableProps> = ({
  analysis,
  testText,
  hoveredGroupIndex,
  onHoverGroup,
  replacementText,
  onReplacementTextChange,
  comparePattern,
  compareFlags,
  onComparePatternChange,
  onCompareFlagsChange,
}) => {
  const [activePane, setActivePane] = useState<'matches' | 'replace' | 'compare'>('matches');
  const [copiedReplace, setCopiedReplace] = useState(false);
  const [selectedMatchIdx, setSelectedMatchIdx] = useState<number>(0);

  // Replaced output computation
  const replacedOutput = useMemo(() => {
    if (!analysis.isValid || !analysis.pattern) return testText;
    try {
      const rx = new RegExp(analysis.pattern, analysis.flags);
      return testText.replace(rx, replacementText);
    } catch {
      return testText;
    }
  }, [analysis.isValid, analysis.pattern, analysis.flags, testText, replacementText]);

  // Secondary pattern analysis for compare tab
  const compareAnalysis = useMemo(() => {
    if (!comparePattern) return null;
    return analyzeRegex(comparePattern, compareFlags, testText);
  }, [comparePattern, compareFlags, testText]);

  const handleCopyReplaced = () => {
    soundFX.playCopy();
    navigator.clipboard.writeText(replacedOutput);
    setCopiedReplace(true);
    setTimeout(() => setCopiedReplace(false), 1500);
  };

  const currentMatch = analysis.matches[selectedMatchIdx] || analysis.matches[0];

  const quickPills = [
    { label: '$1', val: '$1', title: 'Group 1' },
    { label: '$2', val: '$2', title: 'Group 2' },
    { label: '$3', val: '$3', title: 'Group 3' },
    { label: '$&', val: '$&', title: 'Full match' },
    { label: "$'", val: "$'", title: 'Text after match' },
    { label: '$`', val: '$`', title: 'Text before match' },
  ];

  return (
    <div className="flex flex-col h-full bg-surface select-none">
      {/* Tab Switcher Toolbar with tactile switch sound */}
      <div className="h-9 px-3 border-b border-border bg-surface-subtle flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              soundFX.playTab();
              setActivePane('matches');
            }}
            className={`px-2.5 py-1 rounded transition-all ${
              activePane === 'matches'
                ? 'bg-surface-elevated text-foreground font-semibold shadow-sm'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            Matches ({analysis.matchCount})
          </button>

          <button
            onClick={() => {
              soundFX.playTab();
              setActivePane('replace');
            }}
            className={`px-2.5 py-1 rounded transition-all ${
              activePane === 'replace'
                ? 'bg-surface-elevated text-foreground font-semibold shadow-sm'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            Replace
          </button>

          <button
            onClick={() => {
              soundFX.playTab();
              setActivePane('compare');
            }}
            className={`px-2.5 py-1 rounded transition-all ${
              activePane === 'compare'
                ? 'bg-surface-elevated text-foreground font-semibold shadow-sm'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            Compare
          </button>
        </div>

        {activePane === 'matches' && analysis.matchCount > 0 && (
          <span className="text-[11px] font-mono text-foreground-dim">
            {analysis.matches.length} matches · {analysis.executionTimeMs} ms
          </span>
        )}
      </div>

      {/* Pane 1: Matches & Groups */}
      {activePane === 'matches' && (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden text-xs">
          {!analysis.isValid ? (
            <div className="flex-1 p-4 flex flex-col items-center justify-center text-center text-rose-400 animate-modal-pop">
              <span className="font-semibold text-sm mb-1">Invalid Expression</span>
              <p className="font-mono text-xs opacity-80">{analysis.error}</p>
            </div>
          ) : analysis.matches.length === 0 ? (
            <div className="flex-1 p-4 flex flex-col items-center justify-center text-center text-foreground-dim animate-modal-pop">
              <span className="font-medium mb-1">No matches found</span>
              <p className="text-[11px] max-w-xs">
                Check that your pattern matches the text or try toggling the <code className="text-foreground">i</code> (ignore case) or <code className="text-foreground">m</code> (multiline) flags.
              </p>
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col">
              {/* Match selector pills if multiple matches */}
              {analysis.matches.length > 1 && (
                <div className="px-3 py-1.5 border-b border-border bg-surface-subtle/50 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                  <span className="text-[11px] text-foreground-dim font-medium mr-1">Match:</span>
                  {analysis.matches.map((m, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        soundFX.playKeypress();
                        setSelectedMatchIdx(idx);
                      }}
                      className={`px-2 py-0.5 rounded font-mono text-[11px] transition-all ${
                        (selectedMatchIdx || 0) === idx
                          ? 'bg-foreground text-background font-semibold shadow-sm scale-105'
                          : 'bg-surface-elevated text-foreground-muted hover:text-foreground hover:bg-surface'
                      }`}
                    >
                      #{idx + 1}
                    </button>
                  ))}
                </div>
              )}

              {/* Match Details Card */}
              {currentMatch && (
                <div className="p-3 border-b border-border space-y-2 bg-surface">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-foreground">
                      Match #{currentMatch.index + 1}
                    </span>
                    <span className="font-mono text-[11px] text-foreground-dim">
                      chars [{currentMatch.start} - {currentMatch.end}] ({currentMatch.end - currentMatch.start} chars)
                    </span>
                  </div>

                  <div className="p-2 rounded bg-surface-subtle border border-border font-mono text-xs text-foreground overflow-x-auto whitespace-pre">
                    {currentMatch.text}
                  </div>
                </div>
              )}

              {/* Capture Groups Table */}
              <div className="flex-1 min-h-0 overflow-auto">
                <div className="px-3 py-1.5 bg-surface-subtle text-[11px] font-semibold text-foreground-muted border-b border-border flex items-center justify-between">
                  <span>Capture Groups ({currentMatch ? currentMatch.groups.length : 0})</span>
                  <span className="text-[10px] text-foreground-dim">Hover group to pinpoint</span>
                </div>

                {(!currentMatch || currentMatch.groups.length === 0) ? (
                  <div className="p-4 text-center text-foreground-dim text-[11px]">
                    No capture groups defined. Wrap subpatterns in parentheses like <code className="text-foreground">(\w+)</code> to capture data.
                  </div>
                ) : (
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-border text-foreground-dim text-[10px]">
                        <th className="py-1 px-3 w-8">#</th>
                        <th className="py-1 px-2">Group</th>
                        <th className="py-1 px-2">Span</th>
                        <th className="py-1 px-3">Captured Text</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {currentMatch.groups.map((group) => {
                        const isHovered = hoveredGroupIndex === group.index;
                        const colorClass = `g${group.index % 8}`;

                        return (
                          <tr
                            key={group.index}
                            onMouseEnter={() => {
                              soundFX.playHoverPlink();
                              onHoverGroup(group.index);
                            }}
                            onMouseLeave={() => onHoverGroup(null)}
                            className={`cursor-pointer transition-colors ${
                              isHovered ? 'bg-surface-elevated' : 'hover:bg-surface-subtle'
                            }`}
                          >
                            <td className="py-1.5 px-3">
                              <span className={`inline-block w-2 h-2 rounded-full ${colorClass}`} style={{ background: 'rgb(var(--g))' }} />
                            </td>
                            <td className="py-1.5 px-2 text-foreground font-semibold">
                              {group.name ? group.name : `Group ${group.index}`}
                            </td>
                            <td className="py-1.5 px-2 text-foreground-dim text-[11px]">
                              [{group.start}-{group.end}]
                            </td>
                            <td className="py-1.5 px-3 text-foreground break-all">
                              <span className={`px-1 py-0.5 rounded ${colorClass}`} style={{ background: 'rgb(var(--g) / 0.15)', color: 'rgb(var(--g))' }}>
                                {group.text || '<empty>'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pane 2: Replace Sandbox */}
      {activePane === 'replace' && (
        <div className="flex-1 min-h-0 flex flex-col p-3 space-y-3 overflow-auto text-xs animate-tab-enter">
          <div>
            <label className="block text-[11px] font-semibold text-foreground-muted mb-1">
              Substitution String
            </label>
            <input
              type="text"
              value={replacementText}
              onChange={(e) => {
                soundFX.playKeypress();
                onReplacementTextChange(e.target.value);
              }}
              placeholder="e.g. [$1] or Item: $&"
              className="w-full px-2.5 py-1.5 rounded bg-surface-subtle border border-border font-mono text-xs text-foreground placeholder:text-foreground-dim focus:outline-none focus:border-foreground/40"
            />
          </div>

          {/* Quick Insertion Pills */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] text-foreground-dim mr-1">Insert:</span>
            {quickPills.map((pill) => (
              <button
                key={pill.val}
                onClick={() => {
                  soundFX.playKeypress();
                  onReplacementTextChange(replacementText + pill.val);
                }}
                title={pill.title}
                className="px-1.5 py-0.5 rounded bg-surface-elevated border border-border text-[11px] font-mono text-foreground-muted hover:text-foreground hover:bg-surface transition-colors active:scale-95"
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Transformed Output */}
          <div className="flex-1 flex flex-col min-h-[140px]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-foreground-muted">Transformed Output</span>
              <button
                onClick={handleCopyReplaced}
                className="flex items-center gap-1 text-[11px] text-foreground-dim hover:text-foreground transition-colors"
              >
                {copiedReplace ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedReplace ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <textarea
              readOnly
              value={replacedOutput}
              className="flex-1 w-full p-2.5 rounded bg-surface-subtle border border-border font-mono text-xs text-foreground resize-none focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Pane 3: Compare Pattern A vs B */}
      {activePane === 'compare' && (
        <div className="flex-1 min-h-0 flex flex-col p-3 space-y-3 overflow-auto text-xs animate-tab-enter">
          <div>
            <label className="block text-[11px] font-semibold text-foreground-muted mb-1">
              Pattern B (Compare Target)
            </label>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-foreground-dim">/</span>
              <input
                type="text"
                value={comparePattern}
                onChange={(e) => {
                  soundFX.playKeypress();
                  onComparePatternChange(e.target.value);
                }}
                placeholder="Alternative pattern to test"
                className="flex-1 px-2.5 py-1.5 rounded bg-surface-subtle border border-border font-mono text-xs text-foreground placeholder:text-foreground-dim focus:outline-none focus:border-foreground/40"
              />
              <span className="font-mono text-foreground-dim">/</span>
              <input
                type="text"
                value={compareFlags}
                onChange={(e) => {
                  soundFX.playKeypress();
                  onCompareFlagsChange(e.target.value);
                }}
                placeholder="flags"
                className="w-14 px-2 py-1.5 rounded bg-surface-subtle border border-border font-mono text-xs text-foreground focus:outline-none"
              />
            </div>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-2 gap-2">
            {/* Pattern A Box */}
            <div className="p-2.5 rounded bg-surface-subtle border border-border space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Pattern A (Active)</span>
                <span className="font-mono text-[11px] text-emerald-400">{analysis.matchCount} matches</span>
              </div>
              <div className="font-mono text-[11px] text-foreground-muted truncate">
                /{analysis.pattern}/{analysis.flags}
              </div>
              <div className="text-[11px] text-foreground-dim pt-1 border-t border-border flex justify-between">
                <span>Complexity:</span>
                <span className="font-mono text-foreground">{analysis.complexity.timeComplexity}</span>
              </div>
              <div className="text-[11px] text-foreground-dim flex justify-between">
                <span>Execution:</span>
                <span className="font-mono text-foreground">{analysis.executionTimeMs} ms</span>
              </div>
            </div>

            {/* Pattern B Box */}
            <div className="p-2.5 rounded bg-surface-subtle border border-border space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Pattern B</span>
                <span className="font-mono text-[11px] text-sky-400">
                  {compareAnalysis ? `${compareAnalysis.matchCount} matches` : '—'}
                </span>
              </div>
              <div className="font-mono text-[11px] text-foreground-muted truncate">
                /{comparePattern || '...'}/{compareFlags}
              </div>
              <div className="text-[11px] text-foreground-dim pt-1 border-t border-border flex justify-between">
                <span>Complexity:</span>
                <span className="font-mono text-foreground">
                  {compareAnalysis ? compareAnalysis.complexity.timeComplexity : '—'}
                </span>
              </div>
              <div className="text-[11px] text-foreground-dim flex justify-between">
                <span>Execution:</span>
                <span className="font-mono text-foreground">
                  {compareAnalysis ? `${compareAnalysis.executionTimeMs} ms` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Match Diff Summary */}
          {compareAnalysis && (
            <div className="p-2.5 rounded bg-surface-elevated border border-border text-[11px] space-y-1">
              <span className="font-semibold text-foreground">Diff Verdict:</span>
              <p className="text-foreground-muted">
                {analysis.matchCount === compareAnalysis.matchCount
                  ? `Both patterns matched the exact same number of occurrences (${analysis.matchCount}).`
                  : `Pattern ${analysis.matchCount > compareAnalysis.matchCount ? 'A' : 'B'} matched more occurrences (${Math.abs(analysis.matchCount - compareAnalysis.matchCount)} more).`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
