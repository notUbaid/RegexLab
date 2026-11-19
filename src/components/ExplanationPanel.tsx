// Bottom panel: every piece of the pattern next to its meaning in plain English.
// Pieces inside a group are indented, and capture groups use the same colour as their highlight.
import type { Token } from '../engine/types';

export function ExplanationPanel({ tokens }: { tokens: Token[] }) {
  return (
    <section className="flex h-full flex-col bg-surface">
      <h2 className="flex h-10 shrink-0 items-center border-b border-border bg-surface-subtle px-3 text-xs font-semibold">
        What the pattern means
      </h2>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2 text-sm">
        {tokens.length === 0 ? (
          <p className="text-foreground-dim">Type a pattern above and each part of it will be explained here.</p>
        ) : (
          <ol className="space-y-1">
            {tokens.map((token) => (
              <li key={token.start} className="flex items-baseline gap-3" style={{ paddingLeft: token.depth * 20 }}>
                <code
                  className={`shrink-0 rounded px-1.5 py-0.5 text-xs ${
                    token.groupNumber ? `group-chip g${token.groupNumber % 8}` : 'bg-surface-elevated'
                  }`}
                >
                  {token.raw}
                </code>
                <span className="text-foreground-muted">{token.description}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
