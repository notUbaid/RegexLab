// "Cheatsheet" window: regex syntax reference. Clicking an entry inserts it into the pattern at the cursor.
import { useState } from 'react';
import { CHEATSHEET } from '../data/cheatsheet';
import { Modal, SearchBox } from './Modal';

export function CheatsheetModal({ onClose, onInsert }: { onClose: () => void; onInsert: (token: string) => void }) {
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const sections = CHEATSHEET.map(({ section, items }) => ({
    section,
    items: items.filter((item) => `${item.token} ${item.name}`.toLowerCase().includes(query)),
  })).filter(({ items }) => items.length > 0);

  return (
    <Modal title="Cheatsheet: click an item to insert it" onClose={onClose}>
      <SearchBox value={search} onChange={setSearch} placeholder="Search, e.g. digit, optional, group" />
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
        {sections.length === 0 && <p className="py-8 text-center text-sm text-foreground-dim">Nothing matches "{search}".</p>}
        {sections.map(({ section, items }) => (
          <div key={section}>
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-foreground-dim">{section}</h3>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {items.map((item) => (
                <button
                  key={item.token}
                  onClick={() => onInsert(item.token)}
                  className="rounded border border-border bg-surface-subtle p-2 text-left hover:border-foreground/40 hover:bg-surface-elevated"
                >
                  <span className="flex items-baseline gap-2">
                    <code className="rounded bg-surface-elevated px-1.5 py-0.5 text-xs font-bold">{item.token}</code>
                    <span className="text-sm">{item.name}</span>
                  </span>
                  <span className="mt-1 block font-mono text-xs text-foreground-dim">{item.example}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
