import { ExplanationBlock, RegexToken } from './types';

export function translateTokens(tokens: RegexToken[]): ExplanationBlock[] {
  if (!tokens.length) return [];

  const blocks: ExplanationBlock[] = [];
  let blockIdx = 0;

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    blockIdx++;

    let summary = tok.explanation;
    let badge = tok.type;
    let badgeColor = 'bg-muted text-foreground border-border';

    if (tok.category === 'anchor') {
      badge = 'Anchor';
      badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    } else if (tok.category === 'character_class') {
      badge = 'Class';
      badgeColor = 'bg-teal-500/10 text-teal-400 border-teal-500/20';
    } else if (tok.category === 'quantifier') {
      badge = 'Quantifier';
      badgeColor = 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    } else if (tok.category === 'group') {
      badge = 'Group';
      badgeColor = 'bg-violet-500/10 text-violet-400 border-violet-500/20';
    } else if (tok.category === 'literal') {
      badge = 'Literal';
      badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }

    blocks.push({
      id: `expl-${blockIdx}`,
      depth: tok.depth,
      title: tok.title,
      summary,
      details: `Raw syntax: ${tok.raw} (position ${tok.start}..${tok.end})`,
      badge,
      badgeColor,
      tokenIds: [tok.id],
    });
  }

  return blocks;
}
