import React, { useMemo, useRef } from 'react';
import { Copy, Trash2, FileText, Check } from 'lucide-react';
import { RegexAnalysisResult, RegexMatch } from '../engine/types';
import { soundFX } from '../utils/soundEffects';

interface TestEditorProps {
  testText: string;
  onTestTextChange: (text: string) => void;
  analysis: RegexAnalysisResult;
  hoveredGroupIndex: number | null;
  onHoverGroup: (index: number | null) => void;
  hoveredTokenId: string | null;
}

const LINE_HEIGHT = 24;
const PADDING_TOP = 12;

const SAMPLE_TEXTS: { label: string; text: string }[] = [
  {
    label: 'SemVer Releases',
    text: `v1.2.3
v2.0.0-beta.1
1.0.4-rc.2
release-v0.9.0-alpha
v3.14.159-preview.5
invalid-version-here
v4.0.0
2.1.0-rc1`
  },
  {
    label: 'Web Server Access Logs',
    text: `192.168.1.42 - - [10/Oct/2026:13:55:36 +0000] "GET /api/v1/users HTTP/1.1" 200 2326
10.0.0.15 - frank [10/Oct/2026:14:01:12 +0000] "POST /auth/login HTTP/1.1" 401 142
172.16.254.1 - - [10/Oct/2026:14:05:01 +0000] "GET /images/logo.png HTTP/1.1" 304 0
192.168.1.99 - admin [10/Oct/2026:14:12:44 +0000] "DELETE /api/v1/cache HTTP/1.1" 204 0`
  },
  {
    label: 'Contact Emails & Phones',
    text: `Contact our sales team at sales@regexlab.dev or call +1 (555) 234-5678.
For technical assistance: support@regexlab.io (intl: +44 20 7946 0991).
Security bug disclosures: security-team+bounty@regexlab.dev
Personal email: alex.miller.99@gmail.com`
  }
];

export const TestEditor: React.FC<TestEditorProps> = ({
  testText,
  onTestTextChange,
  analysis,
  hoveredGroupIndex,
  onHoverGroup,
  hoveredTokenId,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightLayerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  // Line indices for gutter
  const lines = useMemo(() => {
    return testText.split('\n');
  }, [testText]);

  const lineCount = lines.length;
  const minRows = Math.max(lineCount, 8);

  // Sync scroll
  const handleScroll = () => {
    if (textareaRef.current && highlightLayerRef.current) {
      highlightLayerRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightLayerRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleCopy = () => {
    soundFX.playCopy();
    navigator.clipboard.writeText(testText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleClear = () => {
    soundFX.playLatch();
    onTestTextChange('');
  };

  const handleLoadSample = (sample: string) => {
    soundFX.playLatch();
    onTestTextChange(sample);
  };

  // Render layered highlighted spans
  const highlightedContent = useMemo(() => {
    if (!analysis.isValid || analysis.matches.length === 0 || !testText) {
      return testText;
    }

    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;

    analysis.matches.forEach((m: RegexMatch, matchIdx: number) => {
      if (m.end <= m.start) return;

      // Text before match
      if (m.start > lastIndex) {
        nodes.push(testText.slice(lastIndex, m.start));
      }

      // Check if any capture group is present inside this match
      const groupNodes: React.ReactNode[] = [];
      let groupLast = m.start;

      const validGroups = m.groups
        .filter((g) => g.end > g.start)
        .sort((a, b) => a.start - b.start);

      validGroups.forEach((g, gIdx) => {
        if (g.start < groupLast) return;

        // Text before this group inside match
        if (g.start > groupLast) {
          groupNodes.push(testText.slice(groupLast, g.start));
        }

        const isHot = hoveredGroupIndex === g.index;
        groupNodes.push(
          <mark
            key={`g-${matchIdx}-${gIdx}`}
            className={`rx-g g${g.index % 8} ${isHot ? 'rx-hot' : ''}`}
          >
            {g.text}
          </mark>
        );

        groupLast = g.end;
      });

      // Remaining match text after last group
      if (groupLast < m.end) {
        groupNodes.push(testText.slice(groupLast, m.end));
      }

      nodes.push(
        <mark key={`m-${matchIdx}`}>
          {groupNodes.length > 0 ? groupNodes : m.text}
        </mark>
      );

      lastIndex = m.end;
    });

    if (lastIndex < testText.length) {
      nodes.push(testText.slice(lastIndex));
    }

    return nodes;
  }, [analysis, testText, hoveredGroupIndex]);

  return (
    <div className="flex flex-col h-full bg-surface border-r border-border select-none">
      {/* Test String Toolbar */}
      <div className="h-9 px-3 border-b border-border bg-surface-subtle flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground tracking-tight">Test String</span>
          <span className="text-foreground-dim text-[11px] font-mono">
            {lineCount} {lineCount === 1 ? 'line' : 'lines'} · {testText.length} chars
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick Samples Dropdown */}
          <div className="relative group">
            <button
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-foreground-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
              title="Load sample test strings"
            >
              <FileText className="w-3 h-3" />
              <span>Samples</span>
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-surface-elevated border border-border rounded shadow-xl p-1 hidden group-hover:block z-30 animate-modal-pop">
              {SAMPLE_TEXTS.map((sample) => (
                <button
                  key={sample.label}
                  onClick={() => handleLoadSample(sample.text)}
                  className="w-full text-left px-2 py-1.5 text-xs text-foreground-muted hover:text-foreground hover:bg-surface rounded transition-colors"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="p-1 rounded text-foreground-dim hover:text-foreground hover:bg-surface-elevated transition-colors"
            title="Copy test string"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleClear}
            className="p-1 rounded text-foreground-dim hover:text-rose-400 hover:bg-surface-elevated transition-colors"
            title="Clear test string"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Surface: Line Gutter + Layered Text */}
      <div className="flex-1 min-h-0 relative flex overflow-hidden font-mono text-xs">
        {/* Ruled Gutter */}
        <div
          className="w-10 border-r border-border bg-surface-subtle text-right pr-2 text-foreground-dim select-none font-mono text-xs pt-3 leading-6 overflow-hidden"
          aria-hidden="true"
        >
          {Array.from({ length: minRows }).map((_, idx) => (
            <div key={idx} className="h-6 leading-6">
              {idx < lineCount ? idx + 1 : ''}
            </div>
          ))}
        </div>

        {/* Text Container with Layered Highlighting */}
        <div className="relative flex-1 min-w-0 ruled overflow-hidden">
          {/* Backdrop Syntax Layer */}
          <div
            ref={highlightLayerRef}
            aria-hidden="true"
            className="rx-text rx-layer absolute inset-0 overflow-hidden pointer-events-none select-none text-transparent leading-6 pt-3 px-3.5 font-mono text-xs"
          >
            {highlightedContent}
            {'\n'}
          </div>

          {/* Interactive Textarea */}
          <textarea
            ref={textareaRef}
            wrap="off"
            value={testText}
            onChange={(e) => {
              soundFX.playKeypress();
              onTestTextChange(e.target.value);
            }}
            onScroll={handleScroll}
            placeholder="Type or paste text here to test your regular expression against..."
            spellCheck={false}
            className="rx-text relative z-10 w-full h-full bg-transparent text-foreground placeholder:text-foreground-dim focus:outline-none resize-none overflow-auto leading-6 pt-3 px-3.5 font-mono text-xs"
          />
        </div>
      </div>
    </div>
  );
};
