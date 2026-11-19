// "Explanation" tab: every piece of the pattern next to its meaning in plain English.
// Pieces inside a group are indented, and capture groups use the same colour as their highlight.
import type { Token } from '../engine/types';

interface Row {
  text: string;
  description: string;
  depth: number;
  groupNumber?: number;
  isPlainText: boolean;
}

// Turns tokens into the rows shown on screen, with two changes to keep the list short:
//  - plain characters next to each other become one row, so "cat" is one row, not three
//  - closing brackets are left out, because the indentation already shows where a group ends
function buildRows(tokens: Token[]): Row[] {
  const rows: Row[] = [];

  for (const token of tokens) {
    if (token.kind === 'group-close') continue;

    const isPlainText = token.kind === 'literal' && token.raw.length === 1 && token.raw !== '\\';
    const lastRow = rows[rows.length - 1];

    if (isPlainText && lastRow && lastRow.isPlainText && lastRow.depth === token.depth) {
      lastRow.text += token.raw;
      lastRow.description = `the text "${lastRow.text}"`;
      continue;
    }

    rows.push({
      text: token.raw,
      description: token.description,
      depth: token.depth,
      groupNumber: token.groupNumber,
      isPlainText,
    });
  }

  return rows;
}

export function ExplanationPanel({ tokens }: { tokens: Token[] }) {
  if (tokens.length === 0) {
    return <p className="p-4 text-foreground-dim">Type a pattern above and each part of it will be explained here.</p>;
  }

  return (
    <ol className="space-y-2 p-4">
      {buildRows(tokens).map((row, i) => (
        <li key={i} className="flex items-baseline gap-3" style={{ paddingLeft: row.depth * 20 }}>
          <code
            className={`min-w-[2.25rem] shrink-0 whitespace-pre rounded px-1.5 py-0.5 text-center ${
              row.groupNumber ? `group-chip g${row.groupNumber % 8}` : 'bg-surface-elevated'
            }`}
          >
            {row.text}
          </code>
          <span className="text-foreground-muted">{row.description}</span>
        </li>
      ))}
    </ol>
  );
}
