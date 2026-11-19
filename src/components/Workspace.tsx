// The main (and only) screen. It owns all the state, runs the regex analysis once per change,
// and hands the result to the panels below. The panels themselves hold almost no state.
import { useEffect, useMemo, useRef, useState } from 'react';
import { analyze } from '../engine/analyze';
import { useCopy } from '../useCopy';
import { Header } from './Header';
import { PatternInput } from './PatternInput';
import { TestEditor } from './TestEditor';
import { ResultsPanel } from './ResultsPanel';
import { ExamplesModal } from './ExamplesModal';
import { CheatsheetModal } from './CheatsheetModal';
import { PracticeModal } from './PracticeModal';

const DEFAULT_PATTERN = '(\\d{4})-(\\d{2})-(\\d{2})';
const DEFAULT_FLAGS = 'g';
const DEFAULT_TEXT = `Invoice sent on 2026-03-14 and paid on 2026-04-02.
Next review is booked for 2026-12-01.
This line has no date, so nothing here is highlighted.`;

// The flags the UI can toggle. Anything else in a shared link is dropped.
const SUPPORTED_FLAGS = 'gims';

// A shared link carries the pattern, flags and text in the URL: ?p=...&f=...&t=...
function readSharedLink() {
  const params = new URLSearchParams(window.location.search);

  // Keep each supported flag once, so a hand-edited link like ?f=ggx becomes "g".
  let flags = '';
  for (const flag of params.get('f') ?? DEFAULT_FLAGS) {
    if (SUPPORTED_FLAGS.includes(flag) && !flags.includes(flag)) flags += flag;
  }

  return {
    pattern: params.get('p') ?? DEFAULT_PATTERN,
    flags,
    text: params.get('t') ?? DEFAULT_TEXT,
  };
}

function loadTheme(): string {
  try {
    const saved = localStorage.getItem('regexlab-theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // Storage can be blocked (e.g. some private windows). Fall back to the system setting.
  }
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

type HelperWindow = 'examples' | 'cheatsheet' | 'practice' | null;

export function Workspace() {
  const [initial] = useState(readSharedLink); // read the URL once, on the first render
  const [pattern, setPattern] = useState(initial.pattern);
  const [flags, setFlags] = useState(initial.flags);
  const [text, setText] = useState(initial.text);
  const [openWindow, setOpenWindow] = useState<HelperWindow>(null);
  const [activeGroup, setActiveGroup] = useState<number | null>(null);
  const [theme, setTheme] = useState(loadTheme);
  const patternInputRef = useRef<HTMLInputElement>(null);
  const share = useCopy();

  // Everything the panels show comes from this one call.
  const analysis = useMemo(() => analyze(pattern, flags, text), [pattern, flags, text]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Saved only when the user picks a theme, so until then the app keeps following the system setting.
  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem('regexlab-theme', next);
    } catch {
      // Not saving the theme is fine.
    }
  }

  function toggleFlag(flag: string) {
    setFlags((current) => (current.includes(flag) ? current.replace(flag, '') : current + flag));
  }

  // Inserts a cheatsheet token where the cursor was in the pattern box, not just at the end.
  function insertIntoPattern(snippet: string) {
    const input = patternInputRef.current;
    const from = input?.selectionStart ?? pattern.length;
    const to = input?.selectionEnd ?? pattern.length;
    setPattern(pattern.slice(0, from) + snippet + pattern.slice(to));
    setOpenWindow(null);
    // Wait for React to update the input, then put the cursor after the inserted text.
    requestAnimationFrame(() => {
      input?.focus();
      input?.setSelectionRange(from + snippet.length, from + snippet.length);
    });
  }

  function loadIntoEditor(newPattern: string, newFlags: string, newText: string) {
    setPattern(newPattern);
    setFlags(newFlags);
    setText(newText);
    setOpenWindow(null);
  }

  function copyShareLink() {
    const params = new URLSearchParams({ p: pattern, f: flags, t: text });
    share.copy(`${window.location.origin}${window.location.pathname}?${params}`);
  }

  return (
    // overflow-x-clip: a hidden tooltip near the edge of a very narrow phone must not make the page scroll sideways.
    <div className="flex min-h-screen flex-col overflow-x-clip bg-background text-foreground md:h-screen md:overflow-hidden">
      <Header
        onOpenExamples={() => setOpenWindow('examples')}
        onOpenCheatsheet={() => setOpenWindow('cheatsheet')}
        onOpenPractice={() => setOpenWindow('practice')}
        theme={theme}
        onToggleTheme={toggleTheme}
        onShare={copyShareLink}
        shareStatus={share.status}
      />

      <PatternInput
        inputRef={patternInputRef}
        pattern={pattern}
        flags={flags}
        onPatternChange={setPattern}
        onToggleFlag={toggleFlag}
        error={analysis.error}
        warning={analysis.warning}
        matchCount={analysis.matches.length}
      />

      <main className="flex flex-1 flex-col md:min-h-0 md:flex-row">
        <div className="h-80 md:h-auto md:min-w-0 md:flex-1">
          <TestEditor text={text} onTextChange={setText} matches={analysis.matches} activeGroup={activeGroup} />
        </div>
        <div className="h-[28rem] border-t border-border md:h-auto md:w-[420px] md:border-l md:border-t-0 lg:w-[460px]">
          <ResultsPanel
            pattern={pattern}
            flags={flags}
            text={text}
            analysis={analysis}
            onHoverGroup={setActiveGroup}
          />
        </div>
      </main>

      {openWindow === 'examples' && (
        <ExamplesModal
          onClose={() => setOpenWindow(null)}
          onLoad={(example) => loadIntoEditor(example.pattern, example.flags, example.sample.join('\n'))}
        />
      )}
      {openWindow === 'cheatsheet' && <CheatsheetModal onClose={() => setOpenWindow(null)} onInsert={insertIntoPattern} />}
      {openWindow === 'practice' && <PracticeModal onClose={() => setOpenWindow(null)} onTryInEditor={loadIntoEditor} />}
    </div>
  );
}
