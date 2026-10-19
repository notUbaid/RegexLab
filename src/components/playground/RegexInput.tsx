import React, { useRef } from 'react';
import { useRegexStore } from '../../store/useRegexStore';
import { tokenizeRegex } from '../../parser/tokenizer';
import { Copy, Trash2, Check, AlertCircle, Sparkles } from 'lucide-react';

export const RegexInput: React.FC = () => {
  const { pattern, flags, setPattern, toggleFlag, hoveredTokenId, setHoveredTokenId, getMatches } = useRegexStore();
  const [copied, setCopied] = React.useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const analysis = getMatches();
  const tokens = tokenizeRegex(pattern);

  const availableFlags = [
    { flag: 'g', label: 'Global', title: 'Matches all occurrences instead of stopping after the first' },
    { flag: 'i', label: 'Insensitive', title: 'Case-insensitive matching' },
    { flag: 'm', label: 'Multiline', title: '^ and $ match start and end of every line' },
    { flag: 's', label: 'Dot All', title: 'Wildcard dot (.) matches newlines too' },
    { flag: 'u', label: 'Unicode', title: 'Treat pattern as a sequence of Unicode code points' },
  ];

  const quickInsertTokens = [
    { label: '\\d', token: '\\d', title: 'Digit [0-9]' },
    { label: '\\w', token: '\\w', title: 'Word char [a-zA-Z0-9_]' },
    { label: '\\s', token: '\\s', title: 'Whitespace' },
    { label: '[a-z]', token: '[a-z]', title: 'Character set' },
    { label: '(...)', token: '(.*)', title: 'Capture group' },
    { label: 'a|b', token: 'a|b', title: 'Alternation' },
    { label: '^', token: '^', title: 'Start of line' },
    { label: '$', token: '$', title: 'End of line' },
    { label: '+', token: '+', title: 'One or more' },
    { label: '*', token: '*', title: 'Zero or more' },
    { label: '?', token: '?', title: 'Optional' },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(`/${pattern}/${flags}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickInsert = (insertStr: string) => {
    if (inputRef.current) {
      const start = inputRef.current.selectionStart || pattern.length;
      const end = inputRef.current.selectionEnd || pattern.length;
      const newPattern = pattern.slice(0, start) + insertStr + pattern.slice(end);
      setPattern(newPattern);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(start + insertStr.length, start + insertStr.length);
        }
      }, 0);
    } else {
      setPattern(pattern + insertStr);
    }
  };

  return (
    <div className="space-y-2.5">
      {/* Top Label & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-foreground-muted flex items-center gap-1.5">
            Regular Expression
          </label>
          {analysis.isValid ? (
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Valid Syntax
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-950/30 border border-rose-800/40 px-2 py-0.5 rounded-full" title={analysis.error}>
              <AlertCircle className="w-3 h-3" /> Syntax Error
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-elevated text-xs transition-colors flex items-center gap-1"
            title="Copy /pattern/flags"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={() => setPattern('')}
            className="p-1.5 rounded-lg text-foreground-muted hover:text-rose-400 hover:bg-rose-950/20 text-xs transition-colors"
            title="Clear Pattern"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Pattern Bar */}
      <div className="relative flex items-center rounded-2xl bg-surface-subtle border border-border-subtle focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 shadow-inner transition-all duration-300">
        <span className="pl-4 pr-1 text-primary/70 font-mono text-lg font-bold select-none">/</span>
        
        <input
          ref={inputRef}
          type="text"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="e.g. ^(?=.*[A-Z])(?=.*\d).{8,}$"
          spellCheck={false}
          className="flex-1 py-3 px-2 bg-transparent text-sm font-mono text-foreground placeholder:text-foreground-dim focus:outline-none tracking-wide"
        />

        <span className="px-1 text-primary/70 font-mono text-lg font-bold select-none">/</span>

        {/* Inline Flags Toggles */}
        <div className="flex items-center gap-0.5 pr-2.5">
          {availableFlags.map(({ flag, label, title }) => {
            const active = flags.includes(flag);
            return (
              <button
                key={flag}
                onClick={() => toggleFlag(flag)}
                title={`${label} (/${flag}/): ${title}`}
                className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all duration-150 flex items-center justify-center ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm scale-105'
                    : 'text-foreground-dim hover:text-foreground hover:bg-surface-elevated'
                }`}
              >
                {flag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Token Glow Ribbon & Quick Insert */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        {/* Token interactive pill previews */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-[70%] py-0.5 scrollbar-none">
          {tokens.slice(0, 15).map((tok) => {
            const isHovered = hoveredTokenId === tok.id;
            return (
              <span
                key={tok.id}
                onMouseEnter={() => setHoveredTokenId(tok.id)}
                onMouseLeave={() => setHoveredTokenId(null)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-mono cursor-pointer transition-all ${
                  isHovered
                    ? 'bg-primary text-primary-foreground font-bold shadow-glow-primary scale-105 ring-1 ring-primary'
                    : 'bg-surface-elevated/70 hover:bg-surface-elevated text-foreground-muted hover:text-foreground border border-border-subtle'
                }`}
                title={`${tok.title}: ${tok.humanExplanation}`}
              >
                {tok.raw}
              </span>
            );
          })}
          {tokens.length > 15 && (
            <span className="text-[10px] text-foreground-dim font-mono">+{tokens.length - 15} more</span>
          )}
        </div>

        {/* Quick Insert Tokens */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-foreground-dim font-medium mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary" /> Insert:
          </span>
          {quickInsertTokens.slice(0, 6).map((item) => (
            <button
              key={item.label}
              onClick={() => handleQuickInsert(item.token)}
              title={item.title}
              className="px-1.5 py-0.5 rounded bg-surface-elevated hover:bg-primary/20 text-foreground-muted hover:text-primary text-[10px] font-mono border border-border-subtle transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
