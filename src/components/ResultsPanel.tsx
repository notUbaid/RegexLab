// Right-hand panel with three tabs: what the pattern means, the list of matches,
// and a find-and-replace preview.
import { useMemo, useState } from 'react';
import { Copy } from 'lucide-react';
import type { Analysis } from '../engine/analyze';
import { MAX_MATCHES } from '../engine/matcher';
import { copyLabel, useCopy } from '../useCopy';
import { ExplanationPanel } from './ExplanationPanel';
import { Tip } from './Tip';

type Tab = 'explanation' | 'matches' | 'replace';

interface ResultsPanelProps {
  pattern: string;
  flags: string;
  text: string;
  analysis: Analysis;
  onHoverGroup: (groupNumber: number | null) => void;
}

export function ResultsPanel({ pattern, flags, text, analysis, onHoverGroup }: ResultsPanelProps) {
  const [tab, setTab] = useState<Tab>('explanation');
  // Kept here, not in ReplacePreview, so it survives switching tabs.
  const [replacement, setReplacement] = useState('[$&]');

  function tabButton(id: Tab, label: string) {
    return (
      <button
        onClick={() => setTab(id)}
        aria-pressed={tab === id}
        className={`rounded-md px-3 py-1 ${
          tab === id ? 'bg-surface-elevated font-semibold text-foreground' : 'text-foreground-muted hover:text-foreground'
        }`}
      >
        {label}
      </button>
    );
  }

  return (
    <section className="flex h-full flex-col bg-surface">
      <div className="flex h-11 shrink-0 items-center gap-1 border-b border-border px-3 text-sm">
        {tabButton('explanation', 'Explanation')}
        {tabButton('matches', `Matches (${analysis.matches.length})`)}
        {tabButton('replace', 'Replace')}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto text-sm">
        {tab === 'explanation' && <ExplanationPanel tokens={analysis.tokens} />}
        {tab === 'matches' && <MatchList pattern={pattern} analysis={analysis} onHoverGroup={onHoverGroup} />}
        {tab === 'replace' && (
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

  const hasGroups = analysis.matches.some((match) => match.groups.length > 0);

  return (
    <div>
      {hasGroups && <p className="px-4 pt-3 text-xs text-foreground-dim">Hover a group to outline it in the text.</p>}
      <ol>
        {analysis.matches.map((match, i) => (
          <li key={i} className="border-b border-border px-4 py-3">
            <div className="flex items-baseline gap-3">
              <Tip text={`Starts at character ${match.start} and ends before character ${match.end} (counting from 0).`}>
                <span className="shrink-0 cursor-default text-xs font-semibold text-foreground-muted">Match {i + 1}</span>
              </Tip>
              <code className="min-w-0 whitespace-pre-wrap break-words">
                {match.text || <span className="text-foreground-dim">(empty match)</span>}
              </code>
            </div>
            {match.groups.length > 0 && (
              <ul className="mt-1.5 space-y-0.5">
                {match.groups.map((group) => (
                  <li
                    key={group.number}
                    onMouseEnter={() => onHoverGroup(group.number)}
                    onMouseLeave={() => onHoverGroup(null)}
                    className={`g${group.number % 8} flex items-center gap-2 rounded px-1.5 py-0.5 hover:bg-surface-elevated`}
                  >
                    <span className="group-swatch h-2 w-2 shrink-0 rounded-full" />
                    <span className="shrink-0 text-xs text-foreground-muted">
                      {group.name ? `${group.name} (group ${group.number})` : `Group ${group.number}`}
                    </span>
                    <code className="min-w-0 break-words">{group.text}</code>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
        {analysis.matches.length === MAX_MATCHES && (
          <li className="px-4 py-3 text-foreground-dim">RegexLab lists at most {MAX_MATCHES} matches.</li>
        )}
      </ol>
    </div>
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
    <div className="space-y-3 p-4">
      <label className="block space-y-1.5">
        <span className="font-semibold">Replace each match with</span>
        <input
          value={replacement}
          onChange={(e) => onReplacementChange(e.target.value)}
          spellCheck={false}
          className="w-full rounded-md border border-border bg-surface-subtle px-2.5 py-1.5 font-mono outline-none focus:border-foreground/40"
        />
      </label>
      <p className="text-xs text-foreground-dim">
        <code className="text-foreground">$&amp;</code> is the whole match, <code className="text-foreground">$1</code>,{' '}
        <code className="text-foreground">$2</code> are capture groups.
        {!flags.includes('g') && ' Only the first match is replaced until you turn on the g flag.'}
      </p>
      <div className="flex items-center justify-between">
        <span className="font-semibold">Result</span>
        <button onClick={() => copy(output)} className="flex items-center gap-1 text-xs text-foreground-muted hover:text-foreground">
          <Copy className="h-3.5 w-3.5" />
          {copyLabel(status, 'Copy')}
        </button>
      </div>
      <pre className="whitespace-pre-wrap break-words rounded-md border border-border bg-surface-subtle p-3 font-mono text-xs leading-relaxed">
        {output}
      </pre>
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
