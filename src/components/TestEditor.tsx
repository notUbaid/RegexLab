// The test text box with live highlighting.
//
// How the highlighting works: a normal <textarea> with transparent background sits on top of a
// <div> containing the same text, where every match is wrapped in <mark>. You type into the
// textarea and see the coloured marks through it. Both layers share the .editor-text CSS class
// so every character lands in exactly the same place.
import { useRef, type ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import type { Match } from '../engine/types';

interface TestEditorProps {
  text: string;
  onTextChange: (text: string) => void;
  matches: Match[];
  /** Capture group to outline (the one hovered in the results list). */
  activeGroup: number | null;
}

export function TestEditor({ text, onTextChange, matches, activeGroup }: TestEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);
  const lineCount = text.split('\n').length;

  // The highlight layer and line numbers cannot scroll themselves, so copy the textarea's scroll.
  function syncScroll() {
    const textarea = textareaRef.current!;
    highlightRef.current!.scrollTop = textarea.scrollTop;
    highlightRef.current!.scrollLeft = textarea.scrollLeft;
    linesRef.current!.scrollTop = textarea.scrollTop;
  }

  return (
    <section className="flex h-full flex-col bg-surface">
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-border px-4 text-sm">
        <span>
          <span className="font-semibold">Test text</span>
          <span className="ml-2 text-xs text-foreground-dim">
            {lineCount} {lineCount === 1 ? 'line' : 'lines'}
          </span>
        </span>
        <button
          onClick={() => onTextChange('')}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-foreground-muted hover:bg-surface-elevated hover:text-foreground"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1">
        <div
          ref={linesRef}
          aria-hidden="true"
          className="editor-text editor-lines w-10 shrink-0 select-none overflow-hidden border-r border-border bg-surface-subtle text-right text-foreground-dim"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          <div
            ref={highlightRef}
            aria-hidden="true"
            className="editor-text highlight-layer pointer-events-none absolute inset-0 overflow-hidden text-transparent"
          >
            {renderHighlights(text, matches, activeGroup)}
            {/* A trailing newline keeps the layer as tall as the textarea when the text ends with one. */}
            {'\n'}
          </div>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            onScroll={syncScroll}
            wrap="off"
            spellCheck={false}
            aria-label="Test text"
            placeholder="Type or paste the text you want to search..."
            className="editor-text relative block h-full w-full resize-none bg-transparent outline-none placeholder:text-foreground-dim"
          />
        </div>
      </div>
    </section>
  );
}

// Splits the text into plain strings and <mark>s: one <mark> per match, with a coloured
// <mark class="capture"> inside it for each capture group.
function renderHighlights(text: string, matches: Match[], activeGroup: number | null): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;

  matches.forEach((match, i) => {
    if (match.start === match.end) return; // an empty match has nothing to colour
    nodes.push(text.slice(cursor, match.start));

    const inside: ReactNode[] = [];
    let position = match.start;
    for (const group of [...match.groups].sort((a, b) => a.start - b.start)) {
      // shortcut: a group nested in (or overlapping) an earlier one, or reaching outside the match
      // through a lookaround, is not coloured here. It is still listed in the results panel.
      if (group.start < position || group.end > match.end || group.start === group.end) continue;
      inside.push(text.slice(position, group.start));
      inside.push(
        <mark key={group.number} className={`capture g${group.number % 8} ${group.number === activeGroup ? 'active' : ''}`}>
          {group.text}
        </mark>,
      );
      position = group.end;
    }
    inside.push(text.slice(position, match.end));

    nodes.push(<mark key={i}>{inside}</mark>);
    cursor = match.end;
  });

  nodes.push(text.slice(cursor));
  return nodes;
}
