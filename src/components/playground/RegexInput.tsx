import React, { useRef, useState } from 'react';
import { useRegexStore } from '../../store/useRegexStore';
import { tokenizeRegex } from '../../parser/tokenizer';
import { Copy, Trash2, Check } from 'lucide-react';

const FLAGS = [
  { f: 'g', t: 'Global: every match, not just the first' }, { f: 'i', t: 'Ignore case' },
  { f: 'm', t: 'Multiline: ^ and $ match at each line' }, { f: 's', t: 'Dot matches newlines' }, { f: 'u', t: 'Unicode mode' },
];
const INSERT: [string, string][] = [['\\d', 'Digit'], ['\\w', 'Word character'], ['\\s', 'Whitespace'], ['[a-z]', 'Character set'], ['(.*)', 'Capture group'], ['a|b', 'Either / or']];

/** The pattern is the headline of the page. */
export const RegexInput: React.FC = () => {
  const { pattern, flags, setPattern, toggleFlag, hoveredTokenId, setHoveredTokenId, getMatches } = useRegexStore();
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const a = getMatches();
  const tokens = tokenizeRegex(pattern);

  const insert = (str: string) => {
    const el = ref.current; const s = el?.selectionStart ?? pattern.length; const e = el?.selectionEnd ?? pattern.length;
    setPattern(pattern.slice(0, s) + str + pattern.slice(e));
    requestAnimationFrame(() => { el?.focus(); el?.setSelectionRange(s + str.length, s + str.length); });
  };
  const copy = () => { navigator.clipboard.writeText(`/${pattern}/${flags}`); setCopied(true); setTimeout(() => setCopied(false), 1600); };
  const ghost = 'p-1.5 rounded-md text-foreground-dim hover:text-foreground hover:bg-surface-elevated transition-colors';

  return (
    <section aria-label="Pattern">
      <div className="group flex items-baseline gap-2 pt-2">
        <span className="font-mono text-4xl sm:text-5xl text-foreground-dim select-none">/</span>
        <input ref={ref} value={pattern} onChange={(e) => setPattern(e.target.value)} spellCheck={false} aria-label="Regular expression" placeholder="type a pattern"
          className="flex-1 min-w-0 bg-transparent font-mono text-[26px] sm:text-[34px] leading-tight tracking-tight text-foreground placeholder:text-foreground-dim/60 focus:outline-none" />
        <span className="font-mono text-4xl sm:text-5xl text-foreground-dim select-none">/</span>
        <div className="flex items-center gap-0.5 self-center" role="group" aria-label="Flags">
          {FLAGS.map(({ f, t }) => (
            <button key={f} title={t} aria-pressed={flags.includes(f)} onClick={() => toggleFlag(f)}
              className={`w-8 h-8 rounded-md font-mono text-[15px] transition-colors ${flags.includes(f) ? 'bg-primary text-primary-foreground font-semibold' : 'text-foreground-dim hover:text-foreground hover:bg-surface-elevated'}`}>{f}</button>
          ))}
        </div>
      </div>
      <div className="relative h-px bg-border mt-2">
        <span className={`absolute left-0 -top-px h-[3px] transition-[width] duration-500 ease-smooth ${a.isValid ? 'bg-hl w-full' : 'bg-accent-rose w-full'}`} style={{ opacity: pattern ? 1 : 0.25 }} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 mt-3 min-h-8">
        {a.isValid ? (
          <div className="flex items-center gap-1 min-w-0 overflow-x-auto scrollbar-none" aria-label="Pattern parts">
            {tokens.slice(0, 20).map((tok) => (
              <span key={tok.id} onMouseEnter={() => setHoveredTokenId(tok.id)} onMouseLeave={() => setHoveredTokenId(null)} title={`${tok.title}: ${tok.humanExplanation}`}
                className={`px-1.5 py-0.5 rounded font-mono text-xs cursor-default transition-colors ${hoveredTokenId === tok.id ? 'swipe text-foreground' : 'text-foreground-muted hover:text-foreground'}`}>{tok.raw}</span>
            ))}
            {tokens.length > 20 && <span className="text-xs text-foreground-dim font-mono">+{tokens.length - 20}</span>}
          </div>
        ) : (
          <p className="text-[13px] text-accent-rose font-mono truncate" role="alert">{a.error || 'This pattern is not valid'}</p>
        )}
        <div className="flex items-center gap-0.5 text-xs text-foreground-dim">
          <span className="mr-1.5">Insert</span>
          {INSERT.map(([s, t]) => (<button key={s} title={t} onClick={() => insert(s)} className="px-1.5 py-1 rounded font-mono text-foreground-muted hover:text-foreground hover:bg-surface-elevated transition-colors">{s}</button>))}
          <span className="w-px h-4 bg-border mx-2" />
          <button className={ghost} onClick={copy} aria-label="Copy pattern" title="Copy /pattern/flags">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</button>
          <button className={ghost} onClick={() => setPattern('')} aria-label="Clear pattern" title="Clear"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
    </section>
  );
};
