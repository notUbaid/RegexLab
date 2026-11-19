// The pattern box, the flag switches, and any error or warning about the pattern.
import type { RefObject } from 'react';
import { AlertTriangle, Copy, XCircle } from 'lucide-react';
import { copyLabel, useCopy } from '../useCopy';

const FLAGS = [
  { flag: 'g', label: 'global', help: 'Find every match, not just the first one' },
  { flag: 'i', label: 'ignore case', help: 'Treat uppercase and lowercase letters as the same' },
  { flag: 'm', label: 'multiline', help: 'Make ^ and $ match at the start and end of every line' },
  { flag: 's', label: 'dot all', help: 'Let . match line breaks too' },
];

interface PatternInputProps {
  inputRef: RefObject<HTMLInputElement | null>;
  pattern: string;
  flags: string;
  onPatternChange: (pattern: string) => void;
  onToggleFlag: (flag: string) => void;
  error: string | null;
  warning: string | null;
}

export function PatternInput({ inputRef, pattern, flags, onPatternChange, onToggleFlag, error, warning }: PatternInputProps) {
  const { status, copy } = useCopy();

  return (
    <section className="shrink-0 space-y-2 border-b border-border bg-surface px-4 py-3">
      <label htmlFor="pattern" className="block text-xs font-medium text-foreground-dim">
        Regular expression
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <div
          className={`flex min-w-[14rem] flex-1 items-center gap-1 rounded border bg-surface-subtle px-3 py-1.5 font-mono focus-within:border-foreground/40 ${
            error ? 'border-err/60' : 'border-border'
          }`}
        >
          <span className="text-lg text-foreground-dim">/</span>
          <input
            id="pattern"
            ref={inputRef}
            value={pattern}
            onChange={(e) => onPatternChange(e.target.value)}
            placeholder="type a pattern, e.g. \d+"
            spellCheck={false}
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-foreground-dim"
          />
          <span className="text-lg text-foreground-dim">/{flags}</span>
        </div>

        <div className="flex flex-wrap gap-1" role="group" aria-label="Flags">
          {FLAGS.map(({ flag, label, help }) => {
            const on = flags.includes(flag);
            return (
              <button
                key={flag}
                onClick={() => onToggleFlag(flag)}
                aria-pressed={on}
                title={help}
                className={`rounded border px-2 py-1.5 text-xs ${
                  on
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border text-foreground-muted hover:border-foreground/40 hover:text-foreground'
                }`}
              >
                <span className="font-mono font-bold">{flag}</span> {label}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => copy(pattern)}
          className="flex items-center gap-1.5 rounded border border-border px-2 py-1.5 text-xs text-foreground-muted hover:border-foreground/40 hover:text-foreground"
          title="Copy the pattern"
        >
          <Copy className="h-3.5 w-3.5" />
          {copyLabel(status, 'Copy')}
        </button>
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-err">
          <XCircle className="h-3.5 w-3.5 shrink-0" />
          Pattern error: {error}
        </p>
      )}
      {warning && (
        <p className="flex items-center gap-1.5 text-xs text-warn">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Slow pattern: {warning}
        </p>
      )}
    </section>
  );
}
