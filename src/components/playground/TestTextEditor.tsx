import React, { useRef } from 'react';
import { useRegexStore } from '../../store/useRegexStore';
import { RegexMatch } from '../../types/regex';
import { FileText, Clock, Hash, CheckCircle2 } from 'lucide-react';

export const TestTextEditor: React.FC = () => {
  const { testText, setTestText, getMatches, hoveredGroupIndex, setHoveredGroupIndex } = useRegexStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const analysis = getMatches();

  const handleScroll = () => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  /**
   * Renders the highlighted HTML overlay behind the textarea.
   * Chunks text into un-matched sections and matched sections with group tags.
   */
  const renderHighlights = () => {
    if (!analysis.isValid || analysis.matches.length === 0 || !testText) {
      return <span>{testText}</span>;
    }

    const segments: React.ReactNode[] = [];
    let lastIndex = 0;

    analysis.matches.forEach((match: RegexMatch, mIdx: number) => {
      // Any text prior to this match
      if (match.start > lastIndex) {
        segments.push(
          <span key={`text-${lastIndex}`}>{testText.slice(lastIndex, match.start)}</span>
        );
      }

      // Check if this match has sub-groups
      if (match.groups.length > 0) {
        let groupLastIndex = match.start;
        const groupElements: React.ReactNode[] = [];

        match.groups.forEach((group, gIdx) => {
          if (group.start > groupLastIndex) {
            groupElements.push(
              <span key={`g-inter-${groupLastIndex}`}>
                {testText.slice(groupLastIndex, group.start)}
              </span>
            );
          }

          const isHovered = hoveredGroupIndex === group.index;
          const groupColorClass = `group-highlight-${group.index % 8}`;

          groupElements.push(
            <mark
              key={`grp-${mIdx}-${gIdx}`}
              className={`rounded-none font-mono transition-all text-transparent ${groupColorClass} ${
                isHovered ? 'ring-2 ring-primary ring-offset-0' : ''
              }`}
              title={`Capture Group #${group.index}${group.name ? ` (${group.name})` : ''}: "${group.text}"`}
            >
              {group.text}
            </mark>
          );

          groupLastIndex = group.end;
        });

        if (groupLastIndex < match.end) {
          groupElements.push(
            <span key={`g-tail-${groupLastIndex}`}>
              {testText.slice(groupLastIndex, match.end)}
            </span>
          );
        }

        segments.push(
          <mark
            key={`match-${mIdx}`}
            className="rounded-none bg-primary/20 text-transparent border-b-2 border-primary/60 font-mono"
            title={`Full Match #${mIdx + 1}: "${match.text}" [${match.start}, ${match.end}]`}
          >
            {groupElements}
          </mark>
        );
      } else {
        // Simple match without sub-groups
        segments.push(
          <mark
            key={`match-${mIdx}`}
            className="rounded-none bg-primary/25 text-transparent border-b-2 border-primary font-mono transition-all"
            title={`Match #${mIdx + 1}: "${match.text}" [${match.start}, ${match.end}]`}
          >
            {match.text}
          </mark>
        );
      }

      lastIndex = match.end;
    });

    // Trailing text after final match
    if (lastIndex < testText.length) {
      segments.push(
        <span key={`text-end`}>{testText.slice(lastIndex)}</span>
      );
    }

    return segments;
  };

  const lineCount = testText.split('\n').length;
  const charCount = testText.length;

  return (
    <div className="space-y-2 h-full flex flex-col">
      {/* Header bar with statistics */}
      <div className="flex items-center justify-between shrink-0">
        <label className="text-xs font-semibold uppercase tracking-wider text-foreground-muted flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-primary" /> Test String
        </label>

        {/* Live Metrics */}
        <div className="flex items-center gap-3 text-xs text-foreground-dim">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-foreground">{analysis.count}</span> {analysis.count === 1 ? 'match' : 'matches'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-foreground-dim" />
            <span className="font-mono text-foreground">{analysis.executionTimeMs} ms</span>
          </span>
          <span className="flex items-center gap-1">
            <Hash className="w-3.5 h-3.5 text-foreground-dim" />
            <span>{charCount} chars, {lineCount} lines</span>
          </span>
        </div>
      </div>

      {/* Editor & Highlight Container */}
      <div className="relative flex-1 min-h-[220px] rounded-2xl bg-surface-subtle border border-border-subtle focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 shadow-inner overflow-hidden">
        {/* Layer 1: Backdrop with colorful match highlights */}
        <div
          ref={backdropRef}
          aria-hidden="true"
          className="absolute inset-0 p-4 font-mono text-xs sm:text-sm leading-6 tracking-normal whitespace-pre-wrap break-all pointer-events-none select-none text-transparent overflow-auto scrollbar-none m-0 border-0"
        >
          {renderHighlights()}
        </div>

        {/* Layer 2: Editable textarea with caret */}
        <textarea
          ref={textareaRef}
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          onScroll={handleScroll}
          placeholder="Paste or type test text here..."
          spellCheck={false}
          className="relative z-10 w-full h-full p-4 bg-transparent font-mono text-xs sm:text-sm leading-6 tracking-normal text-foreground placeholder:text-foreground-dim focus:outline-none resize-none whitespace-pre-wrap break-all overflow-auto m-0 border-0"
        />
      </div>

      {/* Group Palette Legend */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-foreground-muted shrink-0">
        <span className="text-[10px] uppercase font-semibold text-foreground-dim tracking-wider">Group Colors:</span>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
          <span className="w-2 h-2 rounded-full bg-primary" /> Full Match (0)
        </span>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400">
          <span className="w-2 h-2 rounded-full bg-orange-400" /> Group 1
        </span>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400" /> Group 2
        </span>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400">
          <span className="w-2 h-2 rounded-full bg-violet-400" /> Group 3
        </span>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-600/10 border border-amber-600/30 text-amber-300">
          <span className="w-2 h-2 rounded-full bg-amber-400" /> Group 4
        </span>
      </div>
    </div>
  );
};
