// Runs the pattern with the browser's own RegExp engine and returns every match,
// with exact positions for the whole match and for each capture group.
import type { Group, Match } from './types.ts';

// Stops runaway loops, e.g. an empty-matching pattern on a huge text.
export const MAX_MATCHES = 1000;

/** Throws a SyntaxError if the pattern or flags are invalid. */
export function findMatches(pattern: string, flags: string, text: string): Match[] {
  // 'd' makes the engine report start/end indices for every group.
  // 'g' lets us call exec() in a loop. We add it ourselves and honour the user's
  // choice below: without the g flag JavaScript only finds the first match.
  const regex = new RegExp(pattern, flags.replace(/[gd]/g, '') + 'gd');
  const findAll = flags.includes('g');
  const matches: Match[] = [];

  while (matches.length < MAX_MATCHES) {
    const result = regex.exec(text);
    if (result === null) break; // no more matches

    const indices = result.indices!;
    const [start, end] = indices[0];

    const groups: Group[] = [];
    for (let number = 1; number < result.length; number++) {
      const span = indices[number];
      if (!span) continue; // this group did not take part in the match, e.g. an optional (...)?

      // Find the group's name, if it has one. The engine stores the very same [start, end]
      // array under the group's number and under its name, so we compare the arrays.
      let name: string | undefined;
      for (const [groupName, groupSpan] of Object.entries(indices.groups ?? {})) {
        if (groupSpan === span) name = groupName;
      }

      groups.push({ number, name, text: result[number], start: span[0], end: span[1] });
    }

    matches.push({ text: result[0], start, end, groups });

    if (!findAll) break;
    // An empty match (e.g. ^ or \b) does not move lastIndex, so step past it ourselves.
    if (start === end) regex.lastIndex++;
  }

  return matches;
}
