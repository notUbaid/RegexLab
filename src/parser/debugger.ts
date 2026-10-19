import { DebuggerAnalysis } from '../types/regex';
import { tokenizeRegex } from './tokenizer';

/**
 * Analyzes why a regex pattern failed to match input text,
 * locating the exact character offset, expected condition, and actionable fixes.
 */
export function diagnoseRegexFailure(pattern: string, text: string, flags: string = ''): DebuggerAnalysis {
  if (!pattern) {
    return {
      matched: false,
      failureIndex: 0,
      expectedDescription: 'A valid pattern',
      actualChar: '',
      suggestedFixes: ['Type a pattern into the editor to begin'],
      explanation: 'Pattern is currently empty.',
    };
  }

  // Check if it actually matches
  try {
    const rx = new RegExp(pattern, flags);
    if (rx.test(text)) {
      return {
        matched: true,
        failureIndex: -1,
        expectedDescription: 'Match succeeded',
        actualChar: '',
        suggestedFixes: [],
        explanation: `The pattern successfully matches the input text!`,
      };
    }
  } catch (err: any) {
    return {
      matched: false,
      failureIndex: 0,
      expectedDescription: 'Valid regex syntax',
      actualChar: '',
      suggestedFixes: ['Fix regex syntax error in pattern'],
      explanation: `Syntax Error: ${err.message}`,
    };
  }

  if (text.length === 0) {
    return {
      matched: false,
      failureIndex: 0,
      expectedDescription: 'Non-empty input text',
      actualChar: 'EOF',
      suggestedFixes: ['Enter sample text into the test area'],
      explanation: 'Test string is empty; pattern expects characters.',
    };
  }

  const tokens = tokenizeRegex(pattern);
  const isCaseInsensitive = flags.includes('i');

  // Let's trace prefix matches to find where the longest match stopped
  let bestProgress = 0;
  let failedToken = tokens[0];
  let failedChar = text[0];
  let failureReason = '';
  const suggestedFixes: string[] = [];

  // Check start anchor mismatch
  if (tokens.length > 0 && tokens[0].category === 'anchor' && tokens[0].raw === '^') {
    // Check if the pattern would match somewhere else in the string without ^
    const patternWithoutStartAnchor = pattern.replace(/^\^/, '');
    try {
      const rxNoStart = new RegExp(patternWithoutStartAnchor, flags);
      const match = rxNoStart.exec(text);
      if (match && match.index > 0) {
        return {
          matched: false,
          failureIndex: 0,
          expectedDescription: `Start of string "^" to match at index 0`,
          actualChar: `'${text[0]}'`,
          suggestedFixes: [
            `Remove the "^" anchor if you want to match anywhere in the text`,
            `Or ensure your text begins with the required prefix "${match[0].slice(0, 5)}"`,
          ],
          explanation: `The pattern begins with "^" which enforces matching at index 0. A valid match was found later at index ${match.index} ("${match[0]}").`,
        };
      }
    } catch {}
  }

  // Check end anchor mismatch
  if (tokens.length > 0 && tokens[tokens.length - 1].category === 'anchor' && tokens[tokens.length - 1].raw === '$') {
    const patternWithoutEndAnchor = pattern.replace(/\$$/, '');
    try {
      const rxNoEnd = new RegExp(patternWithoutEndAnchor, flags);
      const match = rxNoEnd.exec(text);
      if (match && match.index + match[0].length < text.length) {
        const extraText = text.slice(match.index + match[0].length);
        return {
          matched: false,
          failureIndex: match.index + match[0].length,
          expectedDescription: `End of string "$"`,
          actualChar: `'${extraText[0]}'`,
          suggestedFixes: [
            `Remove the "$" anchor to match prefixes without requiring full text consumption`,
            `Or add ".*" before "$" to allow trailing characters`,
          ],
          explanation: `The pattern matched "${match[0]}", but failed because of trailing characters "${extraText.slice(0, 15)}" before the end anchor "$".`,
        };
      }
    } catch {}
  }

  // Check case mismatch
  if (!isCaseInsensitive) {
    try {
      const rxCaseInsensitive = new RegExp(pattern, flags + 'i');
      if (rxCaseInsensitive.test(text)) {
        return {
          matched: false,
          failureIndex: 0,
          expectedDescription: 'Exact character casing',
          actualChar: 'Different case letter',
          suggestedFixes: [
            'Enable the "i" flag (case-insensitive matching)',
            'Or update your character sets to include both cases (e.g., [a-zA-Z])',
          ],
          explanation: 'The pattern matches when casing is ignored. There is a mismatch between uppercase and lowercase characters.',
        };
      }
    } catch {}
  }

  // Find partial progressive prefix match
  for (let i = 0; i < text.length; i++) {
    const sub = text.slice(0, i + 1);
    let matchedAny = false;
    for (let t = 1; t <= pattern.length; t++) {
      try {
        const subPattern = pattern.slice(0, t);
        const rx = new RegExp(subPattern, flags);
        if (rx.test(sub)) {
          matchedAny = true;
          break;
        }
      } catch {}
    }
    if (matchedAny) {
      bestProgress = i + 1;
    } else {
      break;
    }
  }

  const failPos = Math.min(bestProgress, text.length - 1);
  failedChar = text[failPos] ?? 'EOF';

  // Check if character class or digit was expected
  if (/\d/.test(failedChar)) {
    failureReason = `Found digit '${failedChar}', but pattern expected non-numeric or different token.`;
    suggestedFixes.push(`If digits are allowed here, add \\d or [0-9] to your pattern`);
  } else if (/[a-zA-Z]/.test(failedChar)) {
    failureReason = `Found letter '${failedChar}', but pattern expected different character type.`;
    suggestedFixes.push(`Add [a-zA-Z] or \\w to allow letters at this position`);
  } else if (/\s/.test(failedChar)) {
    failureReason = `Found whitespace '${failedChar}', but pattern does not permit spaces here.`;
    suggestedFixes.push(`Add \\s* to optionally accept spaces`);
  } else {
    failureReason = `Found special symbol '${failedChar}', which was rejected by the active token.`;
    suggestedFixes.push(`Escape the character \\${failedChar} or include it in your character class`);
  }

  return {
    matched: false,
    failureIndex: failPos,
    expectedDescription: `Matching token at text position ${failPos}`,
    actualChar: `'${failedChar}'`,
    suggestedFixes,
    explanation: failureReason,
  };
}
