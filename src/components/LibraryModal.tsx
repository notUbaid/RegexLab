import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, Check, Copy } from 'lucide-react';
import { PATTERN_LIBRARY } from '../data/patternLibrary';
import { PatternItem } from '../types/regex';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPattern: (pattern: string, flags: string, sampleText: string) => void;
}

const CATEGORIES = [
  'All',
  'Web & Network',
  'Security & Auth',
  'Data & Numbers',
  'Dates & Times',
  'Telephony & Location',
  'Programming',
];

export const LibraryModal: React.FC<LibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectPattern,
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredPatterns = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PATTERN_LIBRARY.filter((p) => {
      const matchCat = activeCategory === 'All' || p.category === activeCategory;
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.regex.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [search, activeCategory]);

  const handleCopy = (e: React.MouseEvent, p: PatternItem) => {
    e.stopPropagation();
    navigator.clipboard.writeText(p.regex);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleSelect = (p: PatternItem) => {
    const sampleText = p.testCases.map((tc) => tc.input).join('\n');
    onSelectPattern(p.regex, p.flags || '', sampleText);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[85vh] bg-surface border border-border rounded-lg flex flex-col shadow-2xl overflow-hidden select-none font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-11 px-4 border-b border-border bg-surface-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs text-foreground tracking-tight">
              Preset Pattern Library ({PATTERN_LIBRARY.length} patterns)
            </span>
            <kbd className="px-1.5 py-0.2 rounded bg-surface border border-border text-[10px] text-foreground-dim">
              ESC
            </kbd>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-foreground-dim hover:text-foreground hover:bg-surface-elevated transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-3 border-b border-border bg-surface space-y-2.5">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-surface-subtle border border-border focus-within:border-foreground/30">
            <Search className="w-3.5 h-3.5 text-foreground-dim" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, tag (e.g. email, url, date, semver)..."
              autoFocus
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-foreground-dim focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-[10px] text-foreground-dim hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2 py-0.5 rounded text-[11px] whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-foreground text-background font-semibold'
                    : 'bg-surface-subtle text-foreground-muted hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Pattern List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2 text-xs">
          {filteredPatterns.length === 0 ? (
            <div className="py-12 text-center text-foreground-dim text-xs">
              No preset patterns match your criteria.
            </div>
          ) : (
            filteredPatterns.map((p) => {
              const isCopied = copiedId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelect(p)}
                  className="p-3 rounded bg-surface-subtle border border-border hover:bg-surface-elevated hover:border-foreground/30 cursor-pointer transition-colors space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-xs">
                          {p.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface border border-border text-foreground-dim">
                          {p.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-foreground-muted mt-1 leading-snug">
                        {p.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => handleCopy(e, p)}
                        className="p-1 rounded bg-surface border border-border text-foreground-dim hover:text-foreground transition-colors"
                        title="Copy raw pattern"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleSelect(p)}
                        className="px-2 py-1 rounded bg-foreground text-background font-semibold text-[11px] transition-colors"
                      >
                        Use Pattern
                      </button>
                    </div>
                  </div>

                  {/* Regex code & preview */}
                  <div className="p-1.5 rounded bg-surface border border-border/60 text-foreground font-mono text-[11px] truncate">
                    /{p.regex}/{p.flags || ''}
                  </div>

                  {/* Test cases badge */}
                  <div className="flex items-center justify-between text-[10px] text-foreground-dim">
                    <span>{p.testCases.length} sample cases included</span>
                    <span className="truncate max-w-xs">{p.tags.join(', ')}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
