import React from 'react';

/** Run a pattern over text and return marker-highlighted nodes (whole match yellow, capture groups in pen colours). */
export function markup(text: string, pattern: string, flags = ''): { nodes: React.ReactNode[]; count: number; error: string } {
  try {
    const fl = Array.from(new Set((flags.replace(/[yd]/g, '') + 'gd').split(''))).join('');
    const out: React.ReactNode[] = []; let last = 0, n = 0;
    for (const m of text.matchAll(new RegExp(pattern, fl))) {
      if (!m[0]) continue;
      const st = m.index ?? 0, en = st + m[0].length; n++;
      if (st > last) out.push(text.slice(last, st));
      const ind: ([number, number] | undefined)[] = (m as any).indices ?? [];
      const kids: React.ReactNode[] = []; let c = st;
      for (let g = 1; g < ind.length; g++) {
        const r = ind[g]; if (!r || r[1] <= r[0] || r[0] < c) continue;
        if (r[0] > c) kids.push(text.slice(c, r[0]));
        kids.push(<mark key={`${g}-${r[0]}`} className={`rx-g g${g % 8}`}>{text.slice(r[0], r[1])}</mark>); c = r[1];
      }
      if (c < en) kids.push(text.slice(c, en));
      out.push(<mark key={st}>{kids}</mark>); last = en;
    }
    out.push(text.slice(last));
    return { nodes: out, count: n, error: '' };
  } catch (e) { return { nodes: [text], count: 0, error: (e as Error).message }; }
}
