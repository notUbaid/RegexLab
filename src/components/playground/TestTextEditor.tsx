import React, { useMemo, useRef } from 'react';
import { useRegexStore } from '../../store/useRegexStore';
import { RegexMatch } from '../../types/regex';

const LH = 26, PAD = 18, MIN_ROWS = 9;

/** The sheet: ruled lines, a number gutter, and a margin where each match is annotated on its own line. */
export const TestTextEditor: React.FC = () => {
  const { testText, setTestText, getMatches, hoveredGroupIndex, setHoveredGroupIndex } = useRegexStore();
  const taRef = useRef<HTMLTextAreaElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const a = getMatches();

  const lineStarts = useMemo(() => { const s = [0]; for (let i = 0; i < testText.length; i++) if (testText[i] === '\n') s.push(i + 1); return s; }, [testText]);
  const lineOf = (pos: number) => { let lo = 0, hi = lineStarts.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (lineStarts[m] <= pos) lo = m; else hi = m - 1; } return lo; };
  const rows = Math.max(lineStarts.length, MIN_ROWS);
  const H = rows * LH + PAD * 2;

  const notes = useMemo(() => {
    const byLine = new Map<number, { n: number; m: RegexMatch }[]>();
    if (a.isValid) a.matches.forEach((m: RegexMatch, i: number) => { if (m.end > m.start) { const l = lineOf(m.start); byLine.set(l, [...(byLine.get(l) ?? []), { n: i + 1, m }]); } });
    return [...byLine.entries()];
  }, [a, lineStarts]);

  const groupCount = useMemo(() => { let x = 0; a.matches.forEach((m: RegexMatch) => m.groups.forEach((g) => { x = Math.max(x, g.index); })); return Math.min(x, 7); }, [a]);

  const highlights = () => {
    if (!a.isValid || !a.matches.length || !testText) return testText;
    const out: React.ReactNode[] = []; let last = 0;
    a.matches.forEach((m: RegexMatch, mi: number) => {
      if (m.end <= m.start) return;
      if (m.start > last) out.push(testText.slice(last, m.start));
      const kids: React.ReactNode[] = []; let gl = m.start;
      [...m.groups].filter((g) => g.end > g.start).sort((x, y) => x.start - y.start).forEach((g, gi) => {
        if (g.start < gl) return;
        if (g.start > gl) kids.push(testText.slice(gl, g.start));
        kids.push(<mark key={`g${mi}-${gi}`} className={`rx-g g${g.index % 8} ${hoveredGroupIndex === g.index ? 'rx-hot' : ''}`}>{g.text}</mark>);
        gl = g.end;
      });
      if (gl < m.end) kids.push(testText.slice(gl, m.end));
      out.push(<mark key={`m${mi}`}>{kids}</mark>); last = m.end;
    });
    if (last < testText.length) out.push(testText.slice(last));
    return out;
  };

  const status = !a.isValid ? 'Pattern has an error' : a.count === 0 ? 'No matches' : `${a.count} ${a.count === 1 ? 'match' : 'matches'}`;

  return (
    <section aria-label="Test text">
      <div className="flex items-end justify-between gap-4 mb-2">
        <h2 className="text-lg font-semibold"><label htmlFor="rx-test">Test text</label></h2>
        <p className="text-[13px] text-foreground-muted font-mono">
          <span className={a.isValid && a.count ? 'text-foreground' : ''}>{status}</span>
          <span className="text-foreground-dim"> · {a.executionTimeMs} ms · {testText.length} chars</span>
        </p>
      </div>

      <div className="grid grid-cols-[44px_minmax(0,1fr)] lg:grid-cols-[44px_minmax(0,1fr)_250px] rounded-lg border border-border bg-surface/60 overflow-hidden focus-within:border-foreground/30 transition-colors">
        {/* gutter */}
        <div className="relative border-r border-border text-right font-mono text-xs text-foreground-dim select-none" style={{ height: H }} aria-hidden>
          {Array.from({ length: rows }, (_, i) => (<div key={i} className="absolute right-3" style={{ top: PAD + i * LH, lineHeight: `${LH}px` }}>{i < lineStarts.length ? i + 1 : ''}</div>))}
        </div>

        {/* text */}
        <div className="relative ruled" style={{ height: H }}>
          <div ref={bgRef} aria-hidden className="rx-text rx-layer absolute inset-0 overflow-hidden pointer-events-none select-none text-transparent">{highlights()}{'\n'}</div>
          <textarea id="rx-test" ref={taRef} wrap="off" value={testText} onChange={(e) => setTestText(e.target.value)}
            onScroll={() => { if (taRef.current && bgRef.current) bgRef.current.scrollLeft = taRef.current.scrollLeft; }}
            placeholder="Paste text to test your pattern against" spellCheck={false} style={{ height: H }}
            className="rx-text relative z-10 block w-full bg-transparent text-foreground placeholder:text-foreground-dim focus:outline-none resize-none overflow-x-auto overflow-y-hidden" />
        </div>

        {/* margin notes */}
        <div className="relative hidden lg:block border-l border-border" style={{ height: H }} aria-label="Matches by line">
          {notes.map(([ln, items]) => (
            <div key={ln} className="absolute left-0 right-0 flex items-center gap-3 px-3 overflow-hidden whitespace-nowrap font-mono text-xs" style={{ top: PAD + ln * LH, height: LH }}>
              {items.map(({ n, m }) => (
                <span key={n} className="flex items-center gap-1.5 text-foreground-muted">
                  <span className="text-foreground font-semibold">{n}</span>
                  {m.groups.length === 0 && <span className="w-1.5 h-1.5 rounded-full bg-hl" />}
                  {m.groups.map((g) => (<span key={g.index} className={`g${g.index % 8} flex items-center gap-1`}><i className="w-1.5 h-1.5 rounded-full not-italic" style={{ background: 'rgb(var(--g))' }} />{g.text}</span>))}
                </span>
              ))}
            </div>
          ))}
          {!notes.length && <p className="absolute inset-x-3 text-xs text-foreground-dim" style={{ top: PAD, lineHeight: `${LH}px` }}>Matches are noted here, line by line.</p>}
        </div>
      </div>

      {groupCount > 0 && (
        <div className="flex flex-wrap items-center gap-1 mt-3 text-xs text-foreground-muted">
          <span className="mr-1.5">Capture groups</span>
          {Array.from({ length: groupCount }, (_, k) => k + 1).map((n) => (
            <button key={n} onMouseEnter={() => setHoveredGroupIndex(n)} onMouseLeave={() => setHoveredGroupIndex(null)} onFocus={() => setHoveredGroupIndex(n)} onBlur={() => setHoveredGroupIndex(null)}
              className={`g${n % 8} flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono hover:bg-surface-elevated`}>
              <i className="w-2 h-2 rounded-full" style={{ background: 'rgb(var(--g))' }} />${n}
            </button>
          ))}
        </div>
      )}
    </section>
  );
};
