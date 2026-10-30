import React, { useState, useRef } from 'react';
import { Copy, Check, ChevronDown, Trash2 } from 'lucide-react';
import { RegexToken, RegexAnalysisResult } from '../engine/types';
import { soundFX } from '../utils/soundEffects';

interface PatternInputProps {
  pattern: string;
  flags: string;
  onPatternChange: (pattern: string) => void;
  onToggleFlag: (flag: string) => void;
  analysis: RegexAnalysisResult;
  hoveredTokenId: string | null;
  onHoverToken: (id: string | null) => void;
  onSelectTab: (tab: string) => void;
}

const FLAGS = [
  { f: 'g', title: 'Global: match all instances' },
  { f: 'i', title: 'Ignore Case: case-insensitive matching' },
  { f: 'm', title: 'Multiline: ^ and $ match line boundaries' },
  { f: 's', title: 'DotAll: dot matches newlines' },
  { f: 'u', title: 'Unicode: enable full unicode support' },
];

export const PatternInput: React.FC<PatternInputProps> = ({
  pattern,
  flags,
  onPatternChange,
  onToggleFlag,
  analysis,
  hoveredTokenId,
  onHoverToken,
  onSelectTab,
}) => {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [copyDropdownOpen, setCopyDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const copyAs = (format: string, snippet: string) => {
    soundFX.playCopy();
    navigator.clipboard.writeText(snippet);
    setCopiedFormat(format);
    setCopyDropdownOpen(false);
    setTimeout(() => setCopiedFormat(null), 1800);
  };

  const copyFormats = [
    { label: 'JavaScript Literal', val: `/${pattern}/${flags}` },
    { label: 'JavaScript RegExp', val: `new RegExp("${pattern.replace(/\\/g, '\\\\')}", "${flags}")` },
    { label: 'Python re.compile', val: `re.compile(r"${pattern.replace(/\(\?<([a-zA-Z0-9_]+)>/g, '(?P<$1>')}")` },
    { label: 'Go regexp.MustCompile', val: `regexp.MustCompile(\`${pattern}\`)` },
    { label: 'Rust Regex::new', val: `Regex::new(r"${pattern}").unwrap()` },
  ];

  return (
    <div className="border-b border-border bg-surface px-4 py-2.5 space-y-2">
      {/* Pattern Input Bar */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-xl text-foreground-dim select-none font-light">/</span>
        
        <input
          ref={inputRef}
          type="text"
          value={pattern}
          onChange={(e) => {
            soundFX.playKeypress();
            onPatternChange(e.target.value);
          }}
          placeholder="e.g. v?(\d+)\.(\d+)\.(\d+)"
          spellCheck={false}
          className="flex-1 min-w-0 bg-transparent font-mono text-base text-foreground placeholder:text-foreground-dim focus:outline-none tracking-tight"
        />

        <span className="font-mono text-xl text-foreground-dim select-none font-light">/</span>

        {/* Flag Pills with Spring Pop & Tactile Switch Sound */}
        <div className="flex items-center gap-0.5 bg-surface-elevated/70 p-0.5 rounded border border-border select-none">
          {FLAGS.map(({ f, title }) => {
            const active = flags.includes(f);
            return (
              <button
                key={f}
                onClick={() => {
                  soundFX.playSwitch(!active);
                  onToggleFlag(f);
                }}
                title={title}
                className={`w-6 h-6 rounded font-mono text-xs flex items-center justify-center transition-all ${
                  active
                    ? 'bg-foreground text-background font-bold shadow-sm ring-1 ring-foreground/20'
                    : 'text-foreground-dim hover:text-foreground hover:bg-surface'
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* 1-Click Copy As Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              soundFX.playLatch();
              setCopyDropdownOpen(!copyDropdownOpen);
            }}
            className="flex items-center gap-1.5 h-7 px-2.5 rounded bg-surface-elevated border border-border text-xs text-foreground-muted hover:text-foreground transition-all hover:border-foreground/30"
            title="Copy as code snippet"
          >
            {copiedFormat ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedFormat ? 'Copied' : 'Copy As'}</span>
            <ChevronDown className="w-3 h-3 text-foreground-dim" />
          </button>

          {copyDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setCopyDropdownOpen(false)} />
              <div className="absolute right-0 mt-1 w-52 py-1 rounded-md bg-surface border border-border shadow-2xl z-50 animate-modal-pop">
                {copyFormats.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => copyAs(item.label, item.val)}
                    className="w-full px-3 py-1.5 text-left text-xs text-foreground-muted hover:bg-surface-elevated hover:text-foreground flex items-center justify-between transition-colors"
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Clear Pattern Button */}
        <button
          onClick={() => {
            soundFX.playLatch();
            onPatternChange('');
          }}
          className="p-1.5 rounded text-foreground-dim hover:text-rose-400 hover:bg-surface-elevated transition-colors"
          title="Clear pattern"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Syntax Error Notice if invalid */}
      {!analysis.isValid && (
        <div className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/20 animate-modal-pop">
          Syntax Error: {analysis.error}
        </div>
      )}

      {/* Tokens preview and quick status */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs select-none">
        {/* Token Chips */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
          {analysis.tokens.slice(0, 18).map((tok) => {
            const isHovered = hoveredTokenId === tok.id;
            return (
              <span
                key={tok.id}
                onMouseEnter={() => {
                  soundFX.playHoverPlink();
                  onHoverToken(tok.id);
                }}
                onMouseLeave={() => onHoverToken(null)}
                title={`${tok.title}: ${tok.explanation}`}
                className={`px-1.5 py-0.5 rounded font-mono text-[11px] cursor-pointer transition-all ${
                  isHovered
                    ? 'bg-hl text-[#1a1608] font-semibold scale-105 shadow-sm'
                    : 'bg-surface-elevated/80 text-foreground-muted hover:text-foreground hover:bg-surface-elevated'
                }`}
              >
                {tok.raw}
              </span>
            );
          })}
          {analysis.tokens.length > 18 && (
            <span className="text-[11px] text-foreground-dim font-mono">
              +{analysis.tokens.length - 18}
            </span>
          )}
        </div>

        {/* Quick status links */}
        <div className="flex items-center gap-2 font-mono text-[11px] text-foreground-dim">
          <button
            onClick={() => {
              soundFX.playTab();
              onSelectTab('debugger');
            }}
            className="hover:text-foreground underline decoration-dotted transition-colors"
            title="View Match Details"
          >
            {analysis.matchCount} {analysis.matchCount === 1 ? 'match' : 'matches'}
          </button>
          <span>·</span>
          <button
            onClick={() => {
              soundFX.playTab();
              onSelectTab('debugger');
            }}
            className="hover:text-foreground underline decoration-dotted transition-colors"
            title="View Step-by-Step Execution Trace"
          >
            {analysis.trace.length} steps ({analysis.executionTimeMs}ms)
          </button>
          <span>·</span>
          <button
            onClick={() => {
              soundFX.playTab();
              onSelectTab('performance');
            }}
            className={`hover:underline transition-colors ${
              analysis.complexity.riskLevel === 'safe'
                ? 'text-emerald-400'
                : analysis.complexity.riskLevel === 'critical'
                ? 'text-rose-400'
                : 'text-amber-400'
            }`}
            title="Inspect ReDoS Complexity & Benchmark"
          >
            {analysis.complexity.riskLevel === 'safe'
              ? 'Safe O(N)'
              : `${analysis.complexity.riskLevel.toUpperCase()} ${analysis.complexity.timeComplexity}`}
          </button>
          <span>·</span>
          <button
            onClick={() => {
              soundFX.playTab();
              onSelectTab('compatibility');
            }}
            className="hover:text-foreground transition-colors"
            title="Inspect Multi-Language Support"
          >
            JS / Py / Go / Rust
          </button>
        </div>
      </div>
    </div>
  );
};
