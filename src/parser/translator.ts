/**
 * ============================================================================
 * RegexLab - Live Regex Translator (Human Language Engine)
 * ============================================================================
 * 
 * Welcome! One of the core philosophies of RegexLab is:
 * "Regex should never feel like cryptic symbols; it should feel like plain English."
 * 
 * Instead of forcing someone to memorize:
 *   `^[A-Z][a-z0-9_-]{3,15}$`
 * 
 * This translator automatically converts it into readable human sentences:
 *   - "Start of string"
 *   - "One uppercase letter (A-Z)"
 *   - "Between 3 and 15 letters, digits, underscores, or hyphens"
 *   - "End of string"
 * 
 * HOW IT WORKS:
 * 1. Takes the tokens produced by `tokenizeRegex()`.
 * 2. Glues adjacent literal characters together into readable words (e.g. 'c','a','t' -> "cat").
 * 3. Associates repetition quantifiers (like `+`, `*`, `{2,4}`) with their target token.
 * 4. Outputs structured `ExplanationBlock` objects ready for bidirectional hover glowing!
 */

import { RegexToken } from '../types/regex';
import { tokenizeRegex } from './tokenizer';

/**
 * A block of human-readable explanation corresponding to one or more regex tokens.
 */
export interface ExplanationBlock {
  /** Unique ID for React rendering keys (e.g., 'exp-0') */
  id: string;

  /** The IDs of all RegexTokens that this explanation describes */
  tokenIds: string[];

  /** Short headline title (e.g., 'Match text "hello"', 'Digit [0-9]') */
  title: string;

  /** Full descriptive sentence explaining what this element matches */
  summary: string;

  /** Optional technical details (e.g., ASCII range, engine caveats) */
  details?: string;

  /** Indentation depth level for nested capture groups */
  depth: number;

  /** Short tag badge displayed beside the explanation (e.g., 'Anchor', 'Class') */
  badge?: string;

  /** Tailwind CSS color classes applied to the badge pill */
  badgeColor?: string;
}

/**
 * Translates a regular expression pattern into an array of human-readable explanation blocks.
 * 
 * @param pattern - The raw regex pattern string
 * @returns Array of explanation blocks formatted for beginner readability
 * 
 * @example
 * ```typescript
 * const blocks = translateRegexToHuman('^\\d{4}$');
 * console.log(blocks[0].summary); // "Asserts position at the beginning of the string"
 * console.log(blocks[1].summary); // "Any digit character from 0 to 9 (exactly 4 times)"
 * ```
 */
export function translateRegexToHuman(pattern: string): ExplanationBlock[] {
  // Step 1: Return an empty array if no pattern is provided
  if (!pattern) {
    return [];
  }

  // Step 2: Break the pattern down into tokens
  const tokens = tokenizeRegex(pattern);

  // Step 3: Array to store our generated human explanations
  const explanationBlocks: ExplanationBlock[] = [];

  let tokenIndex = 0;
  let nestingDepth = 0;

  // Step 4: Loop through each token and translate it into plain English
  while (tokenIndex < tokens.length) {
    const currentToken = tokens[tokenIndex];
    const lookaheadToken = tokenIndex + 1 < tokens.length ? tokens[tokenIndex + 1] : null;

    // Check if the next token is a quantifier (like `+`, `*`, `?`, or `{2,5}`)
    const isFollowedByQuantifier = lookaheadToken !== null && lookaheadToken.category === 'quantifier';
    const quantifierInfo = isFollowedByQuantifier ? lookaheadToken.quantifier : null;
    const quantifierRawText = isFollowedByQuantifier ? lookaheadToken.raw : '';
    const associatedTokenIds = isFollowedByQuantifier
      ? [currentToken.id, lookaheadToken.id]
      : [currentToken.id];

    // ------------------------------------------------------------------------
    // CASE 1: COMBINE CONSECUTIVE LITERAL LETTERS INTO WORDS
    // ------------------------------------------------------------------------
    // If we have characters like 'p','i','z','z','a', it's much friendlier to say:
    // "Matches exact text 'pizza'" instead of five separate single-letter cards!
    if (currentToken.category === 'literal' && !isFollowedByQuantifier) {
      let combinedWord = currentToken.raw;
      const combinedTokenIds = [currentToken.id];
      let forwardIndex = tokenIndex + 1;

      while (forwardIndex < tokens.length && tokens[forwardIndex].category === 'literal') {
        const nextFollowingToken = forwardIndex + 1 < tokens.length ? tokens[forwardIndex + 1] : null;

        // If the character has its own quantifier (e.g., 'a' in 'ba+'), stop combining!
        if (nextFollowingToken && nextFollowingToken.category === 'quantifier') {
          break;
        }

        combinedWord += tokens[forwardIndex].raw;
        combinedTokenIds.push(tokens[forwardIndex].id);
        forwardIndex++;
      }

      explanationBlocks.push({
        id: `exp-${currentToken.start}`,
        tokenIds: combinedTokenIds,
        title: `Match text "${combinedWord}"`,
        summary: `Matches the exact string "${combinedWord}" (case sensitive)`,
        depth: nestingDepth,
        badge: 'Literal Text',
        badgeColor: 'text-sky-400 bg-sky-950/40 border-sky-800/50',
      });

      tokenIndex = forwardIndex;
      continue;
    }

    // ------------------------------------------------------------------------
    // CASE 2: GROUP OPENINGS & LOOKAROUNDS
    // ------------------------------------------------------------------------
    if (currentToken.category === 'group-open' || currentToken.category === 'lookaround') {
      nestingDepth++;

      const badgeLabel = currentToken.groupName
        ? `Named: ${currentToken.groupName}`
        : currentToken.category === 'lookaround'
        ? 'Assertion'
        : `Group #${currentToken.groupIndex ?? ''}`;

      const badgeColor = currentToken.category === 'lookaround'
        ? 'text-amber-400 bg-amber-950/40 border-amber-800/50'
        : 'text-purple-400 bg-purple-950/40 border-purple-800/50';

      explanationBlocks.push({
        id: `exp-${currentToken.start}`,
        tokenIds: [currentToken.id],
        title: currentToken.title,
        summary: currentToken.humanExplanation,
        depth: nestingDepth - 1,
        badge: badgeLabel,
        badgeColor,
      });

      tokenIndex++;
      continue;
    }

    // ------------------------------------------------------------------------
    // CASE 3: GROUP CLOSINGS
    // ------------------------------------------------------------------------
    if (currentToken.category === 'group-close') {
      // Decrease nesting depth (minimum 0)
      nestingDepth = Math.max(0, nestingDepth - 1);

      explanationBlocks.push({
        id: `exp-${currentToken.start}`,
        tokenIds: [currentToken.id],
        title: currentToken.title,
        summary: currentToken.humanExplanation,
        depth: nestingDepth,
        badge: 'Close Group',
        badgeColor: 'text-slate-400 bg-slate-800/40 border-slate-700/50',
      });

      tokenIndex++;
      continue;
    }

    // ------------------------------------------------------------------------
    // CASE 4: POSITION ANCHORS (^, $, \b)
    // ------------------------------------------------------------------------
    if (currentToken.category === 'anchor') {
      explanationBlocks.push({
        id: `exp-${currentToken.start}`,
        tokenIds: [currentToken.id],
        title: currentToken.title,
        summary: currentToken.humanExplanation,
        depth: nestingDepth,
        badge: 'Anchor',
        badgeColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50',
      });

      tokenIndex++;
      continue;
    }

    // ------------------------------------------------------------------------
    // CASE 5: ALTERNATION / OR (Pipe `|`)
    // ------------------------------------------------------------------------
    if (currentToken.category === 'alternation') {
      explanationBlocks.push({
        id: `exp-${currentToken.start}`,
        tokenIds: [currentToken.id],
        title: 'OR Condition (Alternation)',
        summary: 'Matches either the pattern before this bar OR the pattern after this bar',
        depth: nestingDepth,
        badge: 'Branch OR',
        badgeColor: 'text-rose-400 bg-rose-950/40 border-rose-800/50',
      });

      tokenIndex++;
      continue;
    }

    // ------------------------------------------------------------------------
    // CASE 6: CHARACTER CLASSES, ESCAPES & QUANTIFIED ELEMENTS
    // ------------------------------------------------------------------------
    let quantifierSentenceFragment = '';

    if (quantifierInfo) {
      if (quantifierInfo.min === 0 && quantifierInfo.max === null) {
        quantifierSentenceFragment = quantifierInfo.isLazy
          ? ' (0 or more times, lazy / shortest match)'
          : ' (0 or more times, greedy / longest match)';
      } else if (quantifierInfo.min === 1 && quantifierInfo.max === null) {
        quantifierSentenceFragment = quantifierInfo.isLazy
          ? ' (1 or more times, lazy / shortest match)'
          : ' (1 or more times, greedy / longest match)';
      } else if (quantifierInfo.min === 0 && quantifierInfo.max === 1) {
        quantifierSentenceFragment = ' (optional, 0 or 1 time)';
      } else if (quantifierInfo.max === null) {
        quantifierSentenceFragment = ` (at least ${quantifierInfo.min} times)`;
      } else if (quantifierInfo.min === quantifierInfo.max) {
        quantifierSentenceFragment = ` (exactly ${quantifierInfo.min} times)`;
      } else {
        quantifierSentenceFragment = ` (between ${quantifierInfo.min} and ${quantifierInfo.max} times)`;
      }
    }

    let finalSummary = currentToken.humanExplanation;
    if (isFollowedByQuantifier) {
      finalSummary = `${currentToken.humanExplanation}${quantifierSentenceFragment}`;
    }

    const badgeLabel = currentToken.category === 'char-class'
      ? 'Character Set'
      : currentToken.category === 'escape'
      ? 'Escape Code'
      : 'Token';

    const badgeColor = currentToken.category === 'char-class'
      ? 'text-cyan-400 bg-cyan-950/40 border-cyan-800/50'
      : 'text-blue-400 bg-blue-950/40 border-blue-800/50';

    explanationBlocks.push({
      id: `exp-${currentToken.start}`,
      tokenIds: associatedTokenIds,
      title: `${currentToken.title}${quantifierRawText ? ` ${quantifierRawText}` : ''}`,
      summary: finalSummary,
      details: currentToken.detail,
      depth: nestingDepth,
      badge: badgeLabel,
      badgeColor,
    });

    // Advance 2 tokens if this block absorbed a quantifier, otherwise advance 1
    tokenIndex += isFollowedByQuantifier ? 2 : 1;
  }

  return explanationBlocks;
}

/** Alias matching the original function name for backwards compatibility */
export const translateRegex = translateRegexToHuman;
