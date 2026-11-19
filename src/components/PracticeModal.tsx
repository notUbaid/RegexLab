// "Practice" window: pick an exercise, type a pattern, and every check updates as you type.
// Solved exercises are remembered in localStorage.
import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { CHALLENGES, type Challenge } from '../data/challenges';
import { Modal } from './Modal';

const STORAGE_KEY = 'regexlab-solved';

function loadSolved(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(saved) ? saved : []; // ignore anything that isn't a list
  } catch {
    return [];
  }
}

// Returns null while the box is empty or the pattern is invalid.
function compile(pattern: string): RegExp | null {
  if (!pattern) return null;
  try {
    return new RegExp(pattern);
  } catch {
    return null;
  }
}

function isSolvedBy(challenge: Challenge, regex: RegExp | null) {
  return (
    regex !== null &&
    challenge.mustMatch.every((text) => regex.test(text)) &&
    !challenge.mustNotMatch.some((text) => regex.test(text))
  );
}

interface PracticeModalProps {
  onClose: () => void;
  onTryInEditor: (pattern: string, flags: string, text: string) => void;
}

export function PracticeModal({ onClose, onTryInEditor }: PracticeModalProps) {
  const [index, setIndex] = useState(0);
  const [attempt, setAttempt] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [solved, setSolved] = useState(loadSolved);

  const challenge = CHALLENGES[index];
  const regex = compile(attempt);
  const isInvalid = attempt !== '' && regex === null;
  const passed = isSolvedBy(challenge, regex);

  function choose(i: number) {
    setIndex(i);
    setAttempt('');
    setShowHint(false);
    setShowSolution(false);
  }

  function updateAttempt(value: string) {
    setAttempt(value);
    if (isSolvedBy(challenge, compile(value)) && !solved.includes(challenge.title)) {
      const next = [...solved, challenge.title];
      setSolved(next);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Progress just won't be remembered.
      }
    }
  }

  return (
    <Modal title={`Practice (${solved.length} of ${CHALLENGES.length} solved)`} onClose={onClose} wide>
      <div className="grid min-h-0 flex-1 md:grid-cols-[220px_1fr]">
        <ol className="max-h-40 overflow-y-auto border-b border-border bg-surface-subtle p-2 md:max-h-none md:border-b-0 md:border-r">
          {CHALLENGES.map((c, i) => (
            <li key={c.title}>
              <button
                onClick={() => choose(i)}
                className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm ${
                  i === index ? 'bg-surface-elevated font-semibold' : 'text-foreground-muted hover:bg-surface hover:text-foreground'
                }`}
              >
                <span>
                  {c.title}
                  <span className="block text-xs font-normal text-foreground-dim">{c.level}</span>
                </span>
                {solved.includes(c.title) && <Check className="h-4 w-4 shrink-0 text-ok" aria-label="solved" />}
              </button>
            </li>
          ))}
        </ol>

        <div className="space-y-4 overflow-y-auto p-4 text-sm">
          <div>
            <h3 className="text-base font-semibold">{challenge.title}</h3>
            <p className="mt-1 text-foreground-muted">{challenge.task}</p>
          </div>

          <label className="block space-y-1">
            <span className="text-xs font-medium text-foreground-dim">Your pattern</span>
            <span
              className={`flex items-center gap-1 rounded border bg-surface-subtle px-3 py-2 font-mono focus-within:border-foreground/40 ${
                isInvalid ? 'border-err/60' : 'border-border'
              }`}
            >
              <span className="text-foreground-dim">/</span>
              <input
                autoFocus
                aria-label="Your pattern"
                value={attempt}
                onChange={(e) => updateAttempt(e.target.value)}
                spellCheck={false}
                autoComplete="off"
                placeholder="type here"
                className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-foreground-dim"
              />
              <span className="text-foreground-dim">/</span>
            </span>
            {isInvalid && <span className="block text-xs text-err">This is not a valid pattern yet.</span>}
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <CheckList title="Should match" texts={challenge.mustMatch} regex={regex} wantMatch />
            <CheckList title="Should NOT match" texts={challenge.mustNotMatch} regex={regex} wantMatch={false} />
          </div>

          {passed && <p className="font-semibold text-ok">Solved! Every check passes.</p>}

          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3 text-xs">
            <button onClick={() => setShowHint(!showHint)} className="rounded border border-border px-2.5 py-1.5 hover:border-foreground/40">
              {showHint ? 'Hide hint' : 'Show hint'}
            </button>
            <button onClick={() => setShowSolution(!showSolution)} className="rounded border border-border px-2.5 py-1.5 hover:border-foreground/40">
              {showSolution ? 'Hide answer' : 'Show answer'}
            </button>
            <button
              onClick={() => onTryInEditor(attempt, 'gm', [...challenge.mustMatch, ...challenge.mustNotMatch].join('\n'))}
              disabled={!attempt}
              className="ml-auto rounded bg-foreground px-3 py-1.5 font-semibold text-background disabled:opacity-40"
              title="Open your pattern and these test lines in the main editor"
            >
              Try it in the editor
            </button>
          </div>
          {showHint && <p className="rounded bg-surface-elevated p-2.5 text-xs">{challenge.hint}</p>}
          {showSolution && (
            <p className="rounded bg-surface-elevated p-2.5 text-xs">
              One answer: <code className="font-bold">{challenge.solution}</code>
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}

function CheckList({ title, texts, regex, wantMatch }: { title: string; texts: string[]; regex: RegExp | null; wantMatch: boolean }) {
  return (
    <div>
      <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-foreground-dim">{title}</h4>
      <ul className="space-y-1">
        {texts.map((text) => {
          // Grey until the learner has typed a valid pattern, then green (correct) or red (wrong).
          const correct = regex === null ? null : regex.test(text) === wantMatch;
          return (
            <li
              key={text}
              className={`flex items-center justify-between gap-2 rounded border px-2 py-1 font-mono text-xs ${
                correct === null ? 'border-border' : correct ? 'border-ok/40 text-ok' : 'border-err/40 text-err'
              }`}
            >
              <span className="truncate whitespace-pre">{text}</span>
              {correct === true && <Check className="h-3.5 w-3.5 shrink-0" aria-label="correct" />}
              {correct === false && <X className="h-3.5 w-3.5 shrink-0" aria-label="wrong" />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
