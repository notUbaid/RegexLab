// "Examples" window: searchable list of ready-made patterns. Clicking one loads it with its sample text.
import { useState } from 'react';
import { EXAMPLES, type Example } from '../data/examples';
import { Modal, SearchBox } from './Modal';

export function ExamplesModal({ onClose, onLoad }: { onClose: () => void; onLoad: (example: Example) => void }) {
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const shown = EXAMPLES.filter((example) =>
    [example.name, example.category, example.description].some((field) => field.toLowerCase().includes(query)),
  );

  return (
    <Modal title="Examples: click one to load it" onClose={onClose}>
      <SearchBox value={search} onChange={setSearch} placeholder="Search, e.g. email, date, password" />
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {shown.length === 0 && <p className="py-8 text-center text-sm text-foreground-dim">No examples match "{search}".</p>}
        {shown.map((example) => (
          <button
            key={example.name}
            onClick={() => onLoad(example)}
            className="block w-full rounded border border-border bg-surface-subtle p-3 text-left hover:border-foreground/40 hover:bg-surface-elevated"
          >
            <span className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold">{example.name}</span>
              <span className="rounded bg-surface-elevated px-1.5 py-0.5 text-xs text-foreground-dim">{example.category}</span>
            </span>
            <span className="mt-1 block text-xs text-foreground-muted">{example.description}</span>
            <code className="mt-2 block truncate text-xs text-foreground-dim">
              /{example.pattern}/{example.flags}
            </code>
          </button>
        ))}
      </div>
    </Modal>
  );
}
