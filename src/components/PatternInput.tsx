// The pattern box, the flag switches, and one status line under them:
// the error, the slow-pattern warning, or how many matches were found.
import type { RefObject } from 'react';
import { AlertTriangle, Check, Copy, XCircle } from 'lucide-react';
import { useCopy } from '../useCopy';
import { Tip } from './Tip';

const FLAGS = [
  { flag: 'g', label: 'global', help: 'Find every match. When off, only the first match is found.' },
  { flag: 'i', label: 'ignore case', help: 'Treat uppercase and lowercase as the same, so "a" also matches "A".' },
  { flag: 'm', label: 'multiline', help: '^ and $ match at the start and end of every line, not only of the whole text.' },
  { flag: 's', label: 'dot all', help: 'Let . match line breaks too.' },
];

interface PatternInputProps {
  inputRef: RefObject<HTMLInputElement | null>;
  pattern: string;
  flags: string;
  onPatternChange: (pattern: string) => void;
  onToggleFlag: (flag: string) => void;
  error: string | null;
  warning: string | null;
  matchCount: number;
}

export function PatternInput(props: PatternInputProps) {
  const { inputRef, pattern, flags, onPatternChange, onToggleFlag, error, warning, matchCount } = props;
  const { status, copy } = useCopy();

  return (
    <section className="shrink-0 border-b border-border bg-surface px-4 pb-2 pt-3">
      <label htmlFor="pattern" className="mb-1.5 block text-xs font-medium text-foreground-muted">
        Regular expression
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <div
          className={`flex min-w-[14rem] flex-1 items-center gap-1 rounded-md border bg-surface-subtle py-1.5 pl-3 pr-1.5 font-mono focus-within:border-foreground/40 ${
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
          <Tip text={status === 'failed' ? 'Copy failed' : 'Copy the pattern'} alignRight>
            <button
              onClick={() => copy(pattern)}
              aria-label="Copy the pattern"
              className="ml-1 rounded p-1.5 text-foreground-dim hover:bg-surface-elevated hover:text-foreground"
            >
              {status === 'copied' ? <Check className="h-4 w-4 text-ok" /> : <Copy className="h-4 w-4" />}
            </button>
          </Tip>
        </div>

        <div className="flex gap-1" role="group" aria-label="Flags">
          {FLAGS.map(({ flag, label, help }) => {
            const on = flags.includes(flag);
            return (
              <Tip key={flag} text={help} alignRight>
                <button
                  onClick={() => onToggleFlag(flag)}
                  aria-pressed={on}
                  className={`rounded-md border px-2 py-1.5 text-xs ${
                    on
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border text-foreground-muted hover:border-foreground/40 hover:text-foreground'
                  }`}
                >
                  <span className="font-mono font-bold">{flag}</span> {label}
                </button>
              </Tip>
            );
          })}
        </div>
      </div>

      <div className="mt-1.5 min-h-[1.25rem] space-y-1 text-xs">
        {error && (
          <p className="flex items-center gap-1.5 text-err">
            <XCircle className="h-3.5 w-3.5 shrink-0" />
            Pattern error: {error}
          </p>
        )}
        {warning && (
          <p className="flex items-center gap-1.5 text-warn">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            Slow pattern: {warning}
          </p>
        )}
        {!error && !warning && <p className="text-foreground-dim">{summary(pattern, matchCount)}</p>}
      </div>
    </section>
  );
}

function summary(pattern: string, matchCount: number): string {
  if (pattern === '') return 'Type a pattern to start, or pick one from Examples.';
  if (matchCount === 0) return 'No matches in the text yet.';
  if (matchCount === 1) return '1 match, highlighted in the text.';
  return `${matchCount} matches, highlighted in the text.`;
}
