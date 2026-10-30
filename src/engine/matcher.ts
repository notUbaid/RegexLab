import { CaptureGroup, RegexMatch, RegexToken, TraceStep } from './types';

// Run the regex pattern against the test string and collect all matches,
// along with any capture groups and the time taken in milliseconds.
export function executeMatches(pattern: string, flags: string, testText: string): { matches: RegexMatch[]; timeMs: number } {
  // If either the pattern or test string is empty, there is nothing to match
  if (!pattern || !testText) {
    return { matches: [], timeMs: 0 };
  }

  const startTime = performance.now();
  const matches: RegexMatch[] = [];

  try {
    // We add the 'g' (global) flag by default so we can find all matches across the text
    const effectiveFlags = flags.includes('g') ? flags : `${flags}g`;
    const regex = new RegExp(pattern, effectiveFlags);

    let matchResult: RegExpExecArray | null;
    let iterationCount = 0;
    const safetyLimit = 2000; // Safeguard against infinite loops on zero-width patterns

    while ((matchResult = regex.exec(testText)) !== null && iterationCount < safetyLimit) {
      iterationCount++;
      const fullMatchText = matchResult[0];
      const matchStart = matchResult.index;
      const matchEnd = matchStart + fullMatchText.length;

      const captureGroups: CaptureGroup[] = [];

      // If the regex has capture groups (parentheses), extract them one by one
      if (matchResult.length > 1) {
        let cursor = matchStart;

        for (let groupIndex = 1; groupIndex < matchResult.length; groupIndex++) {
          const groupText = matchResult[groupIndex];

          if (groupText !== undefined) {
            // Find where this group text appears within the match boundaries
            const groupStartPos = testText.indexOf(groupText, cursor);
            let actualStart = matchStart;
            let actualEnd = matchEnd;

            if (groupStartPos !== -1) {
              actualStart = groupStartPos;
              actualEnd = groupStartPos + groupText.length;
              cursor = groupStartPos;
            }

            captureGroups.push({
              index: groupIndex,
              text: groupText,
              start: actualStart,
              end: actualEnd,
            });
          }
        }
      }

      matches.push({
        index: matches.length + 1,
        start: matchStart,
        end: matchEnd,
        text: fullMatchText,
        groups: captureGroups,
      });

      // Handle zero-length matches (like ^, $, or empty lookarounds) so the regex engine advances
      if (fullMatchText.length === 0) {
        regex.lastIndex = matchResult.index + 1;
        if (regex.lastIndex > testText.length) {
          break;
        }
      }
    }
  } catch {
    // If the regex has a syntax error or fails to run, we simply return what we have
  }

  const totalTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
  return { matches, timeMs: totalTimeMs };
}

export function simulateTrace(tokens: RegexToken[], testText: string): TraceStep[] {
  if (!tokens.length || !testText) {
    return [];
  }

  const steps: TraceStep[] = [];
  const maxSteps = 1200;
  let charIdx = 0;
  let tokenIdx = 0;
  let matchedChars = '';

  steps.push({
    stepIndex: 0,
    charIndex: 0,
    char: testText[0] || '',
    state: 'START',
    action: 'branch',
    explanation: 'Engine initializes at string index 0',
    isBacktracking: false,
    matchedSoFar: '',
  });

  while (charIdx < testText.length && tokenIdx < tokens.length && steps.length < maxSteps) {
    const tok = tokens[tokenIdx];
    const ch = testText[charIdx];

    // Anchor: Start of line
    if (tok.type === 'anchor' && tok.raw === '^') {
      if (charIdx === 0 || testText[charIdx - 1] === '\n') {
        steps.push({
          stepIndex: steps.length,
          charIndex: charIdx,
          char: ch,
          state: `STATE_${tokenIdx}`,
          action: 'match',
          explanation: `Asserted start of line at index ${charIdx}`,
          isBacktracking: false,
          matchedSoFar: matchedChars,
          tokenId: tok.id,
        });
        tokenIdx++;
      } else {
        steps.push({
          stepIndex: steps.length,
          charIndex: charIdx,
          char: ch,
          state: `STATE_${tokenIdx}`,
          action: 'fail',
          explanation: `Failed anchor ^: index ${charIdx} is not start of line`,
          isBacktracking: true,
          matchedSoFar: matchedChars,
          tokenId: tok.id,
        });
        charIdx++;
      }
      continue;
    }

    // Anchor: End of line
    if (tok.type === 'anchor' && tok.raw === '$') {
      if (charIdx === testText.length || testText[charIdx] === '\n') {
        steps.push({
          stepIndex: steps.length,
          charIndex: charIdx,
          char: ch,
          state: `STATE_${tokenIdx}`,
          action: 'match',
          explanation: `Asserted end of line at index ${charIdx}`,
          isBacktracking: false,
          matchedSoFar: matchedChars,
          tokenId: tok.id,
        });
        tokenIdx++;
      } else {
        steps.push({
          stepIndex: steps.length,
          charIndex: charIdx,
          char: ch,
          state: `STATE_${tokenIdx}`,
          action: 'fail',
          explanation: `Failed anchor $: text remains after index ${charIdx}`,
          isBacktracking: true,
          matchedSoFar: matchedChars,
          tokenId: tok.id,
        });
        charIdx++;
      }
      continue;
    }

    // Literal / CharacterClass evaluation
    let isMatch = false;
    if (tok.category === 'literal') {
      isMatch = ch === tok.raw;
    } else if (tok.type === 'character_class') {
      if (tok.raw === '\\d') isMatch = /\d/.test(ch);
      else if (tok.raw === '\\D') isMatch = /\D/.test(ch);
      else if (tok.raw === '\\w') isMatch = /\w/.test(ch);
      else if (tok.raw === '\\W') isMatch = /\W/.test(ch);
      else if (tok.raw === '\\s') isMatch = /\s/.test(ch);
      else if (tok.raw === '\\S') isMatch = /\S/.test(ch);
      else if (tok.raw === '.') isMatch = ch !== '\n';
      else {
        try {
          isMatch = new RegExp(tok.raw).test(ch);
        } catch {
          isMatch = false;
        }
      }
    } else {
      // Group boundaries or metadata tokens: advance
      tokenIdx++;
      continue;
    }

    if (isMatch) {
      matchedChars += ch;
      steps.push({
        stepIndex: steps.length,
        charIndex: charIdx,
        char: ch,
        state: `STATE_${tokenIdx}`,
        action: 'match',
        explanation: `Matched "${ch}" against ${tok.title}`,
        isBacktracking: false,
        matchedSoFar: matchedChars,
        tokenId: tok.id,
      });
      charIdx++;
      tokenIdx++;
    } else {
      steps.push({
        stepIndex: steps.length,
        charIndex: charIdx,
        char: ch,
        state: `STATE_${tokenIdx}`,
        action: 'backtrack',
        explanation: `Character "${ch}" does not match ${tok.title}. Backtracking...`,
        isBacktracking: true,
        matchedSoFar: matchedChars,
        tokenId: tok.id,
      });
      // Move search cursor forward in input string
      charIdx++;
      tokenIdx = 0;
      matchedChars = '';
    }
  }

  if (matchedChars.length > 0) {
    steps.push({
      stepIndex: steps.length,
      charIndex: charIdx,
      char: '',
      state: 'ACCEPT',
      action: 'success',
      explanation: `Successfully accepted match: "${matchedChars}"`,
      isBacktracking: false,
      matchedSoFar: matchedChars,
    });
  }

  return steps;
}
