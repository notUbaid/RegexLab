import { ExecutionStep } from '../types/regex';
import { tokenizeRegex } from './tokenizer';

/**
 * Simulates step-by-step execution of regular expression matching on input text.
 * Generates an educational frame-by-frame trace showing cursor advances, character tests,
 * state changes, branching, and backtracking.
 */
export function simulateRegexExecution(pattern: string, text: string, flags: string = 'g'): ExecutionStep[] {
  const steps: ExecutionStep[] = [];
  if (!pattern) return steps;

  const tokens = tokenizeRegex(pattern);
  let stepIndex = 0;

  function addStep(
    regexIndex: number,
    textIndex: number,
    action: ExecutionStep['action'],
    description: string,
    extra: Partial<ExecutionStep> = {}
  ) {
    if (steps.length > 500) return; // Safety limit for visualizer trace
    steps.push({
      stepIndex: stepIndex++,
      regexIndex,
      textIndex: Math.min(textIndex, text.length),
      action,
      description,
      matchedSoFar: text.slice(0, Math.min(textIndex, text.length)),
      stackDepth: 0,
      ...extra,
    });
  }

  addStep(0, 0, 'start', `Engine starts: preparing to match /${pattern}/${flags} against text "${text.slice(0, 20)}${text.length > 20 ? '...' : ''}"`);

  // Simple and intuitive virtual machine simulation
  let textPos = 0;
  let matchFound = false;

  // Outer loop: starting position in text
  for (let startPos = 0; startPos <= text.length && !matchFound; startPos++) {
    textPos = startPos;
    let tokenIdx = 0;
    let matched = true;
    let currentMatched = '';
    let isAnchorStart = tokens.length > 0 && tokens[0].category === 'anchor' && tokens[0].raw === '^';

    if (startPos > 0) {
      if (isAnchorStart) {
        addStep(0, startPos, 'fail', 'Pattern begins with "^" anchor: cannot match after position 0');
        break;
      }
      addStep(0, startPos, 'advance_cursor', `No match starting at index ${startPos - 1}. Advancing search cursor to index ${startPos} ('${text[startPos] ?? 'EOF'}')`);
    }

    while (tokenIdx < tokens.length) {
      const token = tokens[tokenIdx];
      const nextToken = tokenIdx + 1 < tokens.length ? tokens[tokenIdx + 1] : null;
      const hasQuantifier = nextToken && nextToken.category === 'quantifier';
      const quant = hasQuantifier ? nextToken.quantifier : null;

      // Anchors: ^ and $
      if (token.category === 'anchor') {
        if (token.raw === '^') {
          const isAtStart = textPos === 0 || (flags.includes('m') && textPos > 0 && text[textPos - 1] === '\n');
          addStep(token.start, textPos, 'anchor_check', `Checking '^' start anchor: ${isAtStart ? 'PASSED (at beginning of line)' : 'FAILED (not at line start)'}`, { token });
          if (!isAtStart) {
            matched = false;
            break;
          }
        } else if (token.raw === '$') {
          const isAtEnd = textPos === text.length || (flags.includes('m') && text[textPos] === '\n');
          addStep(token.start, textPos, 'anchor_check', `Checking '$' end anchor: ${isAtEnd ? 'PASSED (at end of line)' : 'FAILED (characters remain)'}`, { token });
          if (!isAtEnd) {
            matched = false;
            break;
          }
        } else if (token.raw === '\\b') {
          const isWordPrev = textPos > 0 && /\w/.test(text[textPos - 1]);
          const isWordNext = textPos < text.length && /\w/.test(text[textPos]);
          const isWordBoundary = isWordPrev !== isWordNext;
          addStep(token.start, textPos, 'anchor_check', `Checking '\\b' word boundary: ${isWordBoundary ? 'PASSED' : 'FAILED'}`, { token });
          if (!isWordBoundary) {
            matched = false;
            break;
          }
        }
        tokenIdx++;
        continue;
      }

      // Group delimiters
      if (token.category === 'group-open') {
        addStep(token.start, textPos, 'group_enter', `Entering group ${token.title}`, { token });
        tokenIdx++;
        continue;
      }
      if (token.category === 'group-close') {
        addStep(token.start, textPos, 'group_exit', `Exiting group`, { token });
        tokenIdx++;
        continue;
      }

      // Matching a character / class with or without quantifier
      const testChar = (idx: number): boolean => {
        if (idx >= text.length) return false;
        const c = text[idx];
        const isCaseInsensitive = flags.includes('i');

        if (token.category === 'literal') {
          return isCaseInsensitive ? c.toLowerCase() === token.raw.toLowerCase() : c === token.raw;
        }
        if (token.raw === '\\d') return /\d/.test(c);
        if (token.raw === '\\D') return /\D/.test(c);
        if (token.raw === '\\w') return /\w/.test(c);
        if (token.raw === '\\W') return /\W/.test(c);
        if (token.raw === '\\s') return /\s/.test(c);
        if (token.raw === '\\S') return /\S/.test(c);
        if (token.raw === '.') return flags.includes('s') ? true : c !== '\n' && c !== '\r';
        
        // Character set [...]
        if (token.category === 'char-class' && token.raw.startsWith('[')) {
          try {
            const regexPart = new RegExp(token.raw, isCaseInsensitive ? 'i' : '');
            return regexPart.test(c);
          } catch {
            return false;
          }
        }

        return false;
      };

      if (!hasQuantifier) {
        // Single character test
        const charAtCursor = textPos < text.length ? text[textPos] : 'EOF';
        addStep(token.start, textPos, 'test_char', `Testing token ${token.raw} against '${charAtCursor}' at text index ${textPos}`, {
          token,
          charTested: charAtCursor,
        });

        if (testChar(textPos)) {
          addStep(token.end, textPos + 1, 'match_char', `Matched '${text[textPos]}' successfully with ${token.raw}`, {
            token,
            charTested: text[textPos],
          });
          currentMatched += text[textPos];
          textPos++;
          tokenIdx++;
        } else {
          addStep(token.start, textPos, 'branch_failed', `Mismatch! Expected ${token.title}, but found '${charAtCursor}'`, {
            token,
            charTested: charAtCursor,
          });
          matched = false;
          break;
        }
      } else {
        // Quantified token (e.g. +, *, ?, {2,5})
        const min = quant?.min ?? 0;
        const max = quant?.max ?? Infinity;
        let matchCount = 0;

        addStep(token.start, textPos, 'branch_start', `Evaluating quantifier ${token.raw}${nextToken?.raw ?? ''} (min: ${min}, max: ${max === Infinity ? '∞' : max})`, {
          token,
        });

        while (matchCount < max && textPos < text.length && testChar(textPos)) {
          addStep(token.start, textPos + 1, 'match_char', `Quantifier match #${matchCount + 1}: '${text[textPos]}' matched ${token.raw}`, {
            token,
            charTested: text[textPos],
          });
          currentMatched += text[textPos];
          textPos++;
          matchCount++;
        }

        if (matchCount >= min) {
          addStep(nextToken?.end ?? token.end, textPos, 'match_char', `Quantifier satisfied with ${matchCount} matches (required: ${min})`, {
            token: nextToken ?? token,
          });
          tokenIdx += 2; // Skip token + quantifier
        } else {
          addStep(token.start, textPos, 'backtrack', `Quantifier unsatisfied! Matched ${matchCount} times, but minimum required is ${min}`, {
            token: nextToken ?? token,
            isBacktracking: true,
          });
          matched = false;
          break;
        }
      }
    }

    if (matched && tokenIdx >= tokens.length) {
      addStep(pattern.length, textPos, 'success', `Match found! Matched "${text.slice(startPos, textPos)}" at index [${startPos}, ${textPos}]`);
      matchFound = true;
      break;
    }
  }

  if (!matchFound) {
    addStep(pattern.length, text.length, 'fail', `Engine finished: entire input examined, no match was found.`);
  }

  return steps;
}
