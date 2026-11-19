// Right-hand panel with two tabs: the list of matches, and a find-and-replace preview.
import { useMemo, useState } from 'react';
import { Copy } from 'lucide-react';
import type { Analysis } from '../engine/analyze';
import { MAX_MATCHES } from '../engine/matcher';
import { copyLabel, useCopy } from '../useCopy';

interface ResultsPanelProps {
  pattern: string;
  flags: string;
  text: string;
  analysis: Analysis;
  onHoverGroup: (groupNumber: number | null) => void;
}

export function ResultsPanel({ pattern, flags, text, analysis, onHoverGroup }: ResultsPanelProps) {
  const [tab, setTab] = useState<'matches' | 'replace'>('matches');
  // Kept here, not in ReplacePreview, so it survives switching tabs.
  const [replacement, setReplacement] = useState('[$&]');

  const tabButton = (id: typeof tab, label: string) => (
    <button
      onClick={() => setTab(id)}
      aria-pressed={tab === id}
      className={`rounded px-2.5 py-1 ${tab === id ? 'bg-surface-elevated font-semibold text-foreground' : 'text-foreground-muted hover:text-foreground'}`}
    >
      {label}
    </button>
  );

  return (
    <section className="flex h-full flex-col bg-surface">
      <div className="flex h-10 shrink-0 items-center gap-1 border-b border-border bg-surface-subtle px-3 text-xs">
        {tabButton('matches', `Matches (${analysis.matches.length})`)}
        {tabButton('replace', 'Replace')}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto text-xs">
        {tab === 'matches' ? (
          <MatchList pattern={pattern} analysis={analysis} onHoverGroup={onHoverGroup} />
        ) : (
          <ReplacePreview
            pattern={pattern}
            flags={flags}
            text={text}
            hasError={analysis.error !== null}
            replacement={replacement}
            onReplacementChange={setReplacement}
          />
        )}
      </div>
    </section>
  );
}

interface MatchListProps {
  pattern: string;
  analysis: Analysis;
  onHoverGroup: (groupNumber: number | null) => void;
}

function MatchList({ pattern, analysis, onHoverGroup }: MatchListProps) {
  if (pattern === '') {
    return <EmptyState title="No pattern yet" detail="Type a pattern in the box above, or click Examples to load one." />;
  }
  if (analysis.error) {
    return <EmptyState title="The pattern has an error" detail="Fix it in the box above to see matches." />;
  }
  if (analysis.matches.length === 0) {
    return (
      <EmptyState
        title="No matches"
        detail="Check the pattern against the text. The i flag (ignore case) or m flag (multiline) often helps."
      />
    );
  }

  return (
    <ol>
      {analysis.matches.map((match, i) => (
        <li key={i} className="border-b border-border px-3 py-2.5">
          <div className="mb-1 flex justify-between text-foreground-dim">
            <span className="font-semibold text-foreground">Match {i + 1}</span>
            <span title="Character positions in the test text (start to end)">
              {match.start}–{match.end}
            </span>
          </div>
          <code className="block whitespace-pre-wrap break-words rounded bg-surface-subtle px-2 py-1">
            {match.text || <span className="text-foreground-dim">(empty match)</span>}
          </code>
          {match.groups.length > 0 && (
            <ul className="mt-1.5 space-y-0.5">
              {match.groups.map((group) => (
                <li
                  key={group.number}
                  onMouseEnter={() => onHoverGroup(group.number)}
                  onMouseLeave={() => onHoverGroup(null)}
                  className={`g${group.number % 8} flex items-center gap-2 rounded px-1 py-0.5 hover:bg-surface-elevated`}
                >
                  <span className="group-swatch h-2 w-2 shrink-0 rounded-full" />
                  <span className="shrink-0 text-foreground-muted">{group.name ? `${group.name} (group ${group.number})` : `Group ${group.number}`}</span>
                  <code className="min-w-0 break-words">{group.text}</code>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
      {analysis.matches.length === MAX_MATCHES && (
        <li className="px-3 py-2 text-foreground-dim">RegexLab lists at most {MAX_MATCHES} matches.</li>
      )}
    </ol>
  );
}

interface ReplacePreviewProps {
  pattern: string;
  flags: string;
  text: string;
  hasError: boolean;
  replacement: string;
  onReplacementChange: (value: string) => void;
}

function ReplacePreview({ pattern, flags, text, hasError, replacement, onReplacementChange }: ReplacePreviewProps) {
  const { status, copy } = useCopy();

  // String.replace understands $1, $2 (groups), $<name> (named groups) and $& (the whole match).
  const output = useMemo(() => {
    if (!pattern || hasError) return text;
    return text.replace(new RegExp(pattern, flags), replacement);
  }, [pattern, flags, text, replacement, hasError]);

  return (
    <div className="space-y-3 p-3">
      <label className="block space-y-1">
        <span className="font-semibold">Replace each match with</span>
        <input
          value={replacement}
          onChange={(e) => onReplacementChange(e.target.value)}
          spellCheck={false}
          className="w-full rounded border border-border bg-surface-subtle px-2.5 py-1.5 font-mono outline-none focus:border-foreground/40"
        />
      </label>
      <p className="text-foreground-dim">
        <code className="text-foreground">$&amp;</code> is the whole match, <code className="text-foreground">$1</code>,{' '}
        <code className="text-foreground">$2</code> are capture groups.
        {!flags.includes('g') && ' Only the first match is replaced until you turn on the g flag.'}
      </p>
      <div className="flex items-center justify-between">
        <span className="font-semibold">Result</span>
        <button onClick={() => copy(output)} className="flex items-center gap-1 text-foreground-muted hover:text-foreground">
          <Copy className="h-3.5 w-3.5" />
          {copyLabel(status, 'Copy')}
        </button>
      </div>
      <pre className="whitespace-pre-wrap break-words rounded border border-border bg-surface-subtle p-2.5 font-mono">{output}</pre>
    </div>
  );
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
      <p className="mb-1 font-semibold">{title}</p>
      <p className="max-w-xs text-foreground-dim">{detail}</p>
    </div>
  );
}
