/**
 * ============================================================================
 * RegexLab - Regex State Machine & Execution Simulator
 * ============================================================================
 * 
 * Welcome! This is the "brain" behind the Engine Visualizer.
 * 
 * HOW DO REGEX ENGINES ACTUALLY WORK?
 * Most developers treat regular expressions as a black box: you input a pattern
 * and a string, and it magically returns true or false.
 * 
 * But under the hood, a regex engine is a "Virtual Machine" or "State Machine"
 * that steps through your text character-by-character:
 * 
 *   1. It starts a search cursor at character 0 of your text.
 *   2. It compares the current character with the first token in your regex.
 *   3. If it matches, it moves BOTH the regex cursor and the text cursor forward.
 *   4. If a greedy quantifier (like `+` or `*`) is used, it consumes as many
 *      characters as possible.
 *   5. If a later token fails, it "backtracks" (rewinds) to try alternative paths!
 *   6. If all paths fail starting at character 0, it advances the search cursor
 *      to character 1 and tries again!
 * 
 * This file records every single one of those decisions into an array of
 * `ExecutionStep` objects so users can watch the machine think in slow motion!
 */

import { ExecutionStep } from '../types/regex';
import { tokenizeRegex } from './tokenizer';

// ============================================================================
// CONSTANTS
// ============================================================================

/** Maximum number of recorded steps to prevent browser tab freezing on huge texts */
const MAX_SIMULATION_STEPS = 500;

/** Preview string length for debugging logs */
const LOG_PREVIEW_LIMIT = 24;

// ============================================================================
// SIMULATION FUNCTION
// ============================================================================

/**
 * Simulates the execution of a regular expression against an input string.
 * Records every step, comparison, branch, and backtrack for educational playback.
 * 
 * @param pattern - The regular expression pattern string
 * @param text - The test string being searched
 * @param flags - Regex flags (e.g., 'i' for case-insensitive, 'm' for multiline)
 * @returns Array of sequential execution steps
 * 
 * @example
 * ```typescript
 * const trace = simulateRegexExecution('a+b', 'aaab');
 * console.log(trace.length); // e.g. 8 steps
 * console.log(trace[0].action); // 'start'
 * ```
 */
export function simulateRegexExecution(
  pattern: string,
  text: string,
  flags: string = 'g'
): ExecutionStep[] {
  const recordedSteps: ExecutionStep[] = [];

  // If either pattern or text is completely empty, return empty trace
  if (!pattern) {
    return recordedSteps;
  }

  // Tokenize the pattern into structured objects
  const tokens = tokenizeRegex(pattern);
  let stepCounter = 0;

  /**
   * Helper function to record a single action into the timeline.
   */
  const recordStep = (
    regexIndex: number,
    textIndex: number,
    action: ExecutionStep['action'],
    description: string,
    extra: Partial<ExecutionStep> = {}
  ): void => {
    // Safety check: stop recording if we exceed the maximum step limit
    if (recordedSteps.length >= MAX_SIMULATION_STEPS) {
      return;
    }

    const safeTextIndex = Math.min(textIndex, text.length);

    recordedSteps.push({
      stepIndex: stepCounter++,
      regexIndex,
      textIndex: safeTextIndex,
      action,
      description,
      matchedSoFar: text.slice(0, safeTextIndex),
      stackDepth: extra.stackDepth ?? 0,
      ...extra,
    });
  };

  // Step 0: Record initial engine boot-up state
  const textPreview = text.length > LOG_PREVIEW_LIMIT
    ? `${text.slice(0, LOG_PREVIEW_LIMIT)}...`
    : text;

  recordStep(
    0,
    0,
    'start',
    `Engine initialized: evaluating /${pattern}/${flags} against "${textPreview}"`
  );

  let matchFound = false;
  const isCaseInsensitive = flags.includes('i');
  const isMultiline = flags.includes('m');
  const isDotAll = flags.includes('s');

  /**
   * Helper to test if a character matches a specific token.
   */
  const doesCharacterMatchToken = (
    charIndex: number,
    token: (typeof tokens)[0]
  ): boolean => {
    if (charIndex >= text.length) {
      return false; // Reached End-Of-File (EOF)
    }

    const character = text[charIndex];

    // Check 1: Exact Literal Letter
    if (token.category === 'literal') {
      return isCaseInsensitive
        ? character.toLowerCase() === token.raw.toLowerCase()
        : character === token.raw;
    }

    // Check 2: Shorthand Digit \d
    if (token.raw === '\\d') return /\d/.test(character);
    if (token.raw === '\\D') return /\D/.test(character);

    // Check 3: Shorthand Word Character \w
    if (token.raw === '\\w') return /\w/.test(character);
    if (token.raw === '\\W') return /\W/.test(character);

    // Check 4: Shorthand Whitespace \s
    if (token.raw === '\\s') return /\s/.test(character);
    if (token.raw === '\\S') return /\S/.test(character);

    // Check 5: Dot Wildcard `.`
    if (token.raw === '.') {
      return isDotAll ? true : character !== '\n' && character !== '\r';
    }

    // Check 6: Bracketed Character Set `[a-z0-9]`
    if (token.category === 'char-class' && token.raw.startsWith('[')) {
      try {
        const setRegex = new RegExp(token.raw, isCaseInsensitive ? 'i' : '');
        return setRegex.test(character);
      } catch {
        return false;
      }
    }

    return false;
  };

  // ==========================================================================
  // OUTER LOOP: Try matching starting at each character position in the text
  // ==========================================================================
  for (let searchStart = 0; searchStart <= text.length && !matchFound; searchStart++) {
    let currentTextPos = searchStart;
    let tokenIndex = 0;
    let currentAttemptSuccessful = true;

    const startsWithAnchor =
      tokens.length > 0 && tokens[0].category === 'anchor' && tokens[0].raw === '^';

    // If searching past index 0 but pattern starts with `^`, it can NEVER match
    if (searchStart > 0) {
      if (startsWithAnchor && !isMultiline) {
        recordStep(
          0,
          searchStart,
          'fail',
          'Pattern begins with "^" anchor: cannot match after index 0 without multiline (/m) flag'
        );
        break;
      }

      recordStep(
        0,
        searchStart,
        'advance_cursor',
        `No match starting at index ${searchStart - 1}. Advancing search cursor to index ${searchStart} ('${text[searchStart] ?? 'EOF'}')`
      );
    }

    // ========================================================================
    // INNER LOOP: Walk through each token in the regex pattern
    // ========================================================================
    while (tokenIndex < tokens.length) {
      const currentToken = tokens[tokenIndex];
      const nextToken = tokenIndex + 1 < tokens.length ? tokens[tokenIndex + 1] : null;
      const isQuantified = nextToken !== null && nextToken.category === 'quantifier';
      const quantifierData = isQuantified ? nextToken.quantifier : null;

      // ----------------------------------------------------------------------
      // Token Type A: Anchors (^, $, \b)
      // ----------------------------------------------------------------------
      if (currentToken.category === 'anchor') {
        if (currentToken.raw === '^') {
          const isAtLineStart =
            currentTextPos === 0 ||
            (isMultiline && currentTextPos > 0 && text[currentTextPos - 1] === '\n');

          recordStep(
            currentToken.start,
            currentTextPos,
            'anchor_check',
            `Checking '^' start anchor: ${isAtLineStart ? 'PASSED (at line beginning)' : 'FAILED (not at line start)'}`,
            { token: currentToken }
          );

          if (!isAtLineStart) {
            currentAttemptSuccessful = false;
            break;
          }
        } else if (currentToken.raw === '$') {
          const isAtLineEnd =
            currentTextPos === text.length ||
            (isMultiline && text[currentTextPos] === '\n');

          recordStep(
            currentToken.start,
            currentTextPos,
            'anchor_check',
            `Checking '$' end anchor: ${isAtLineEnd ? 'PASSED (at line end)' : 'FAILED (characters remain before line end)'}`,
            { token: currentToken }
          );

          if (!isAtLineEnd) {
            currentAttemptSuccessful = false;
            break;
          }
        } else if (currentToken.raw === '\\b') {
          const previousIsWord = currentTextPos > 0 && /\w/.test(text[currentTextPos - 1]);
          const nextIsWord = currentTextPos < text.length && /\w/.test(text[currentTextPos]);
          const isWordBoundary = previousIsWord !== nextIsWord;

          recordStep(
            currentToken.start,
            currentTextPos,
            'anchor_check',
            `Checking '\\b' word boundary: ${isWordBoundary ? 'PASSED (boundary detected)' : 'FAILED (not at boundary)'}`,
            { token: currentToken }
          );

          if (!isWordBoundary) {
            currentAttemptSuccessful = false;
            break;
          }
        }

        tokenIndex++;
        continue;
      }

      // ----------------------------------------------------------------------
      // Token Type B: Group Containers (Parentheses)
      // ----------------------------------------------------------------------
      if (currentToken.category === 'group-open') {
        recordStep(
          currentToken.start,
          currentTextPos,
          'group_enter',
          `Entering ${currentToken.title}`,
          { token: currentToken }
        );
        tokenIndex++;
        continue;
      }

      if (currentToken.category === 'group-close') {
        recordStep(
          currentToken.start,
          currentTextPos,
          'group_exit',
          `Exiting ${currentToken.title}`,
          { token: currentToken }
        );
        tokenIndex++;
        continue;
      }

      // ----------------------------------------------------------------------
      // Token Type C: Single Character Test (Without Quantifier)
      // ----------------------------------------------------------------------
      if (!isQuantified) {
        const charAtCursor = currentTextPos < text.length ? text[currentTextPos] : 'EOF';

        recordStep(
          currentToken.start,
          currentTextPos,
          'test_char',
          `Testing token ${currentToken.raw} against character '${charAtCursor}' at text index ${currentTextPos}`,
          {
            token: currentToken,
            charTested: charAtCursor,
          }
        );

        if (doesCharacterMatchToken(currentTextPos, currentToken)) {
          recordStep(
            currentToken.end,
            currentTextPos + 1,
            'match_char',
            `Matched '${text[currentTextPos]}' successfully with ${currentToken.raw}`,
            {
              token: currentToken,
              charTested: text[currentTextPos],
            }
          );
          currentTextPos++;
          tokenIndex++;
        } else {
          recordStep(
            currentToken.start,
            currentTextPos,
            'branch_failed',
            `Mismatch! Expected ${currentToken.title}, but found '${charAtCursor}'`,
            {
              token: currentToken,
              charTested: charAtCursor,
            }
          );
          currentAttemptSuccessful = false;
          break;
        }
      }
      // ----------------------------------------------------------------------
      // Token Type D: Quantified Token (With +, *, ?, {n,m})
      // ----------------------------------------------------------------------
      else {
        const minCount = quantifierData?.min ?? 0;
        const maxCount = quantifierData?.max ?? Infinity;
        let matchedRepetitions = 0;

        recordStep(
          currentToken.start,
          currentTextPos,
          'branch_start',
          `Evaluating quantifier ${currentToken.raw}${nextToken?.raw ?? ''} (minimum: ${minCount}, maximum: ${maxCount === Infinity ? 'infinite' : maxCount})`,
          { token: currentToken }
        );

        // Greedily consume matching characters
        while (
          matchedRepetitions < maxCount &&
          currentTextPos < text.length &&
          doesCharacterMatchToken(currentTextPos, currentToken)
        ) {
          recordStep(
            currentToken.start,
            currentTextPos + 1,
            'match_char',
            `Quantifier match #${matchedRepetitions + 1}: '${text[currentTextPos]}' matched ${currentToken.raw}`,
            {
              token: currentToken,
              charTested: text[currentTextPos],
            }
          );
          currentTextPos++;
          matchedRepetitions++;
        }

        // Check if we met the minimum required repetitions
        if (matchedRepetitions >= minCount) {
          recordStep(
            nextToken?.end ?? currentToken.end,
            currentTextPos,
            'match_char',
            `Quantifier satisfied: matched ${matchedRepetitions} times (minimum required was ${minCount})`,
            { token: nextToken ?? currentToken }
          );
          // Skip past BOTH the token and its quantifier
          tokenIndex += 2;
        } else {
          recordStep(
            currentToken.start,
            currentTextPos,
            'backtrack',
            `Quantifier unsatisfied: matched ${matchedRepetitions} times, but minimum required was ${minCount}`,
            {
              token: nextToken ?? currentToken,
              isBacktracking: true,
            }
          );
          currentAttemptSuccessful = false;
          break;
        }
      }
    }

    // Check if all tokens were successfully matched
    if (currentAttemptSuccessful && tokenIndex >= tokens.length) {
      recordStep(
        pattern.length,
        currentTextPos,
        'success',
        `Match confirmed! Matched "${text.slice(searchStart, currentTextPos)}" at index [${searchStart}, ${currentTextPos}]`
      );
      matchFound = true;
      break;
    }
  }

  // If entire string was scanned and no match was found
  if (!matchFound) {
    recordStep(
      pattern.length,
      text.length,
      'fail',
      'Engine completed: entire input scanned, no match was found'
    );
  }

  return recordedSteps;
}
