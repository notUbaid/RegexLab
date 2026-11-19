// The one function the UI calls. Workspace.tsx runs it (memoised) whenever the
// pattern, flags or test text change, and passes the result down to every panel.
import { tokenize } from './lexer.ts';
import { findMatches } from './matcher.ts';
import { findSlowPattern } from './slowPattern.ts';
import type { Match, Token } from './types.ts';

export interface Analysis {
  /** Syntax error with a plain-English hint, or null when the pattern is valid. */
  error: string | null;
  tokens: Token[];
  matches: Match[];
  /** Performance warning (see slowPattern.ts), or null. */
  warning: string | null;
}

// The browser's error messages are short and technical, so the most common ones get a hint.
// The text on the left is exactly what Chrome and Edge say. Other browsers just show their own message.
const ERROR_HINTS: Record<string, string> = {
  'Unterminated group': 'Every ( needs a matching ).',
  "Unmatched ')'": 'There is a ) without a ( before it. Write \\) to match a real bracket.',
  'Nothing to repeat': 'A *, + or ? needs something before it to repeat. Write \\+ to match a real +.',
  'Unterminated character class': 'Every [ needs a matching ].',
  '\\ at end of pattern': 'The pattern ends with a lone \\. Write \\\\ to match a real backslash.',
  'numbers out of order in {} quantifier': 'In {min,max} the first number must not be bigger than the second.',
  'Range out of order in character class': 'A range like [z-a] goes backwards. Write it as [a-z].',
  'Invalid group': '(? must be followed by :, =, !, <=, <! or <name>.',
};

export function analyze(pattern: string, flags: string, text: string): Analysis {
  const tokens = tokenize(pattern);
  const warning = findSlowPattern(tokens);

  // An empty pattern matches an empty string at every position, which is noise.
  if (!pattern) return { error: null, tokens, matches: [], warning };

  try {
    return { error: null, tokens, matches: findMatches(pattern, flags, text), warning };
  } catch (err) {
    // "Invalid regular expression: /(abc/gm: Unterminated group"
    //   -> "Unterminated group. Every ( needs a matching )."
    const fullMessage = err instanceof Error ? err.message : String(err);
    const message = fullMessage.replace(/^Invalid regular expression: \/.*\/[a-z]*: /, '');
    const hint = ERROR_HINTS[message];
    return { error: hint ? `${message}. ${hint}` : message, tokens, matches: [], warning };
  }
}
