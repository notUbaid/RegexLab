import { CaptureGroup, RegexMatch, RegexToken, TraceStep } from './types';

export function executeMatches(pattern: string, flags: string, testText: string): { matches: RegexMatch[]; timeMs: number } {
  if (!pattern || !testText) {
    return { matches: [], timeMs: 0 };
  }

  const t0 = performance.now();
  const matches: RegexMatch[] = [];

  try {
    // Ensure 'g' flag for all matches unless specifically testing non-global
    const effectiveFlags = flags.includes('g') ? flags : `${flags}g`;
    const rx = new RegExp(pattern, effectiveFlags);

    let match: RegExpExecArray | null;
    let iterations = 0;
    const maxIterations = 2000;

    while ((match = rx.exec(testText)) !== null && iterations < maxIterations) {
      iterations++;
      const fullMatch = match[0];
      const start = match.index;
      const end = start + fullMatch.length;

      const groups: CaptureGroup[] = [];

      // Extract capture groups
      if (match.length > 1) {
        let searchCursor = start;
        for (let g = 1; g < match.length; g++) {
          const groupText = match[g];
          if (groupText !== undefined) {
            const gStart = testText.indexOf(groupText, searchCursor);
            const gEnd = gStart !== -1 ? gStart + groupText.length : end;
            if (gStart !== -1) searchCursor = gStart;

            groups.push({
              index: g,
              text: groupText,
              start: gStart !== -1 ? gStart : start,
              end: gEnd,
            });
          }
        }
      }

      matches.push({
        index: matches.length + 1,
        start,
        end,
        text: fullMatch,
        groups,
      });

      // Advance cursor for zero-width assertions (^, $, \b, lookaheads)
      if (fullMatch.length === 0) {
        rx.lastIndex = match.index + 1;
        if (rx.lastIndex > testText.length) break;
      }
    }
  } catch {
    // Invalid regex or execution error
  }

  const timeMs = Math.round((performance.now() - t0) * 100) / 100;
  return { matches, timeMs };
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
