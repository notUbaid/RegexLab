import React, { useMemo, useState } from 'react';
import { useRegexStore } from '../../store/useRegexStore';
import { PATTERN_LIBRARY } from '../../data/patternLibrary';
import { PatternItem } from '../../types/regex';
import { markup } from '../../utils/markup';

const CATEGORIES = ['All', 'Web & Network', 'Security & Auth', 'Data & Numbers', 'Dates & Times', 'Telephony & Location', 'Programming'];

const Row: React.FC<{ p: PatternItem; onOpen: () => void }> = ({ p, onOpen }) => {
  const [copied, setCopied] = useState(false);
  const sample = p.testCases.find((t) => t.shouldMatch)?.input;
  const { nodes } = useMemo(() => (sample ? markup(sample, p.regex, p.flags || '') : { nodes: [] }), [p, sample]);
  const copy = () => { navigator.clipboard.writeText(p.regex); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <li className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-x-12 gap-y-4 py-7 border-b border-border">
      <div>
        <h2 className="text-[20px] font-semibold leading-tight tracking-[-0.01em]">{p.name}</h2>
        <p className="mt-2 text-[14px] text-foreground-muted leading-snug max-w-md">{p.description}</p>
        <div className="mt-4 flex items-center gap-5 text-[13px]">
          <button onClick={onOpen} className="font-semibold"><span className="swipe">Open in playground</span></button>
          <button onClick={copy} className="text-foreground-muted hover:text-foreground">{copied ? 'Copied' : 'Copy pattern'}</button>
        </div>
      </div>
      <div className="min-w-0">
        <code className="block font-mono text-[13px] leading-relaxed break-all text-foreground">/{p.regex}/{p.flags}</code>
        {sample && <p className="specimen mt-3 font-mono text-[13px] text-foreground-muted truncate" title={sample}>{nodes}</p>}
        <p className="mt-2 text-xs text-foreground-dim">{p.testCases.length} test cases · {p.tags.slice(0, 3).join(', ')}</p>
      </div>
    </li>
  );
};

export const PatternLibraryView: React.FC = () => {
  const { loadPattern, setActiveView } = useRegexStore();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return PATTERN_LIBRARY.filter((p) => (cat === 'All' || p.category === cat) &&
      (!s || p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s) || p.regex.toLowerCase().includes(s) || p.tags.some((t) => t.toLowerCase().includes(s))));
  }, [q, cat]);

  const open = (p: PatternItem) => {
    loadPattern(p.regex, p.flags || 'g', p.testCases.map((t) => `${t.input} // ${t.shouldMatch ? 'Should match' : 'Should NOT match'}`).join('\n'));
    setActiveView('playground');
  };

  return (
    <div className="max-w-[1120px] mx-auto px-6 sm:px-10 pt-4 pb-24">
      <h1 className="text-[34px] leading-none font-semibold tracking-[-0.03em]">Examples</h1>
      <p className="mt-3 text-[15px] text-foreground-muted max-w-xl leading-snug">Ready-made patterns. Open one and its test cases load into the playground.</p>

      <div className="mt-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-border pb-3">
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[14px]" role="tablist" aria-label="Category">
          {CATEGORIES.map((c) => (
            <button key={c} role="tab" aria-selected={cat === c} onClick={() => setCat(c)} className={cat === c ? 'text-foreground font-semibold' : 'text-foreground-muted hover:text-foreground'}>
              <span className={cat === c ? 'swipe' : ''}>{c}</span>
            </button>
          ))}
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patterns" aria-label="Search patterns" spellCheck={false}
          className="w-52 bg-transparent border-b border-border focus:border-foreground/50 py-1 text-[14px] placeholder:text-foreground-dim focus:outline-none transition-colors" />
      </div>

      {list.length ? (
        <ul>{list.map((p) => <Row key={p.id} p={p} onOpen={() => open(p)} />)}</ul>
      ) : (
        <div className="py-20">
          <p className="text-xl font-semibold">Nothing matches “{q}”.</p>
          <p className="mt-1 text-[14px] text-foreground-muted">Clear the search or pick another category.</p>
          <button onClick={() => { setQ(''); setCat('All'); }} className="mt-4 text-[14px] font-semibold"><span className="swipe">Show all examples</span></button>
        </div>
      )}
    </div>
  );
};
