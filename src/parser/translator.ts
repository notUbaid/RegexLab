import { RegexToken } from '../types/regex';
import { tokenizeRegex } from './tokenizer';

export interface ExplanationBlock {
  id: string;
  tokenIds: string[];
  title: string;
  summary: string;
  details?: string;
  depth: number;
  badge?: string;
  badgeColor?: string;
}

export function translateRegexToHuman(pattern: string): ExplanationBlock[] {
  if (!pattern) return [];

  const tokens = tokenizeRegex(pattern);
  const blocks: ExplanationBlock[] = [];
  let i = 0;
  let currentDepth = 0;

  while (i < tokens.length) {
    const token = tokens[i];
    const nextToken = i + 1 < tokens.length ? tokens[i + 1] : null;

    // Check if next token is a quantifier attaching to this element
    const hasQuantifier = nextToken && nextToken.category === 'quantifier';
    const quant = hasQuantifier ? nextToken.quantifier : null;
    const quantRaw = hasQuantifier ? nextToken.raw : '';
    const consumedTokenIds = hasQuantifier ? [token.id, nextToken.id] : [token.id];

    // Combine consecutive literals (e.g., 'J', 'o', 'h', 'n' -> 'John')
    if (token.category === 'literal' && !hasQuantifier) {
      let literalStr = token.raw;
      const literalTokenIds = [token.id];
      let j = i + 1;
      while (j < tokens.length && tokens[j].category === 'literal') {
        const followingToken = j + 1 < tokens.length ? tokens[j + 1] : null;
        if (followingToken && followingToken.category === 'quantifier') {
          break; // Stop combining if the literal has its own quantifier
        }
        literalStr += tokens[j].raw;
        literalTokenIds.push(tokens[j].id);
        j++;
      }

      blocks.push({
        id: `exp-${token.start}`,
        tokenIds: literalTokenIds,
        title: `Match text "${literalStr}"`,
        summary: `Matches the exact string "${literalStr}" (case sensitive)`,
        depth: currentDepth,
        badge: 'Literal',
        badgeColor: 'text-sky-400 bg-sky-950/40 border-sky-800/50',
      });

      i = j;
      continue;
    }

    // Group Openings
    if (token.category === 'group-open' || token.category === 'lookaround') {
      currentDepth++;
      blocks.push({
        id: `exp-${token.start}`,
        tokenIds: [token.id],
        title: token.title,
        summary: token.humanExplanation,
        depth: currentDepth - 1,
        badge: token.groupName ? `Named: ${token.groupName}` : token.category === 'lookaround' ? 'Assertion' : `Group #${token.groupIndex ?? ''}`,
        badgeColor: token.category === 'lookaround' ? 'text-amber-400 bg-amber-950/40 border-amber-800/50' : 'text-purple-400 bg-purple-950/40 border-purple-800/50',
      });
      i++;
      continue;
    }

    // Group Closings
    if (token.category === 'group-close') {
      currentDepth = Math.max(0, currentDepth - 1);
      blocks.push({
        id: `exp-${token.start}`,
        tokenIds: [token.id],
        title: token.title,
        summary: token.humanExplanation,
        depth: currentDepth,
        badge: 'Close',
        badgeColor: 'text-slate-400 bg-slate-800/40 border-slate-700/50',
      });
      i++;
      continue;
    }

    // Anchors (^, $, \b)
    if (token.category === 'anchor') {
      blocks.push({
        id: `exp-${token.start}`,
        tokenIds: [token.id],
        title: token.title,
        summary: token.humanExplanation,
        depth: currentDepth,
        badge: 'Anchor',
        badgeColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50',
      });
      i++;
      continue;
    }

    // Alternation (|)
    if (token.category === 'alternation') {
      blocks.push({
        id: `exp-${token.start}`,
        tokenIds: [token.id],
        title: 'OR (Alternation)',
        summary: 'Matches either the preceding pattern OR the following pattern',
        depth: currentDepth,
        badge: 'Branch',
        badgeColor: 'text-rose-400 bg-rose-950/40 border-rose-800/50',
      });
      i++;
      continue;
    }

    // Character classes or literals with quantifiers
    let quantText = '';
    if (quant) {
      if (quant.min === 0 && quant.max === null) {
        quantText = quant.isLazy ? ' (0 or more times, lazy)' : ' (0 or more times, greedy)';
      } else if (quant.min === 1 && quant.max === null) {
        quantText = quant.isLazy ? ' (1 or more times, lazy)' : ' (1 or more times, greedy)';
      } else if (quant.min === 0 && quant.max === 1) {
        quantText = ' (optional, 0 or 1 time)';
      } else if (quant.max === null) {
        quantText = ` (at least ${quant.min} times)`;
      } else if (quant.min === quant.max) {
        quantText = ` (exactly ${quant.min} times)`;
      } else {
        quantText = ` (${quant.min} to ${quant.max} times)`;
      }
    }

    let summary = token.humanExplanation;
    if (hasQuantifier) {
      summary = `${token.humanExplanation}${quantText}`;
    }

    blocks.push({
      id: `exp-${token.start}`,
      tokenIds: consumedTokenIds,
      title: `${token.title}${quantRaw ? ` ${quantRaw}` : ''}`,
      summary,
      details: token.detail,
      depth: currentDepth,
      badge: token.category === 'char-class' ? 'Class' : token.category === 'escape' ? 'Escape' : 'Token',
      badgeColor: token.category === 'char-class' ? 'text-cyan-400 bg-cyan-950/40 border-cyan-800/50' : 'text-blue-400 bg-blue-950/40 border-blue-800/50',
    });

    i += hasQuantifier ? 2 : 1;
  }

  return blocks;
}

export const translateRegex = translateRegexToHuman;
