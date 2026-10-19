/**
 * ============================================================================
 * RegexLab - Failure Diagnostic Engine (Regex Debugger)
 * ============================================================================
 * 
 * Welcome! One of the biggest frustrations when learning regex is seeing:
 * "No Match" with ZERO explanation of why it failed or how to fix it.
 * 
 * In standard coding, a compiler gives you a line number and error message.
 * RegexLab's Debugger brings that exact experience to regular expressions!
 * 
 * WHAT THIS MODULE DOES:
 * When a regex fails to match a test string, this diagnostic engine:
 *   1. Checks if the regex has a syntax error (and explains the syntax rule).
 *   2. Detects Start Anchor (`^`) mismatches (e.g. pattern matches later in text).
 *   3. Detects End Anchor (`$`) mismatches (e.g. pattern matched, but trailing text exists).
 *   4. Detects Casing mismatches (e.g. would match if `/i` flag were enabled).
 *   5. Pinpoints the exact character offset where the match failed.
 *   6. Provides 1-click suggested fixes to help beginners solve the problem!
 */

import { DebuggerAnalysis } from '../types/regex';
import { tokenizeRegex } from './tokenizer';

/**
 * Diagnoses why a regular expression failed to match a test string.
 * 
 * @param pattern - The regex pattern to test
 * @param text - The sample text being matched
 * @param flags - Regex flags (e.g., 'i', 'm')
 * @returns Comprehensive diagnostic report with failure offset and suggested fixes
 * 
 * @example
 * ```typescript
 * const result = diagnoseRegexFailure('^cat', 'a cat');
 * console.log(result.failureIndex); // 0
 * console.log(result.suggestedFixes[0]); // "Remove the '^' anchor..."
 * ```
 */
export function diagnoseRegexFailure(
  pattern: string,
  text: string,
  flags: string = ''
): DebuggerAnalysis {
  // Step 1: Handle empty pattern
  if (!pattern) {
    return {
      matched: false,
      failureIndex: 0,
      expectedDescription: 'A valid pattern',
      actualChar: '',
      suggestedFixes: ['Type a regular expression into the editor to begin'],
      explanation: 'The pattern is currently empty. Enter symbols like [a-z] or \\d to test.',
    };
  }

  // Step 2: Test if the regex actually matches successfully
  try {
    const compiledRegex = new RegExp(pattern, flags);
    if (compiledRegex.test(text)) {
      return {
        matched: true,
        failureIndex: -1,
        expectedDescription: 'Match succeeded',
        actualChar: '',
        suggestedFixes: [],
        explanation: 'Great news! The pattern successfully matches the input text.',
      };
    }
  } catch (err: unknown) {
    // If the browser's regex engine throws a syntax error, catch it safely without using 'any'
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      matched: false,
      failureIndex: 0,
      expectedDescription: 'Valid regex syntax',
      actualChar: '',
      suggestedFixes: [
        'Check for unclosed parentheses `(`, brackets `[`, or trailing backslashes `\\`',
      ],
      explanation: `Syntax Error: ${errorMessage}`,
    };
  }

  // Step 3: Handle empty test text
  if (text.length === 0) {
    return {
      matched: false,
      failureIndex: 0,
      expectedDescription: 'Non-empty input text',
      actualChar: 'EOF (End of File)',
      suggestedFixes: ['Enter sample text into the test area to see matches'],
      explanation: 'The test string is empty. The pattern requires text to match against.',
    };
  }

  const tokens = tokenizeRegex(pattern);
  const isCaseInsensitive = flags.includes('i');

  // --------------------------------------------------------------------------
  // CHECK 1: Start Anchor `^` Mismatch
  // Did the user use `^` when the match occurs somewhere in the middle of the text?
  // --------------------------------------------------------------------------
  if (tokens.length > 0 && tokens[0].category === 'anchor' && tokens[0].raw === '^') {
    const patternWithoutStartAnchor = pattern.replace(/^\^/, '');
    try {
      const regexWithoutStart = new RegExp(patternWithoutStartAnchor, flags);
      const matchLaterInText = regexWithoutStart.exec(text);

      if (matchLaterInText && matchLaterInText.index > 0) {
        return {
          matched: false,
          failureIndex: 0,
          expectedDescription: `Start of string "^" at index 0`,
          actualChar: `'${text[0]}'`,
          suggestedFixes: [
            'Remove the "^" anchor if you want to match anywhere in the text',
            `Or adjust your text so it starts with "${matchLaterInText[0].slice(0, 6)}"`,
          ],
          explanation: `The pattern starts with "^" which requires a match at index 0. A valid match was found later at index ${matchLaterInText.index} ("${matchLaterInText[0]}").`,
        };
      }
    } catch {
      // Ignore fallback regex compilation errors
    }
  }

  // --------------------------------------------------------------------------
  // CHECK 2: End Anchor `$` Mismatch
  // Did the pattern match, but failed because extra trailing characters exist?
  // --------------------------------------------------------------------------
  if (
    tokens.length > 0 &&
    tokens[tokens.length - 1].category === 'anchor' &&
    tokens[tokens.length - 1].raw === '$'
  ) {
    const patternWithoutEndAnchor = pattern.replace(/\$$/, '');
    try {
      const regexWithoutEnd = new RegExp(patternWithoutEndAnchor, flags);
      const prefixMatch = regexWithoutEnd.exec(text);

      if (prefixMatch && prefixMatch.index + prefixMatch[0].length < text.length) {
        const trailingText = text.slice(prefixMatch.index + prefixMatch[0].length);
        const matchEndPosition = prefixMatch.index + prefixMatch[0].length;

        return {
          matched: false,
          failureIndex: matchEndPosition,
          expectedDescription: 'End of string "$"',
          actualChar: `'${trailingText[0]}'`,
          suggestedFixes: [
            'Remove the "$" anchor to match without requiring full string consumption',
            'Or append ".*" before "$" to allow trailing characters',
          ],
          explanation: `The pattern matched "${prefixMatch[0]}", but failed because extra trailing characters "${trailingText.slice(0, 15)}" exist before the end anchor "$".`,
        };
      }
    } catch {
      // Ignore fallback regex compilation errors
    }
  }

  // --------------------------------------------------------------------------
  // CHECK 3: Character Casing Mismatch
  // Would the pattern match if the case-insensitive `/i` flag were enabled?
  // --------------------------------------------------------------------------
  if (!isCaseInsensitive) {
    try {
      const regexWithCaseInsensitive = new RegExp(pattern, `${flags}i`);
      if (regexWithCaseInsensitive.test(text)) {
        return {
          matched: false,
          failureIndex: 0,
          expectedDescription: 'Exact character casing (uppercase vs lowercase)',
          actualChar: 'Different case letter',
          suggestedFixes: [
            'Enable the "i" flag (case-insensitive matching)',
            'Or update your character sets to allow both cases (e.g. [a-zA-Z])',
          ],
          explanation: 'The pattern matches when letter casing is ignored! There is an uppercase vs lowercase mismatch.',
        };
      }
    } catch {
      // Ignore fallback regex compilation errors
    }
  }

  // --------------------------------------------------------------------------
  // CHECK 4: Progressive Prefix Search
  // Find the furthest character offset where the pattern was still partially matching
  // --------------------------------------------------------------------------
  let furthestProgressIndex = 0;

  for (let textIndex = 0; textIndex < text.length; textIndex++) {
    const textSubstring = text.slice(0, textIndex + 1);
    let matchedPrefix = false;

    for (let patternLength = 1; patternLength <= pattern.length; patternLength++) {
      try {
        const subPattern = pattern.slice(0, patternLength);
        const subRegex = new RegExp(subPattern, flags);
        if (subRegex.test(textSubstring)) {
          matchedPrefix = true;
          break;
        }
      } catch {
        // Partial subpattern might not be valid regex yet (e.g. unclosed group)
      }
    }

    if (matchedPrefix) {
      furthestProgressIndex = textIndex + 1;
    } else {
      break;
    }
  }

  const failureOffset = Math.min(furthestProgressIndex, text.length - 1);
  const offendingCharacter = text[failureOffset] ?? 'EOF';
  const suggestedFixList: string[] = [];
  let detailedExplanation = '';

  // Provide smart suggestions based on the character type at the failure point
  if (/\d/.test(offendingCharacter)) {
    detailedExplanation = `Encountered digit '${offendingCharacter}', but the pattern expected a non-numeric character or different token.`;
    suggestedFixList.push(`If numbers are allowed here, add \\d or [0-9] to your pattern`);
  } else if (/[a-zA-Z]/.test(offendingCharacter)) {
    detailedExplanation = `Encountered letter '${offendingCharacter}', but the pattern expected a different character type.`;
    suggestedFixList.push(`Add [a-zA-Z] or \\w to allow letters at this position`);
  } else if (/\s/.test(offendingCharacter)) {
    detailedExplanation = `Encountered whitespace '${offendingCharacter}', but the pattern does not permit spaces here.`;
    suggestedFixList.push(`Add \\s* to optionally accept whitespace characters`);
  } else {
    detailedExplanation = `Encountered symbol '${offendingCharacter}', which was rejected by the active pattern token.`;
    suggestedFixList.push(
      `Escape the symbol \\${offendingCharacter} or include it inside a character class [${offendingCharacter}]`
    );
  }

  return {
    matched: false,
    failureIndex: failureOffset,
    expectedDescription: `Matching token at text position ${failureOffset}`,
    actualChar: `'${offendingCharacter}'`,
    suggestedFixes: suggestedFixList,
    explanation: detailedExplanation,
  };
}
