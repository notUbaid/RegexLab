// Splits a regex pattern into tokens and describes each one in plain English.
//
//   tokenize('\\d+')  ->  [ { raw: '\d', kind: 'class',      description: 'any digit (0-9)' },
//                           { raw: '+',  kind: 'quantifier', description: 'repeat "\d" one or more times' } ]
//
// The lexer only explains the pattern. It never decides whether text matches:
// matching is done by the browser's real RegExp engine (see matcher.ts).
import type { Token, TokenKind } from './types.ts';

// Backslash escapes with a special meaning. Any other escape (like \. or \/) is a plain character.
const ESCAPES: Record<string, { kind: TokenKind; description: string }> = {
  d: { kind: 'class', description: 'any digit (0-9)' },
  D: { kind: 'class', description: 'any character that is not a digit' },
  w: { kind: 'class', description: 'any letter, digit or underscore' },
  W: { kind: 'class', description: 'any character that is not a letter, digit or underscore' },
  s: { kind: 'class', description: 'any whitespace (space, tab, line break)' },
  S: { kind: 'class', description: 'any character that is not whitespace' },
  b: { kind: 'anchor', description: 'a word boundary (the edge of a word)' },
  B: { kind: 'anchor', description: 'a position that is not a word boundary' },
  n: { kind: 'literal', description: 'a line break' },
  t: { kind: 'literal', description: 'a tab' },
  r: { kind: 'literal', description: 'a carriage return' },
  f: { kind: 'literal', description: 'a form feed (an old page-break character)' },
  v: { kind: 'literal', description: 'a vertical tab' },
  0: { kind: 'literal', description: 'the null character (character code 0)' },
};

// Characters that mean something special in a pattern. A backslash in front makes them plain, e.g. \. or \(
const SPECIAL_CHARACTERS = '.*+?^$()[]{}|\\';

// Groups that do not capture. Checked before named groups, because (?<= also starts with (?<
const NON_CAPTURING_GROUPS = [
  { opener: '(?:', description: 'start of a group (not captured)' },
  { opener: '(?=', description: 'start of a lookahead: the text right after this point must match' },
  { opener: '(?!', description: 'start of a negative lookahead: the text right after this point must NOT match' },
  { opener: '(?<=', description: 'start of a lookbehind: the text right before this point must match' },
  { opener: '(?<!', description: 'start of a negative lookbehind: the text right before this point must NOT match' },
];

// *, +, ?, {3}, {3,}, {3,5}, each optionally followed by ? to make it lazy
const QUANTIFIER = /^(?:[*+?]|\{(\d+)(,(\d*))?\})\??/;

export function tokenize(pattern: string): Token[] {
  const tokens: Token[] = [];
  const openGroups: (number | undefined)[] = []; // capture number of each open group (undefined = not capturing)
  let groupCount = 0;
  let i = 0;

  // Adds a token covering pattern[i..end) and moves i forward to end.
  function add(kind: TokenKind, end: number, description: string, groupNumber?: number) {
    tokens.push({ kind, raw: pattern.slice(i, end), start: i, end, depth: openGroups.length, description, groupNumber });
    i = end;
  }

  while (i < pattern.length) {
    const ch = pattern[i];
    const rest = pattern.slice(i);

    if (ch === '\\') {
      const next = pattern[i + 1];
      const namedReference = rest.match(/^\\k<([A-Za-z_$][\w$]*)>/); // \k<year>
      const characterCode = rest.match(/^\\(x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4})/); // a character code: \x then 2 hex digits, or \u then 4
      if (next === undefined) {
        add('literal', i + 1, 'a lone backslash (the escape is incomplete)');
      } else if (/[1-9]/.test(next)) {
        add('backreference', i + 2, `the exact same text that group ${next} matched`);
      } else if (namedReference) {
        add('backreference', i + namedReference[0].length, `the exact same text that the group named "${namedReference[1]}" matched`);
      } else if (characterCode) {
        const character = String.fromCharCode(parseInt(characterCode[1].slice(1), 16));
        add('literal', i + characterCode[0].length, `the character "${character}" (written as a character code)`);
      } else if (ESCAPES[next]) {
        add(ESCAPES[next].kind, i + 2, ESCAPES[next].description);
      } else if (SPECIAL_CHARACTERS.includes(next)) {
        add('literal', i + 2, `a real "${next}" character (the backslash turns off its special meaning)`);
      } else {
        add('literal', i + 2, `the character "${next}"`);
      }
      continue;
    }

    if (ch === '[') {
      // Find the closing ]. A backslash skips the character after it, so [a\]b] is one set.
      let end = i + 1;
      while (end < pattern.length && pattern[end] !== ']') {
        if (pattern[end] === '\\') end += 2;
        else end += 1;
      }
      end = Math.min(end + 1, pattern.length); // include the ] (or stop at the end if it is missing)

      const set = pattern.slice(i, end);
      if (set.startsWith('[^')) add('class', end, `any one character NOT in ${set}`);
      else add('class', end, `any one character from ${set}`);
      continue;
    }

    if (ch === '(') {
      const nonCapturing = NON_CAPTURING_GROUPS.find((group) => rest.startsWith(group.opener));
      if (nonCapturing) {
        add('group-open', i + nonCapturing.opener.length, nonCapturing.description);
        openGroups.push(undefined);
        continue;
      }
      // (?i:...) turns a flag on only inside the group. It does not capture either.
      const flagGroup = rest.match(/^\(\?[a-z-]+:/);
      if (flagGroup) {
        add('group-open', i + flagGroup[0].length, `start of a group (not captured) that uses the flags "${flagGroup[0].slice(2, -1)}" inside it`);
        openGroups.push(undefined);
        continue;
      }
      groupCount++;
      const named = rest.match(/^\(\?<([A-Za-z_$][\w$]*)>/);
      if (named) {
        add('group-open', i + named[0].length, `start of group ${groupCount}, named "${named[1]}" (captured)`, groupCount);
      } else {
        add('group-open', i + 1, `start of group ${groupCount} (captured)`, groupCount);
      }
      openGroups.push(groupCount);
      continue;
    }

    if (ch === ')') {
      const number = openGroups.pop();
      add('group-close', i + 1, number ? `end of group ${number}` : 'end of group', number);
      continue;
    }

    if (ch === '|') {
      add('or', i + 1, 'OR: match either what comes before or what comes after');
      continue;
    }
    if (ch === '^') {
      add('anchor', i + 1, 'start of the text (start of each line with the m flag)');
      continue;
    }
    if (ch === '$') {
      add('anchor', i + 1, 'end of the text (end of each line with the m flag)');
      continue;
    }
    if (ch === '.') {
      add('class', i + 1, 'any character except a line break (any character at all with the s flag)');
      continue;
    }

    const quantifier = rest.match(QUANTIFIER);
    if (quantifier) {
      const previous = tokens[tokens.length - 1];
      add('quantifier', i + quantifier[0].length, describeQuantifier(quantifier, previous));
      continue;
    }

    add('literal', i + 1, `the character "${ch}"`);
  }

  return tokens;
}

function describeQuantifier([raw, min, comma, max]: RegExpMatchArray, previous: Token | undefined): string {
  // Say what gets repeated: a whole group, or the one piece just before, e.g. "\d".
  let target = 'the previous item';
  if (previous?.kind === 'group-close') {
    target = previous.groupNumber ? `group ${previous.groupNumber}` : 'the group before it';
  } else if (previous) {
    target = `"${previous.raw}"`;
  }

  let times: string;
  if (raw[0] === '*') times = 'zero or more times';
  else if (raw[0] === '+') times = 'one or more times';
  else if (raw[0] === '?') times = 'zero or one time (makes it optional)';
  else if (comma === undefined) times = `exactly ${min} times`;
  else if (max === '') times = `${min} or more times`;
  else times = `between ${min} and ${max} times`;

  // A trailing ? turns a quantifier lazy (but a lone ? is just "optional").
  const lazy = raw.length > 1 && raw.endsWith('?');
  return `repeat ${target} ${times}${lazy ? ', as few times as possible' : ''}`;
}
