import React, { useMemo, useState } from 'react';
import { useRegexStore } from '../../store/useRegexStore';
import { NAV_GROUPS } from '../common/navItems';

const SPECIMENS = [
  { name: 'Email addresses', pattern: '(\\w+)@(\\w+)\\.(\\w+)', flags: 'g',
    text: 'Write to ada@analytical.org or alan@bletchley.uk for the archive. Grace (grace@navy.mil) answers on Thursdays.' },
  { name: 'Dates', pattern: '(\\d{4})-(\\d{2})-(\\d{2})', flags: 'g',
    text: 'The engine was proposed on 1837-12-01, demonstrated on 1843-10-05 and finally built on 1991-11-19.' },
  { name: 'Hex colours', pattern: '#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})', flags: 'gi',
    text: 'Use #ffd63d for the marker, #0f0e12 for the ink and #f4f3ef for the paper.' },
];

export const LandingHero: React.FC = () => {
  const { setActiveView, setPattern, setFlags, setTestText } = useRegexStore();
  const [i, setI] = useState(0);
  const sp = SPECIMENS[i];
  const [pattern, setP] = useState(sp.pattern);
  const pick = (k: number) => { setI(k); setP(SPECIMENS[k].pattern); };

  const { nodes, count, error } = useMemo(() => {
    try {
      const fl = Array.from(new Set((sp.flags + 'gd').split(''))).join('');
      const out: React.ReactNode[] = []; let last = 0, n = 0;
      for (const m of sp.text.matchAll(new RegExp(pattern, fl))) {
        if (!m[0]) continue;
        const st = m.index ?? 0, en = st + m[0].length; n++;
        if (st > last) out.push(sp.text.slice(last, st));
        const ind: ([number, number] | undefined)[] = (m as any).indices ?? [];
        const kids: React.ReactNode[] = []; let c = st;
        for (let g = 1; g < ind.length; g++) {
          const r = ind[g]; if (!r || r[1] <= r[0] || r[0] < c) continue;
          if (r[0] > c) kids.push(sp.text.slice(c, r[0]));
          kids.push(<mark key={`${g}-${r[0]}`} className={`rx-g g${g % 8}`}>{sp.text.slice(r[0], r[1])}</mark>); c = r[1];
        }
        if (c < en) kids.push(sp.text.slice(c, en));
        out.push(<mark key={st}>{kids}</mark>); last = en;
      }
      out.push(sp.text.slice(last));
      return { nodes: out, count: n, error: '' };
    } catch (e) { return { nodes: [sp.text], count: 0, error: (e as Error).message }; }
  }, [pattern, sp]);

  const open = () => { setPattern(pattern); setFlags(sp.flags); setTestText(sp.text); setActiveView('playground'); };
  const tools = NAV_GROUPS.flatMap((g) => g.items).filter((t) => t.view !== 'playground');

  return (
    <div className="max-w-[1040px] mx-auto px-6 sm:px-10 pt-6 pb-24">
      <h1 className="text-[44px] sm:text-[72px] font-semibold leading-[0.98] tracking-[-0.035em] max-w-3xl">Find the pattern in the text.</h1>
      <p className="mt-5 text-lg text-foreground-muted max-w-xl leading-snug">RegexLab marks up your text as you write a regular expression, then shows you how the engine got there. It all runs in your browser.</p>

      <div className="mt-14">
        <p className="specimen text-[26px] sm:text-[34px] leading-[1.6] tracking-[-0.01em] max-w-4xl text-foreground/90">{nodes}</p>
        <div className="mt-8 flex items-baseline gap-2 border-b border-border pb-2 focus-within:border-foreground/40 transition-colors">
          <span className="font-mono text-2xl text-foreground-dim">/</span>
          <input value={pattern} onChange={(e) => setP(e.target.value)} spellCheck={false} aria-label="Try a pattern" className="flex-1 min-w-0 bg-transparent font-mono text-xl focus:outline-none" />
          <span className="font-mono text-2xl text-foreground-dim">/{sp.flags}</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[13px]">
          <div className="flex items-center gap-1 text-foreground-muted">
            <span className="mr-1.5">Try</span>
            {SPECIMENS.map((s, k) => (<button key={s.name} onClick={() => pick(k)} className={`px-1 ${k === i ? 'swipe text-foreground font-semibold' : 'swipe-hover hover:text-foreground'}`}>{s.name}</button>))}
          </div>
          <span className={`font-mono ${error ? 'text-accent-rose' : 'text-foreground-dim'}`}>{error || `${count} ${count === 1 ? 'match' : 'matches'}`}</span>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <button onClick={open} className="h-11 px-6 rounded-md bg-primary text-primary-foreground text-[15px] font-semibold hover:bg-primary/85 transition-colors">Open in the playground</button>
        <button onClick={() => setActiveView('library')} className="h-11 px-3 text-[15px] text-foreground-muted hover:text-foreground">Browse examples</button>
      </div>

      <ul className="mt-24 grid sm:grid-cols-2 gap-x-12 border-t border-border">
        {tools.map((t) => (
          <li key={t.view} className="border-b border-border">
            <button onClick={() => setActiveView(t.view)} className="group w-full py-5 text-left">
              <span className="block text-[17px] font-semibold"><span className="swipe-hover">{t.label}</span></span>
              <span className="block text-[14px] text-foreground-muted mt-1">{t.hint}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
