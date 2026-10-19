import { RegexToken, TokenCategory } from '../types/regex';

export function tokenizeRegex(pattern: string): RegexToken[] {
  const tokens: RegexToken[] = [];
  let i = 0;
  let groupCounter = 0;
  const groupStack: { index: number; name?: string }[] = [];

  while (i < pattern.length) {
    const char = pattern[i];

    // Escaped sequences: \d, \w, \s, \b, \., etc.
    if (char === '\\' && i + 1 < pattern.length) {
      const next = pattern[i + 1];
      const start = i;
      
      // Unicode property \p{...} or \P{...}
      if ((next === 'p' || next === 'P') && pattern[i + 2] === '{') {
        const closeIdx = pattern.indexOf('}', i + 3);
        if (closeIdx !== -1) {
          const propName = pattern.slice(i + 3, closeIdx);
          const raw = pattern.slice(start, closeIdx + 1);
          tokens.push({
            id: `tok-${start}`,
            category: 'char-class',
            raw,
            start,
            end: closeIdx + 1,
            title: `Unicode Property (${next === 'p' ? 'matches' : 'negates'})`,
            humanExplanation: next === 'p' ? `Any character with Unicode property "${propName}"` : `Any character NOT having Unicode property "${propName}"`,
          });
          i = closeIdx + 1;
          continue;
        }
      }

      // Hex \xHH or Unicode \uHHHH
      if (next === 'x' && i + 3 < pattern.length) {
        const raw = pattern.slice(start, i + 4);
        tokens.push({
          id: `tok-${start}`,
          category: 'escape',
          raw,
          start,
          end: i + 4,
          title: 'Hexadecimal Character',
          humanExplanation: `Character with hexadecimal ASCII value ${pattern.slice(i + 2, i + 4)}`,
        });
        i += 4;
        continue;
      }
      if (next === 'u' && i + 5 < pattern.length && pattern[i + 2] !== '{') {
        const raw = pattern.slice(start, i + 6);
        tokens.push({
          id: `tok-${start}`,
          category: 'escape',
          raw,
          start,
          end: i + 6,
          title: 'Unicode Character',
          humanExplanation: `Unicode character U+${pattern.slice(i + 2, i + 6)}`,
        });
        i += 6;
        continue;
      }

      // Backreferences: \1, \2, or named \k<name>
      if (/\d/.test(next)) {
        tokens.push({
          id: `tok-${start}`,
          category: 'backreference',
          raw: `\\${next}`,
          start,
          end: i + 2,
          title: `Backreference to Group #${next}`,
          humanExplanation: `Exact text previously matched by capture group #${next}`,
        });
        i += 2;
        continue;
      }
      if (next === 'k' && pattern[i + 2] === '<') {
        const closeName = pattern.indexOf('>', i + 3);
        if (closeName !== -1) {
          const gName = pattern.slice(i + 3, closeName);
          tokens.push({
            id: `tok-${start}`,
            category: 'backreference',
            raw: pattern.slice(start, closeName + 1),
            start,
            end: closeName + 1,
            title: `Named Backreference: "${gName}"`,
            humanExplanation: `Exact text previously captured by named group "${gName}"`,
          });
          i = closeName + 1;
          continue;
        }
      }

      // Shorthand classes & anchors
      let token: RegexToken | null = null;
      switch (next) {
        case 'd':
          token = { id: `tok-${start}`, category: 'char-class', raw: '\\d', start, end: i + 2, title: 'Digit', humanExplanation: 'Any digit from 0 to 9' };
          break;
        case 'D':
          token = { id: `tok-${start}`, category: 'char-class', raw: '\\D', start, end: i + 2, title: 'Non-Digit', humanExplanation: 'Any character that is NOT a digit (0-9)' };
          break;
        case 'w':
          token = { id: `tok-${start}`, category: 'char-class', raw: '\\w', start, end: i + 2, title: 'Word Character', humanExplanation: 'Any alphanumeric character or underscore ([a-zA-Z0-9_])' };
          break;
        case 'W':
          token = { id: `tok-${start}`, category: 'char-class', raw: '\\W', start, end: i + 2, title: 'Non-Word Character', humanExplanation: 'Any character other than letters, numbers, or underscore' };
          break;
        case 's':
          token = { id: `tok-${start}`, category: 'char-class', raw: '\\s', start, end: i + 2, title: 'Whitespace', humanExplanation: 'Any whitespace (space, tab, newline, carriage return)' };
          break;
        case 'S':
          token = { id: `tok-${start}`, category: 'char-class', raw: '\\S', start, end: i + 2, title: 'Non-Whitespace', humanExplanation: 'Any non-whitespace character' };
          break;
        case 'b':
          token = { id: `tok-${start}`, category: 'anchor', raw: '\\b', start, end: i + 2, title: 'Word Boundary', humanExplanation: 'Boundary between a word character and a non-word character (zero-width)' };
          break;
        case 'B':
          token = { id: `tok-${start}`, category: 'anchor', raw: '\\B', start, end: i + 2, title: 'Non-Word Boundary', humanExplanation: 'Position that is NOT a word boundary' };
          break;
        case 'n':
          token = { id: `tok-${start}`, category: 'escape', raw: '\\n', start, end: i + 2, title: 'Line Feed', humanExplanation: 'Newline character (LF)' };
          break;
        case 'r':
          token = { id: `tok-${start}`, category: 'escape', raw: '\\r', start, end: i + 2, title: 'Carriage Return', humanExplanation: 'Carriage return character (CR)' };
          break;
        case 't':
          token = { id: `tok-${start}`, category: 'escape', raw: '\\t', start, end: i + 2, title: 'Tab', humanExplanation: 'Horizontal tab character' };
          break;
        default:
          token = { id: `tok-${start}`, category: 'escape', raw: `\\${next}`, start, end: i + 2, title: `Escaped Literal: "${next}"`, humanExplanation: `Literal character "${next}" (escaped special symbol)` };
      }

      if (token) {
        tokens.push(token);
        i += 2;
        continue;
      }
    }

    // Character set: [a-z0-9]
    if (char === '[') {
      const start = i;
      let j = i + 1;
      let isNegated = false;
      if (pattern[j] === '^') {
        isNegated = true;
        j++;
      }
      
      // Find closing bracket, accounting for escaped brackets inside
      while (j < pattern.length) {
        if (pattern[j] === '\\') {
          j += 2;
        } else if (pattern[j] === ']') {
          break;
        } else {
          j++;
        }
      }

      const end = Math.min(j + 1, pattern.length);
      const raw = pattern.slice(start, end);
      const content = pattern.slice(isNegated ? start + 2 : start + 1, end - 1);

      let explanation = isNegated 
        ? `Any character EXCEPT those in the set: [${content}]`
        : `Any single character within the set: [${content}]`;

      tokens.push({
        id: `tok-${start}`,
        category: 'char-class',
        raw,
        start,
        end,
        title: isNegated ? 'Negated Character Set' : 'Character Set',
        humanExplanation: explanation,
        detail: `Matches ${isNegated ? 'none' : 'one'} of: ${content}`,
      });

      i = end;
      continue;
    }

    // Group Open: (, (?:, (?<name>, (?=, (?!, (?<=, (?<!
    if (char === '(') {
      const start = i;
      if (pattern.startsWith('(?:', i)) {
        tokens.push({
          id: `tok-${start}`,
          category: 'group-open',
          raw: '(?:',
          start,
          end: i + 3,
          title: 'Non-Capturing Group (Start)',
          humanExplanation: 'Groups elements together without creating a numbered capture group',
        });
        groupStack.push({ index: -1 });
        i += 3;
        continue;
      }
      if (pattern.startsWith('(?=', i)) {
        tokens.push({
          id: `tok-${start}`,
          category: 'lookaround',
          raw: '(?=',
          start,
          end: i + 3,
          title: 'Positive Lookahead (Start)',
          humanExplanation: 'Asserter: asserts what follows immediately matches this pattern (zero-width)',
        });
        groupStack.push({ index: -1 });
        i += 3;
        continue;
      }
      if (pattern.startsWith('(?!', i)) {
        tokens.push({
          id: `tok-${start}`,
          category: 'lookaround',
          raw: '(?!',
          start,
          end: i + 3,
          title: 'Negative Lookahead (Start)',
          humanExplanation: 'Asserter: asserts what follows does NOT match this pattern (zero-width)',
        });
        groupStack.push({ index: -1 });
        i += 3;
        continue;
      }
      if (pattern.startsWith('(?<=', i)) {
        tokens.push({
          id: `tok-${start}`,
          category: 'lookaround',
          raw: '(?<=',
          start,
          end: i + 4,
          title: 'Positive Lookbehind (Start)',
          humanExplanation: 'Asserter: asserts what precedes immediately matches this pattern (zero-width)',
        });
        groupStack.push({ index: -1 });
        i += 4;
        continue;
      }
      if (pattern.startsWith('(?<!', i)) {
        tokens.push({
          id: `tok-${start}`,
          category: 'lookaround',
          raw: '(?<!',
          start,
          end: i + 4,
          title: 'Negative Lookbehind (Start)',
          humanExplanation: 'Asserter: asserts what precedes does NOT match this pattern (zero-width)',
        });
        groupStack.push({ index: -1 });
        i += 4;
        continue;
      }
      if (pattern.startsWith('(?<', i)) {
        const closeName = pattern.indexOf('>', i + 3);
        if (closeName !== -1) {
          const name = pattern.slice(i + 3, closeName);
          groupCounter++;
          const gIndex = groupCounter;
          tokens.push({
            id: `tok-${start}`,
            category: 'group-open',
            raw: pattern.slice(start, closeName + 1),
            start,
            end: closeName + 1,
            title: `Named Capture Group "${name}" (#${gIndex})`,
            humanExplanation: `Captures matching text and assigns it to name "${name}"`,
            groupIndex: gIndex,
            groupName: name,
          });
          groupStack.push({ index: gIndex, name });
          i = closeName + 1;
          continue;
        }
      }

      // Normal capturing group
      groupCounter++;
      const currentGIndex = groupCounter;
      tokens.push({
        id: `tok-${start}`,
        category: 'group-open',
        raw: '(',
        start,
        end: i + 1,
        title: `Capture Group #${currentGIndex} (Start)`,
        humanExplanation: `Captures matched text into group #${currentGIndex}`,
        groupIndex: currentGIndex,
      });
      groupStack.push({ index: currentGIndex });
      i++;
      continue;
    }

    // Group Close: )
    if (char === ')') {
      const closed = groupStack.pop();
      tokens.push({
        id: `tok-${i}`,
        category: 'group-close',
        raw: ')',
        start: i,
        end: i + 1,
        title: closed && closed.index > 0 ? `Capture Group #${closed.index} (End)` : 'Group End',
        humanExplanation: closed && closed.index > 0 ? `Closes capture group #${closed.index}` : 'Closes group',
        groupIndex: closed?.index,
        groupName: closed?.name,
      });
      i++;
      continue;
    }

    // Quantifiers: *, +, ?, {n}, {n,m}, {n,} with optional ? or + modifier
    if (char === '*' || char === '+' || char === '?') {
      const start = i;
      let raw = char;
      let isLazy = false;
      let isPossessive = false;
      
      if (i + 1 < pattern.length && pattern[i + 1] === '?') {
        isLazy = true;
        raw += '?';
        i++;
      } else if (i + 1 < pattern.length && pattern[i + 1] === '+') {
        isPossessive = true;
        raw += '+';
        i++;
      }

      let title = '';
      let explanation = '';
      let min = 0;
      let max: number | null = null;

      if (char === '*') {
        min = 0;
        max = null;
        title = `Zero or More (${isLazy ? 'Lazy' : isPossessive ? 'Possessive' : 'Greedy'})`;
        explanation = `Matches 0 or more times (${isLazy ? 'fewest possible' : 'as many as possible'})`;
      } else if (char === '+') {
        min = 1;
        max = null;
        title = `One or More (${isLazy ? 'Lazy' : isPossessive ? 'Possessive' : 'Greedy'})`;
        explanation = `Matches 1 or more times (${isLazy ? 'fewest possible' : 'as many as possible'})`;
      } else if (char === '?') {
        min = 0;
        max = 1;
        title = `Optional (${isLazy ? 'Lazy' : isPossessive ? 'Possessive' : 'Greedy'})`;
        explanation = `Matches 0 or 1 time (optional element)`;
      }

      tokens.push({
        id: `tok-${start}`,
        category: 'quantifier',
        raw,
        start,
        end: i + 1,
        title,
        humanExplanation: explanation,
        quantifier: { min, max, isLazy, isPossessive },
      });
      i++;
      continue;
    }

    // Range quantifier: {min,max}
    if (char === '{' && /\{\d+(?:,\d*)?\}/.test(pattern.slice(i))) {
      const closeCurly = pattern.indexOf('}', i);
      if (closeCurly !== -1) {
        const start = i;
        let raw = pattern.slice(start, closeCurly + 1);
        let endIdx = closeCurly + 1;
        let isLazy = false;
        let isPossessive = false;

        if (endIdx < pattern.length && pattern[endIdx] === '?') {
          isLazy = true;
          raw += '?';
          endIdx++;
        } else if (endIdx < pattern.length && pattern[endIdx] === '+') {
          isPossessive = true;
          raw += '+';
          endIdx++;
        }

        const inner = pattern.slice(start + 1, closeCurly);
        const parts = inner.split(',');
        let min = parseInt(parts[0], 10);
        let max: number | null = min;
        let explanation = '';

        if (parts.length === 2) {
          max = parts[1] === '' ? null : parseInt(parts[1], 10);
          if (max === null) {
            explanation = `Matches at least ${min} times (${isLazy ? 'lazy' : 'greedy'})`;
          } else {
            explanation = `Matches between ${min} and ${max} times (${isLazy ? 'lazy' : 'greedy'})`;
          }
        } else {
          explanation = `Matches exactly ${min} times`;
        }

        tokens.push({
          id: `tok-${start}`,
          category: 'quantifier',
          raw,
          start,
          end: endIdx,
          title: `Quantifier ${raw}`,
          humanExplanation: explanation,
          quantifier: { min, max, isLazy, isPossessive },
        });

        i = endIdx;
        continue;
      }
    }

    // Anchors: ^ and $
    if (char === '^') {
      tokens.push({
        id: `tok-${i}`,
        category: 'anchor',
        raw: '^',
        start: i,
        end: i + 1,
        title: 'Start of String / Line',
        humanExplanation: 'Asserts position at the beginning of the string (or line with multi-line flag)',
      });
      i++;
      continue;
    }

    if (char === '$') {
      tokens.push({
        id: `tok-${i}`,
        category: 'anchor',
        raw: '$',
        start: i,
        end: i + 1,
        title: 'End of String / Line',
        humanExplanation: 'Asserts position at the end of the string (or line with multi-line flag)',
      });
      i++;
      continue;
    }

    // Alternation: |
    if (char === '|') {
      tokens.push({
        id: `tok-${i}`,
        category: 'alternation',
        raw: '|',
        start: i,
        end: i + 1,
        title: 'OR Operator (Alternation)',
        humanExplanation: 'Matches either the pattern before or the pattern after this bar',
      });
      i++;
      continue;
    }

    // Dot: .
    if (char === '.') {
      tokens.push({
        id: `tok-${i}`,
        category: 'char-class',
        raw: '.',
        start: i,
        end: i + 1,
        title: 'Any Character (Wildcard)',
        humanExplanation: 'Matches any single character except line terminators (includes line breaks with dotAll /s flag)',
      });
      i++;
      continue;
    }

    // Plain Literal Character
    tokens.push({
      id: `tok-${i}`,
      category: 'literal',
      raw: char,
      start: i,
      end: i + 1,
      title: `Literal "${char}"`,
      humanExplanation: `Matches the exact character "${char}"`,
    });
    i++;
  }

  return tokens;
}
