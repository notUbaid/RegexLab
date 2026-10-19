/**
 * ============================================================================
 * RegexLab - Regular Expression Tokenizer (Lexical Analyzer)
 * ============================================================================
 * 
 * Welcome! If you are learning how compilers or interpreters work, this file
 * is the first step in the parsing pipeline.
 * 
 * WHAT DOES A TOKENIZER DO?
 * A tokenizer takes a raw string of text (like `^[a-z0-9]+$`) and breaks it
 * down into individual meaningful chunks called "Tokens".
 * 
 * For example:
 * Input pattern: `^cat+`
 * Output tokens:
 *   1. `^`  -> Anchor (Start of line)
 *   2. `c`  -> Literal character 'c'
 *   3. `a`  -> Literal character 'a'
 *   4. `t`  -> Literal character 't'
 *   5. `+`  -> Quantifier (One or more repetitions)
 * 
 * This makes it super easy for the rest of our app (the AST visualizer,
 * the human translator, and the engine simulator) to understand each symbol!
 */

import { RegexToken, TokenCategory } from '../types/regex';

// ============================================================================
// CONSTANTS & HELPERS
// ============================================================================

/** Characters that have special meaning in regular expressions unless escaped */
const SPECIAL_METACHARACTERS = new Set([
  '^', '$', '\\', '.', '*', '+', '?', '(', ')', '[', ']', '{', '}', '|'
]);

/**
 * Checks whether a character is an ASCII digit (0 through 9).
 * 
 * @param char - The single character to test
 * @returns True if character is between '0' and '9'
 * 
 * @example
 * isAsciiDigit('5') // returns true
 * isAsciiDigit('a') // returns false
 */
function isAsciiDigit(char: string): boolean {
  return char >= '0' && char <= '9';
}

// ============================================================================
// MAIN TOKENIZE FUNCTION
// ============================================================================

/**
 * Converts a regular expression string into an array of detailed `RegexToken` objects.
 * 
 * @param pattern - The raw regular expression pattern (without slashes or flags)
 * @returns Array of tokens in the order they appear
 * 
 * @example
 * ```typescript
 * const tokens = tokenizeRegex('^hello\\d+');
 * console.log(tokens[0].title); // "Start of String / Line"
 * console.log(tokens[1].title); // "Literal 'h'"
 * ```
 */
export function tokenizeRegex(pattern: string): RegexToken[] {
  // Array that will store all the tokens we discover
  const tokens: RegexToken[] = [];

  // Pointer tracking our current character index in the pattern
  let currentIndex = 0;

  // Counter to assign 1-based IDs to capture groups: Group #1, Group #2, etc.
  let groupCounter = 0;

  // Stack keeping track of open groups so we know which group is being closed by ')'
  const openGroupsStack: Array<{ index: number; name?: string }> = [];

  // ==========================================================================
  // SCANNING LOOP: Read through the pattern character-by-character
  // ==========================================================================
  while (currentIndex < pattern.length) {
    const currentChar = pattern[currentIndex];
    const tokenStartPosition = currentIndex;

    // ------------------------------------------------------------------------
    // CASE 1: ESCAPE SEQUENCES (Starting with a backslash `\`)
    // ------------------------------------------------------------------------
    if (currentChar === '\\' && currentIndex + 1 < pattern.length) {
      const nextChar = pattern[currentIndex + 1];

      // Subcase 1A: Unicode Property Escape \p{Property} or \P{Property}
      // Example: \p{Letter} matches letters in any human language!
      if ((nextChar === 'p' || nextChar === 'P') && pattern[currentIndex + 2] === '{') {
        const closingBraceIndex = pattern.indexOf('}', currentIndex + 3);

        if (closingBraceIndex !== -1) {
          const propertyName = pattern.slice(currentIndex + 3, closingBraceIndex);
          const rawText = pattern.slice(tokenStartPosition, closingBraceIndex + 1);
          const isPositive = nextChar === 'p';

          tokens.push({
            id: `tok-${tokenStartPosition}`,
            category: 'char-class',
            raw: rawText,
            start: tokenStartPosition,
            end: closingBraceIndex + 1,
            title: `Unicode Property (${isPositive ? 'matches' : 'negates'})`,
            humanExplanation: isPositive
              ? `Any character with Unicode property "${propertyName}"`
              : `Any character NOT having Unicode property "${propertyName}"`,
            detail: `Unicode category or script: ${propertyName}`,
          });

          // Advance cursor past the closing brace '}'
          currentIndex = closingBraceIndex + 1;
          continue;
        }
      }

      // Subcase 1B: Hexadecimal character \xHH (e.g., \x20 for space)
      if (nextChar === 'x' && currentIndex + 3 < pattern.length) {
        const hexDigits = pattern.slice(currentIndex + 2, currentIndex + 4);
        const rawText = pattern.slice(tokenStartPosition, currentIndex + 4);

        tokens.push({
          id: `tok-${tokenStartPosition}`,
          category: 'escape',
          raw: rawText,
          start: tokenStartPosition,
          end: currentIndex + 4,
          title: 'Hexadecimal Character Code',
          humanExplanation: `Character with hexadecimal ASCII value 0x${hexDigits}`,
          detail: `Hex code \\x${hexDigits}`,
        });

        currentIndex += 4;
        continue;
      }

      // Subcase 1C: Unicode character code \uHHHH (e.g., \u0041 for 'A')
      if (nextChar === 'u' && currentIndex + 5 < pattern.length && pattern[currentIndex + 2] !== '{') {
        const unicodeDigits = pattern.slice(currentIndex + 2, currentIndex + 6);
        const rawText = pattern.slice(tokenStartPosition, currentIndex + 6);

        tokens.push({
          id: `tok-${tokenStartPosition}`,
          category: 'escape',
          raw: rawText,
          start: tokenStartPosition,
          end: currentIndex + 6,
          title: 'Unicode Code Point',
          humanExplanation: `Unicode character U+${unicodeDigits}`,
          detail: `Unicode escape \\u${unicodeDigits}`,
        });

        currentIndex += 6;
        continue;
      }

      // Subcase 1D: Numbered Backreferences \1 through \9
      // Example: `(\w+)\s+\1` finds duplicate words like "the the"
      if (isAsciiDigit(nextChar)) {
        tokens.push({
          id: `tok-${tokenStartPosition}`,
          category: 'backreference',
          raw: `\\${nextChar}`,
          start: tokenStartPosition,
          end: currentIndex + 2,
          title: `Backreference to Group #${nextChar}`,
          humanExplanation: `Exact text previously matched by capture group #${nextChar}`,
          detail: `Must equal capture group #${nextChar}`,
        });

        currentIndex += 2;
        continue;
      }

      // Subcase 1E: Named Backreferences \k<name>
      // Example: `(?<tag>\w+)...</\k<tag>>` matches matching HTML tags
      if (nextChar === 'k' && pattern[currentIndex + 2] === '<') {
        const closingAngleBracket = pattern.indexOf('>', currentIndex + 3);

        if (closingAngleBracket !== -1) {
          const groupName = pattern.slice(currentIndex + 3, closingAngleBracket);
          const rawText = pattern.slice(tokenStartPosition, closingAngleBracket + 1);

          tokens.push({
            id: `tok-${tokenStartPosition}`,
            category: 'backreference',
            raw: rawText,
            start: tokenStartPosition,
            end: closingAngleBracket + 1,
            title: `Named Backreference: "${groupName}"`,
            humanExplanation: `Exact text previously captured by named group "${groupName}"`,
            detail: `Refers to group "${groupName}"`,
          });

          currentIndex = closingAngleBracket + 1;
          continue;
        }
      }

      // Subcase 1F: Common Shorthand Character Classes (\d, \w, \s, etc.)
      let shorthandToken: RegexToken | null = null;

      switch (nextChar) {
        case 'd':
          shorthandToken = {
            id: `tok-${tokenStartPosition}`,
            category: 'char-class',
            raw: '\\d',
            start: tokenStartPosition,
            end: currentIndex + 2,
            title: 'Digit [0-9]',
            humanExplanation: 'Any digit character from 0 to 9',
            detail: 'Equivalent to [0-9]',
          };
          break;

        case 'D':
          shorthandToken = {
            id: `tok-${tokenStartPosition}`,
            category: 'char-class',
            raw: '\\D',
            start: tokenStartPosition,
            end: currentIndex + 2,
            title: 'Non-Digit [^0-9]',
            humanExplanation: 'Any character that is NOT a digit',
            detail: 'Equivalent to [^0-9]',
          };
          break;

        case 'w':
          shorthandToken = {
            id: `tok-${tokenStartPosition}`,
            category: 'char-class',
            raw: '\\w',
            start: tokenStartPosition,
            end: currentIndex + 2,
            title: 'Word Character',
            humanExplanation: 'Any letter, number, or underscore ([a-zA-Z0-9_])',
            detail: 'Equivalent to [a-zA-Z0-9_]',
          };
          break;

        case 'W':
          shorthandToken = {
            id: `tok-${tokenStartPosition}`,
            category: 'char-class',
            raw: '\\W',
            start: tokenStartPosition,
            end: currentIndex + 2,
            title: 'Non-Word Character',
            humanExplanation: 'Any character other than letters, numbers, or underscore',
            detail: 'Equivalent to [^a-zA-Z0-9_]',
          };
          break;

        case 's':
          shorthandToken = {
            id: `tok-${tokenStartPosition}`,
            category: 'char-class',
            raw: '\\s',
            start: tokenStartPosition,
            end: currentIndex + 2,
            title: 'Whitespace Character',
            humanExplanation: 'Any space, tab, newline, or carriage return',
            detail: 'Matches space, \\t, \\n, \\r, \\f, \\v',
          };
          break;

        case 'S':
          shorthandToken = {
            id: `tok-${tokenStartPosition}`,
            category: 'char-class',
            raw: '\\S',
            start: tokenStartPosition,
            end: currentIndex + 2,
            title: 'Non-Whitespace Character',
            humanExplanation: 'Any character that is NOT a space, tab, or newline',
            detail: 'Matches any non-space character',
          };
          break;

        case 'b':
          shorthandToken = {
            id: `tok-${tokenStartPosition}`,
            category: 'anchor',
            raw: '\\b',
            start: tokenStartPosition,
            end: currentIndex + 2,
            title: 'Word Boundary (\\b)',
            humanExplanation: 'Zero-width boundary between a word character and non-word character',
            detail: 'Asserts position at start or end of a word',
          };
          break;

        case 'B':
          shorthandToken = {
            id: `tok-${tokenStartPosition}`,
            category: 'anchor',
            raw: '\\B',
            start: tokenStartPosition,
            end: currentIndex + 2,
            title: 'Non-Word Boundary (\\B)',
            humanExplanation: 'Position that is NOT a word boundary (inside a word or between spaces)',
            detail: 'Zero-width negative boundary',
          };
          break;

        case 'n':
          shorthandToken = {
            id: `tok-${tokenStartPosition}`,
            category: 'escape',
            raw: '\\n',
            start: tokenStartPosition,
            end: currentIndex + 2,
            title: 'Newline (Line Feed \\n)',
            humanExplanation: 'Line feed character (ASCII 10)',
          };
          break;

        case 'r':
          shorthandToken = {
            id: `tok-${tokenStartPosition}`,
            category: 'escape',
            raw: '\\r',
            start: tokenStartPosition,
            end: currentIndex + 2,
            title: 'Carriage Return (\\r)',
            humanExplanation: 'Carriage return character (ASCII 13)',
          };
          break;

        case 't':
          shorthandToken = {
            id: `tok-${tokenStartPosition}`,
            category: 'escape',
            raw: '\\t',
            start: tokenStartPosition,
            end: currentIndex + 2,
            title: 'Tab Character (\\t)',
            humanExplanation: 'Horizontal tab character (ASCII 9)',
          };
          break;

        default:
          // Any other escaped symbol is treated as an escaped literal (e.g., `\.` or `\\`)
          shorthandToken = {
            id: `tok-${tokenStartPosition}`,
            category: 'escape',
            raw: `\\${nextChar}`,
            start: tokenStartPosition,
            end: currentIndex + 2,
            title: `Escaped Literal: "${nextChar}"`,
            humanExplanation: `Matches the literal character "${nextChar}" (escaped to avoid special meaning)`,
          };
      }

      if (shorthandToken) {
        tokens.push(shorthandToken);
        currentIndex += 2;
        continue;
      }
    }

    // ------------------------------------------------------------------------
    // CASE 2: BRACKETED CHARACTER CLASS (e.g., `[a-z0-9]` or `[^abc]`)
    // ------------------------------------------------------------------------
    if (currentChar === '[') {
      let scanIndex = currentIndex + 1;
      let isNegated = false;

      // If the very first character inside `[` is `^`, this set is NEGATED
      if (pattern[scanIndex] === '^') {
        isNegated = true;
        scanIndex++;
      }

      // Search for the closing bracket `]`, ignoring any escaped `\]` inside
      while (scanIndex < pattern.length) {
        if (pattern[scanIndex] === '\\') {
          // Skip the escaped character
          scanIndex += 2;
        } else if (pattern[scanIndex] === ']') {
          break;
        } else {
          scanIndex++;
        }
      }

      const tokenEndPosition = Math.min(scanIndex + 1, pattern.length);
      const rawText = pattern.slice(tokenStartPosition, tokenEndPosition);
      const innerContent = pattern.slice(
        isNegated ? tokenStartPosition + 2 : tokenStartPosition + 1,
        tokenEndPosition - 1
      );

      const explanation = isNegated
        ? `Any single character EXCEPT those in the set: [${innerContent}]`
        : `Any single character that matches: [${innerContent}]`;

      tokens.push({
        id: `tok-${tokenStartPosition}`,
        category: 'char-class',
        raw: rawText,
        start: tokenStartPosition,
        end: tokenEndPosition,
        title: isNegated ? 'Negated Character Set' : 'Character Set',
        humanExplanation: explanation,
        detail: `Matches ${isNegated ? 'none' : 'one'} of: ${innerContent}`,
      });

      currentIndex = tokenEndPosition;
      continue;
    }

    // ------------------------------------------------------------------------
    // CASE 3: GROUPS & LOOKAROUNDS (Starting with `(`)
    // ------------------------------------------------------------------------
    if (currentChar === '(') {
      // 3A: Non-capturing group `(?:...)`
      if (pattern.startsWith('(?:', currentIndex)) {
        tokens.push({
          id: `tok-${tokenStartPosition}`,
          category: 'group-open',
          raw: '(?:',
          start: tokenStartPosition,
          end: currentIndex + 3,
          title: 'Non-Capturing Group (Start)',
          humanExplanation: 'Groups patterns together for quantifiers without saving memory for capture',
          detail: 'Non-capturing container',
        });
        openGroupsStack.push({ index: -1 });
        currentIndex += 3;
        continue;
      }

      // 3B: Positive Lookahead `(?=...)`
      if (pattern.startsWith('(?=', currentIndex)) {
        tokens.push({
          id: `tok-${tokenStartPosition}`,
          category: 'lookaround',
          raw: '(?=',
          start: tokenStartPosition,
          end: currentIndex + 3,
          title: 'Positive Lookahead (Start)',
          humanExplanation: 'Asserts that the text following matches this pattern (does not consume characters)',
          detail: 'Zero-width forward lookahead assertion',
        });
        openGroupsStack.push({ index: -1 });
        currentIndex += 3;
        continue;
      }

      // 3C: Negative Lookahead `(?!...)`
      if (pattern.startsWith('(?!', currentIndex)) {
        tokens.push({
          id: `tok-${tokenStartPosition}`,
          category: 'lookaround',
          raw: '(?!',
          start: tokenStartPosition,
          end: currentIndex + 3,
          title: 'Negative Lookahead (Start)',
          humanExplanation: 'Asserts that the text following does NOT match this pattern (does not consume characters)',
          detail: 'Zero-width negative forward lookahead',
        });
        openGroupsStack.push({ index: -1 });
        currentIndex += 3;
        continue;
      }

      // 3D: Positive Lookbehind `(?<=...)`
      if (pattern.startsWith('(?<=', currentIndex)) {
        tokens.push({
          id: `tok-${tokenStartPosition}`,
          category: 'lookaround',
          raw: '(?<=',
          start: tokenStartPosition,
          end: currentIndex + 4,
          title: 'Positive Lookbehind (Start)',
          humanExplanation: 'Asserts that the text preceding matches this pattern (does not consume characters)',
          detail: 'Zero-width backward lookbehind assertion',
        });
        openGroupsStack.push({ index: -1 });
        currentIndex += 4;
        continue;
      }

      // 3E: Negative Lookbehind `(?<!...)`
      if (pattern.startsWith('(?<!', currentIndex)) {
        tokens.push({
          id: `tok-${tokenStartPosition}`,
          category: 'lookaround',
          raw: '(?<!',
          start: tokenStartPosition,
          end: currentIndex + 4,
          title: 'Negative Lookbehind (Start)',
          humanExplanation: 'Asserts that the text preceding does NOT match this pattern (does not consume characters)',
          detail: 'Zero-width negative backward lookbehind',
        });
        openGroupsStack.push({ index: -1 });
        currentIndex += 4;
        continue;
      }

      // 3F: Named Capturing Group `(?<name>...)`
      if (pattern.startsWith('(?<', currentIndex)) {
        const closingAngleBracket = pattern.indexOf('>', currentIndex + 3);

        if (closingAngleBracket !== -1) {
          const groupName = pattern.slice(currentIndex + 3, closingAngleBracket);
          groupCounter++;
          const currentGroupIndex = groupCounter;

          tokens.push({
            id: `tok-${tokenStartPosition}`,
            category: 'group-open',
            raw: pattern.slice(tokenStartPosition, closingAngleBracket + 1),
            start: tokenStartPosition,
            end: closingAngleBracket + 1,
            title: `Named Capture Group "${groupName}" (#${currentGroupIndex})`,
            humanExplanation: `Captures matched text into named variable "${groupName}"`,
            groupIndex: currentGroupIndex,
            groupName,
            detail: `Stores text into groups.${groupName}`,
          });

          openGroupsStack.push({ index: currentGroupIndex, name: groupName });
          currentIndex = closingAngleBracket + 1;
          continue;
        }
      }

      // 3G: Standard Numbered Capturing Group `(...)`
      groupCounter++;
      const currentGroupNumber = groupCounter;

      tokens.push({
        id: `tok-${tokenStartPosition}`,
        category: 'group-open',
        raw: '(',
        start: tokenStartPosition,
        end: currentIndex + 1,
        title: `Capture Group #${currentGroupNumber} (Start)`,
        humanExplanation: `Saves the matched text into group variable #${currentGroupNumber}`,
        groupIndex: currentGroupNumber,
        detail: `Capture Group #${currentGroupNumber}`,
      });

      openGroupsStack.push({ index: currentGroupNumber });
      currentIndex++;
      continue;
    }

    // ------------------------------------------------------------------------
    // CASE 4: GROUP CLOSING PARENTHESIS `)`
    // ------------------------------------------------------------------------
    if (currentChar === ')') {
      const closedGroup = openGroupsStack.pop();

      tokens.push({
        id: `tok-${currentIndex}`,
        category: 'group-close',
        raw: ')',
        start: currentIndex,
        end: currentIndex + 1,
        title: closedGroup && closedGroup.index > 0
          ? `Capture Group #${closedGroup.index} (End)`
          : 'Group End',
        humanExplanation: closedGroup && closedGroup.index > 0
          ? `Ends capture group #${closedGroup.index}`
          : 'Closes group',
        groupIndex: closedGroup?.index,
        groupName: closedGroup?.name,
      });

      currentIndex++;
      continue;
    }

    // ------------------------------------------------------------------------
    // CASE 5: QUANTIFIERS (*, +, ?, and {min,max})
    // ------------------------------------------------------------------------
    if (currentChar === '*' || currentChar === '+' || currentChar === '?') {
      let rawText = currentChar;
      let isLazy = false;
      let isPossessive = false;

      // Check for Lazy modifier: e.g., `*?` or `+?`
      if (currentIndex + 1 < pattern.length && pattern[currentIndex + 1] === '?') {
        isLazy = true;
        rawText += '?';
        currentIndex++;
      }
      // Check for Possessive modifier: e.g., `*+` or `++`
      else if (currentIndex + 1 < pattern.length && pattern[currentIndex + 1] === '+') {
        isPossessive = true;
        rawText += '+';
        currentIndex++;
      }

      let quantifierTitle = '';
      let quantifierExplanation = '';
      let minRepetitions = 0;
      let maxRepetitions: number | null = null;

      if (currentChar === '*') {
        minRepetitions = 0;
        maxRepetitions = null; // Infinite
        quantifierTitle = `Zero or More (${isLazy ? 'Lazy' : isPossessive ? 'Possessive' : 'Greedy'})`;
        quantifierExplanation = `Matches 0 or more times (${isLazy ? 'stops at shortest match' : 'matches as many as possible'})`;
      } else if (currentChar === '+') {
        minRepetitions = 1;
        maxRepetitions = null; // Infinite
        quantifierTitle = `One or More (${isLazy ? 'Lazy' : isPossessive ? 'Possessive' : 'Greedy'})`;
        quantifierExplanation = `Matches 1 or more times (${isLazy ? 'stops at shortest match' : 'matches as many as possible'})`;
      } else if (currentChar === '?') {
        minRepetitions = 0;
        maxRepetitions = 1;
        quantifierTitle = `Optional (${isLazy ? 'Lazy' : isPossessive ? 'Possessive' : 'Greedy'})`;
        quantifierExplanation = `Matches 0 or 1 time (optional element)`;
      }

      tokens.push({
        id: `tok-${tokenStartPosition}`,
        category: 'quantifier',
        raw: rawText,
        start: tokenStartPosition,
        end: currentIndex + 1,
        title: quantifierTitle,
        humanExplanation: quantifierExplanation,
        quantifier: {
          min: minRepetitions,
          max: maxRepetitions,
          isLazy,
          isPossessive,
        },
      });

      currentIndex++;
      continue;
    }

    // Range quantifier: `{n}`, `{min,max}`, or `{min,}`
    if (currentChar === '{' && /\{\d+(?:,\d*)?\}/.test(pattern.slice(currentIndex))) {
      const closingBrace = pattern.indexOf('}', currentIndex);

      if (closingBrace !== -1) {
        let rawText = pattern.slice(tokenStartPosition, closingBrace + 1);
        let endPosition = closingBrace + 1;
        let isLazy = false;
        let isPossessive = false;

        // Check for lazy or possessive modifiers
        if (endPosition < pattern.length && pattern[endPosition] === '?') {
          isLazy = true;
          rawText += '?';
          endPosition++;
        } else if (endPosition < pattern.length && pattern[endPosition] === '+') {
          isPossessive = true;
          rawText += '+';
          endPosition++;
        }

        const innerNumbers = pattern.slice(tokenStartPosition + 1, closingBrace);
        const numberParts = innerNumbers.split(',');
        const minCount = parseInt(numberParts[0], 10);
        let maxCount: number | null = minCount;
        let explanationText = '';

        if (numberParts.length === 2) {
          maxCount = numberParts[1] === '' ? null : parseInt(numberParts[1], 10);
          if (maxCount === null) {
            explanationText = `Matches at least ${minCount} times (${isLazy ? 'lazy' : 'greedy'})`;
          } else {
            explanationText = `Matches between ${minCount} and ${maxCount} times (${isLazy ? 'lazy' : 'greedy'})`;
          }
        } else {
          explanationText = `Matches exactly ${minCount} times`;
        }

        tokens.push({
          id: `tok-${tokenStartPosition}`,
          category: 'quantifier',
          raw: rawText,
          start: tokenStartPosition,
          end: endPosition,
          title: `Quantifier ${rawText}`,
          humanExplanation: explanationText,
          quantifier: {
            min: minCount,
            max: maxCount,
            isLazy,
            isPossessive,
          },
        });

        currentIndex = endPosition;
        continue;
      }
    }

    // ------------------------------------------------------------------------
    // CASE 6: ANCHORS (^ and $)
    // ------------------------------------------------------------------------
    if (currentChar === '^') {
      tokens.push({
        id: `tok-${currentIndex}`,
        category: 'anchor',
        raw: '^',
        start: currentIndex,
        end: currentIndex + 1,
        title: 'Start of String / Line (^)',
        humanExplanation: 'Asserts position at the beginning of the string (or beginning of a line with /m flag)',
        detail: 'Zero-width anchor at start of input',
      });
      currentIndex++;
      continue;
    }

    if (currentChar === '$') {
      tokens.push({
        id: `tok-${currentIndex}`,
        category: 'anchor',
        raw: '$',
        start: currentIndex,
        end: currentIndex + 1,
        title: 'End of String / Line ($)',
        humanExplanation: 'Asserts position at the end of the string (or end of a line with /m flag)',
        detail: 'Zero-width anchor at end of input',
      });
      currentIndex++;
      continue;
    }

    // ------------------------------------------------------------------------
    // CASE 7: ALTERNATION (Pipe `|`)
    // ------------------------------------------------------------------------
    if (currentChar === '|') {
      tokens.push({
        id: `tok-${currentIndex}`,
        category: 'alternation',
        raw: '|',
        start: currentIndex,
        end: currentIndex + 1,
        title: 'OR Operator (Alternation |)',
        humanExplanation: 'Acts like a logical OR: matches either the pattern on the left OR on the right',
        detail: 'Branching choice separator',
      });
      currentIndex++;
      continue;
    }

    // ------------------------------------------------------------------------
    // CASE 8: WILDCARD DOT (`.`)
    // ------------------------------------------------------------------------
    if (currentChar === '.') {
      tokens.push({
        id: `tok-${currentIndex}`,
        category: 'char-class',
        raw: '.',
        start: currentIndex,
        end: currentIndex + 1,
        title: 'Any Character Wildcard (.)',
        humanExplanation: 'Matches any single character except newlines (matches newlines too if /s dotAll flag is set)',
        detail: 'Universal wildcard character',
      });
      currentIndex++;
      continue;
    }

    // ------------------------------------------------------------------------
    // CASE 9: PLAIN LITERAL CHARACTER
    // ------------------------------------------------------------------------
    tokens.push({
      id: `tok-${currentIndex}`,
      category: 'literal',
      raw: currentChar,
      start: currentIndex,
      end: currentIndex + 1,
      title: `Literal "${currentChar}"`,
      humanExplanation: `Matches the exact character "${currentChar}"`,
      detail: `Exact character match (ASCII: ${currentChar.charCodeAt(0)})`,
    });

    currentIndex++;
  }

  return tokens;
}
