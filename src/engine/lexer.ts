import { RegexToken } from './types';

const METACHARACTERS = new Set(['^', '$', '\\', '.', '*', '+', '?', '(', ')', '[', ']', '{', '}', '|']);

export function tokenize(pattern: string): RegexToken[] {
  if (!pattern) return [];

  const tokens: RegexToken[] = [];
  let i = 0;
  let groupCounter = 0;
  let depth = 0;
  const groupStack: number[] = [];

  while (i < pattern.length) {
    const ch = pattern[i];

    // Escaped sequences
    if (ch === '\\' && i + 1 < pattern.length) {
      const next = pattern[i + 1];
      const start = i;
      const raw = `\\${next}`;

      if (next === 'd') {
        tokens.push({
          id: `tok-${start}`,
          type: 'character_class',
          category: 'character_class',
          raw,
          start,
          end: i + 2,
          title: 'Digit',
          explanation: 'Matches any single digit (0-9)',
          depth,
        });
      } else if (next === 'D') {
        tokens.push({
          id: `tok-${start}`,
          type: 'character_class',
          category: 'character_class',
          raw,
          start,
          end: i + 2,
          title: 'Non-Digit',
          explanation: 'Matches any character that is not a digit',
          depth,
        });
      } else if (next === 'w') {
        tokens.push({
          id: `tok-${start}`,
          type: 'character_class',
          category: 'character_class',
          raw,
          start,
          end: i + 2,
          title: 'Word Character',
          explanation: 'Matches any alphanumeric character or underscore ([a-zA-Z0-9_])',
          depth,
        });
      } else if (next === 'W') {
        tokens.push({
          id: `tok-${start}`,
          type: 'character_class',
          category: 'character_class',
          raw,
          start,
          end: i + 2,
          title: 'Non-Word Character',
          explanation: 'Matches any symbol, punctuation, or whitespace',
          depth,
        });
      } else if (next === 's') {
        tokens.push({
          id: `tok-${start}`,
          type: 'character_class',
          category: 'character_class',
          raw,
          start,
          end: i + 2,
          title: 'Whitespace',
          explanation: 'Matches spaces, tabs, and line breaks',
          depth,
        });
      } else if (next === 'S') {
        tokens.push({
          id: `tok-${start}`,
          type: 'character_class',
          category: 'character_class',
          raw,
          start,
          end: i + 2,
          title: 'Non-Whitespace',
          explanation: 'Matches any character that is not whitespace',
          depth,
        });
      } else if (next === 'b') {
        tokens.push({
          id: `tok-${start}`,
          type: 'anchor',
          category: 'anchor',
          raw,
          start,
          end: i + 2,
          title: 'Word Boundary',
          explanation: 'Zero-width boundary between word and non-word characters',
          depth,
        });
      } else if (next === 'B') {
        tokens.push({
          id: `tok-${start}`,
          type: 'anchor',
          category: 'anchor',
          raw,
          start,
          end: i + 2,
          title: 'Non-Word Boundary',
          explanation: 'Zero-width position inside a continuous word or non-word sequence',
          depth,
        });
      } else {
        tokens.push({
          id: `tok-${start}`,
          type: 'literal',
          category: 'literal',
          raw,
          start,
          end: i + 2,
          title: `Escaped Literal: ${next}`,
          explanation: `Matches character "${next}" literally without special regex behavior`,
          depth,
        });
      }

      i += 2;
      continue;
    }

    // Anchors
    if (ch === '^') {
      tokens.push({
        id: `tok-${i}`,
        type: 'anchor',
        category: 'anchor',
        raw: '^',
        start: i,
        end: i + 1,
        title: 'Start of String / Line',
        explanation: 'Asserts position at the beginning of input or line',
        depth,
      });
      i++;
      continue;
    }

    if (ch === '$') {
      tokens.push({
        id: `tok-${i}`,
        type: 'anchor',
        category: 'anchor',
        raw: '$',
        start: i,
        end: i + 1,
        title: 'End of String / Line',
        explanation: 'Asserts position at the end of input or line',
        depth,
      });
      i++;
      continue;
    }

    // Dot wildcard
    if (ch === '.') {
      tokens.push({
        id: `tok-${i}`,
        type: 'character_class',
        category: 'character_class',
        raw: '.',
        start: i,
        end: i + 1,
        title: 'Wildcard Dot',
        explanation: 'Matches any single character except newlines (or all with /s)',
        depth,
      });
      i++;
      continue;
    }

    // Alternation
    if (ch === '|') {
      tokens.push({
        id: `tok-${i}`,
        type: 'alternation',
        category: 'alternation',
        raw: '|',
        start: i,
        end: i + 1,
        title: 'Alternation (OR)',
        explanation: 'Matches either the left expression or the right expression',
        depth,
      });
      i++;
      continue;
    }

    // Character sets [abc] / [^abc]
    if (ch === '[') {
      const start = i;
      let j = i + 1;
      let isNegated = false;

      if (j < pattern.length && pattern[j] === '^') {
        isNegated = true;
        j++;
      }

      while (j < pattern.length) {
        if (pattern[j] === '\\') {
          j += 2;
        } else if (pattern[j] === ']') {
          j++;
          break;
        } else {
          j++;
        }
      }

      const raw = pattern.slice(start, j);
      tokens.push({
        id: `tok-${start}`,
        type: 'character_class',
        category: 'character_class',
        raw,
        start,
        end: j,
        title: isNegated ? 'Negated Set' : 'Character Set',
        explanation: isNegated
          ? `Matches any character NOT in ${raw}`
          : `Matches any single character in ${raw}`,
        depth,
      });
      i = j;
      continue;
    }

    // Group open
    if (ch === '(') {
      const start = i;
      let groupType = 'group';
      let title = 'Capture Group';
      let explanation = 'Groups characters and captures matched text';
      let currentGroupIndex: number | undefined = undefined;

      if (pattern.startsWith('(?:', i)) {
        groupType = 'non_capturing';
        title = 'Non-Capturing Group';
        explanation = 'Groups characters together without creating a capture index';
        i += 3;
      } else if (pattern.startsWith('(?=', i)) {
        groupType = 'lookaround';
        title = 'Positive Lookahead';
        explanation = 'Asserts what follows matches without consuming text';
        i += 3;
      } else if (pattern.startsWith('(?!', i)) {
        groupType = 'lookaround';
        title = 'Negative Lookahead';
        explanation = 'Asserts what follows does NOT match without consuming text';
        i += 3;
      } else if (pattern.startsWith('(?<=', i)) {
        groupType = 'lookaround';
        title = 'Positive Lookbehind';
        explanation = 'Asserts what precedes matches without consuming text';
        i += 4;
      } else if (pattern.startsWith('(?<!', i)) {
        groupType = 'lookaround';
        title = 'Negative Lookbehind';
        explanation = 'Asserts what precedes does NOT match without consuming text';
        i += 4;
      } else if (pattern.startsWith('(?<', i)) {
        const endName = pattern.indexOf('>', i);
        if (endName !== -1) {
          const name = pattern.slice(i + 3, endName);
          groupCounter++;
          currentGroupIndex = groupCounter;
          groupStack.push(currentGroupIndex);
          tokens.push({
            id: `tok-${start}`,
            type: 'group_open',
            category: 'group',
            raw: pattern.slice(start, endName + 1),
            start,
            end: endName + 1,
            title: `Named Group: ${name}`,
            explanation: `Captures matched text into group named "${name}"`,
            depth,
            groupIndex: currentGroupIndex,
          });
          depth++;
          i = endName + 1;
          continue;
        } else {
          i++;
        }
      } else {
        groupCounter++;
        currentGroupIndex = groupCounter;
        groupStack.push(currentGroupIndex);
        i++;
      }

      tokens.push({
        id: `tok-${start}`,
        type: 'group_open',
        category: 'group',
        raw: pattern.slice(start, i),
        start,
        end: i,
        title,
        explanation,
        depth,
        groupIndex: currentGroupIndex,
      });
      depth++;
      continue;
    }

    // Group close
    if (ch === ')') {
      depth = Math.max(0, depth - 1);
      const groupIdx = groupStack.pop();
      tokens.push({
        id: `tok-${i}`,
        type: 'group_close',
        category: 'group',
        raw: ')',
        start: i,
        end: i + 1,
        title: groupIdx ? `End of Group #${groupIdx}` : 'End of Group',
        explanation: 'Closes the preceding group',
        depth,
        groupIndex: groupIdx,
      });
      i++;
      continue;
    }

    // Quantifiers: *, +, ?, {n,m}
    if (ch === '*' || ch === '+' || ch === '?') {
      const start = i;
      let raw = ch;
      let greedy = true;

      if (i + 1 < pattern.length && pattern[i + 1] === '?') {
        greedy = false;
        raw += '?';
        i++;
      }

      let title = 'Quantifier';
      let explanation = '';
      let min = 0;
      let max: number | undefined = undefined;

      if (ch === '*') {
        title = greedy ? 'Zero or More (Greedy)' : 'Zero or More (Lazy)';
        explanation = 'Matches 0 or more occurrences of the preceding token';
        min = 0;
      } else if (ch === '+') {
        title = greedy ? 'One or More (Greedy)' : 'One or More (Lazy)';
        explanation = 'Matches 1 or more occurrences of the preceding token';
        min = 1;
      } else if (ch === '?') {
        title = greedy ? 'Optional' : 'Optional (Lazy)';
        explanation = 'Matches 0 or 1 occurrence of the preceding token';
        min = 0;
        max = 1;
      }

      tokens.push({
        id: `tok-${start}`,
        type: 'quantifier',
        category: 'quantifier',
        raw,
        start,
        end: i + 1,
        title,
        explanation,
        depth,
        quantifier: { min, max, greedy },
      });
      i++;
      continue;
    }

    // Range quantifier {min,max}
    if (ch === '{') {
      const close = pattern.indexOf('}', i);
      if (close !== -1 && /^{\d+(?:,\d*)?}$/.test(pattern.slice(i, close + 1))) {
        const start = i;
        let raw = pattern.slice(i, close + 1);
        let greedy = true;
        let endIdx = close + 1;

        if (endIdx < pattern.length && pattern[endIdx] === '?') {
          greedy = false;
          raw += '?';
          endIdx++;
        }

        const inner = raw.replace(/[{}]/g, '').replace('?', '');
        const parts = inner.split(',').map((p) => p.trim());
        const min = parseInt(parts[0], 10);
        const max = parts.length > 1 ? (parts[1] === '' ? undefined : parseInt(parts[1], 10)) : min;

        tokens.push({
          id: `tok-${start}`,
          type: 'quantifier',
          category: 'quantifier',
          raw,
          start,
          end: endIdx,
          title: `Exact / Range Quantifier (${inner})`,
          explanation: max !== undefined ? `Matches between ${min} and ${max} times` : `Matches at least ${min} times`,
          depth,
          quantifier: { min, max, greedy },
        });
        i = endIdx;
        continue;
      }
    }

    // Default: Literal character
    tokens.push({
      id: `tok-${i}`,
      type: 'literal',
      category: 'literal',
      raw: ch,
      start: i,
      end: i + 1,
      title: `Literal: "${ch}"`,
      explanation: `Matches exact character "${ch}"`,
      depth,
    });
    i++;
  }

  return tokens;
}
