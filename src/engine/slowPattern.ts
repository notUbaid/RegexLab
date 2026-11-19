// Spots patterns that can freeze the page on some inputs ("catastrophic backtracking", the cause of ReDoS).
//
// Classic example: (a+)+ run against "aaaaaaaaaaaaaaaaaaaaaaaa!". The engine tries every way of
// splitting the a's between the inner + and the outer +, which doubles with every extra "a".
//
// shortcut: only catches a repeated group that contains another unbounded repeat, e.g. (a+)+ or (\w*\s)*.
// It misses overlapping alternatives like (a|a)+, and it also warns about safe patterns where a required
// separator splits the repeats, like (\w+,)+. Use a real ReDoS checker if this ever guards a server.
import type { Token } from './types.ts';

const isUnboundedRepeat = (token: Token | undefined) =>
  token?.kind === 'quantifier' && /^(?:[*+]|\{\d+,\})/.test(token.raw);

/** Returns a warning sentence, or null if no risky nesting was found. */
export function findSlowPattern(tokens: Token[]): string | null {
  const openGroups: { tokenIndex: number; containsRepeat: boolean }[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.kind === 'group-open') {
      openGroups.push({ tokenIndex: i, containsRepeat: false });
    } else if (isUnboundedRepeat(token)) {
      for (const group of openGroups) group.containsRepeat = true;
    } else if (token.kind === 'group-close') {
      const group = openGroups.pop();
      if (group?.containsRepeat && isUnboundedRepeat(tokens[i + 1])) {
        const snippet = tokens.slice(group.tokenIndex, i + 2).map((t) => t.raw).join('');
        return `${snippet} repeats something that already repeats. On some inputs this can make the regex extremely slow.`;
      }
    }
  }

  return null;
}
