import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';

interface CheatsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertToken: (token: string) => void;
}

interface CheatItem {
  token: string;
  name: string;
  desc: string;
  example: string;
}

const CHEAT_CATEGORIES: { category: string; items: CheatItem[] }[] = [
  {
    category: 'Character Classes',
    items: [
      { token: '\\d', name: 'Digit', desc: 'Any digit from 0 to 9', example: '\\d -> "3"' },
      { token: '\\D', name: 'Non-Digit', desc: 'Any character other than digits', example: '\\D -> "a"' },
      { token: '\\w', name: 'Word Character', desc: 'Alphanumeric and underscore [a-zA-Z0-9_]', example: '\\w -> "x"' },
      { token: '\\W', name: 'Non-Word Character', desc: 'Any symbol or whitespace', example: '\\W -> "!"' },
      { token: '\\s', name: 'Whitespace', desc: 'Space, tab, newline', example: '\\s -> " "' },
      { token: '\\S', name: 'Non-Whitespace', desc: 'Any non-blank character', example: '\\S -> "A"' },
      { token: '.', name: 'Wildcard Dot', desc: 'Any character except line breaks', example: '. -> "k"' },
      { token: '[abc]', name: 'Character Set', desc: 'Matches any single char in set', example: '[aeiou] -> "e"' },
      { token: '[^abc]', name: 'Negated Set', desc: 'Matches any char NOT in set', example: '[^0-9] -> "z"' },
      { token: '[a-z]', name: 'Range', desc: 'Matches chars in range', example: '[A-Z] -> "M"' },
    ],
  },
  {
    category: 'Anchors & Boundaries',
    items: [
      { token: '^', name: 'Start of String/Line', desc: 'Asserts position at start', example: '^Start' },
      { token: '$', name: 'End of String/Line', desc: 'Asserts position at end', example: 'End$' },
      { token: '\\b', name: 'Word Boundary', desc: 'Boundary between \\w and \\W', example: '\\bcat\\b' },
      { token: '\\B', name: 'Non-Word Boundary', desc: 'Inside a continuous word', example: '\\Bcat' },
    ],
  },
  {
    category: 'Quantifiers',
    items: [
      { token: '*', name: 'Zero or More', desc: 'Matches 0 or more times (greedy)', example: 'a* -> "", "a", "aaa"' },
      { token: '+', name: 'One or More', desc: 'Matches 1 or more times (greedy)', example: 'a+ -> "a", "aaa"' },
      { token: '?', name: 'Optional', desc: 'Matches 0 or 1 time', example: 'colou?r' },
      { token: '{n}', name: 'Exact Count', desc: 'Matches exactly n times', example: '\\d{4}' },
      { token: '{n,}', name: 'At Least n', desc: 'Matches n or more times', example: '\\d{2,}' },
      { token: '{n,m}', name: 'Between n and m', desc: 'Matches between n and m times', example: '\\d{2,4}' },
      { token: '+?', name: 'Lazy Quantifier', desc: 'Matches as few characters as possible', example: 'a+?' },
    ],
  },
  {
    category: 'Groups & Logic',
    items: [
      { token: '(abc)', name: 'Capture Group', desc: 'Captures matched text as numbered group', example: '(user)' },
      { token: '(?:abc)', name: 'Non-Capturing Group', desc: 'Groups without capturing memory', example: '(?:https?|ftp)' },
      { token: '(?<name>abc)', name: 'Named Group', desc: 'Captures with explicit name key', example: '(?<id>\\d+)' },
      { token: 'a|b', name: 'Alternation (OR)', desc: 'Matches either branch a or b', example: 'cat|dog' },
    ],
  },
  {
    category: 'Lookaround Assertions',
    items: [
      { token: '(?=abc)', name: 'Positive Lookahead', desc: 'Matches if followed by abc', example: 'q(?=u)' },
      { token: '(?!abc)', name: 'Negative Lookahead', desc: 'Matches if NOT followed by abc', example: 'q(?!u)' },
      { token: '(?<=abc)', name: 'Positive Lookbehind', desc: 'Matches if preceded by abc', example: '(?<=\\$)\\d+' },
      { token: '(?<!abc)', name: 'Negative Lookbehind', desc: 'Matches if NOT preceded by abc', example: '(?<!\\$)\\d+' },
    ],
  },
];

export const CheatsheetModal: React.FC<CheatsheetModalProps> = ({
  isOpen,
  onClose,
  onInsertToken,
}) => {
  const [search, setSearch] = useState('');

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredCategories = CHEAT_CATEGORIES.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.token.toLowerCase().includes(search.toLowerCase()) ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.desc.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] bg-surface border border-border rounded-lg flex flex-col shadow-2xl overflow-hidden select-none font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-11 px-4 border-b border-border bg-surface-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs text-foreground tracking-tight">
              Regex Quick Reference
            </span>
            <kbd className="px-1.5 py-0.2 rounded bg-surface border border-border text-[10px] text-foreground-dim">
              ESC to close
            </kbd>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-foreground-dim hover:text-foreground hover:bg-surface-elevated transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-border bg-surface">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-surface-subtle border border-border focus-within:border-foreground/30">
            <Search className="w-3.5 h-3.5 text-foreground-dim" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tokens, anchors, lookarounds..."
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
        </div>

        {/* Content list */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-5 text-xs">
          {filteredCategories.length === 0 ? (
            <div className="py-12 text-center text-foreground-dim text-xs">
              No matching tokens found for "{search}"
            </div>
          ) : (
            filteredCategories.map((cat) => (
              <div key={cat.category} className="space-y-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-foreground-dim pb-1 border-b border-border/50">
                  {cat.category}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {cat.items.map((item) => (
                    <div
                      key={item.token}
                      onClick={() => {
                        onInsertToken(item.token);
                        onClose();
                      }}
                      className="p-2 rounded bg-surface-subtle border border-border hover:bg-surface-elevated hover:border-foreground/30 cursor-pointer transition-colors group flex items-start justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="px-1.5 py-0.5 rounded bg-surface text-amber-300 font-bold border border-border text-xs group-hover:bg-foreground group-hover:text-background transition-colors">
                            {item.token}
                          </code>
                          <span className="font-semibold text-foreground text-xs truncate">
                            {item.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-foreground-muted leading-tight">
                          {item.desc}
                        </p>
                        <p className="text-[10px] text-foreground-dim mt-1">
                          Example: <span className="text-foreground-muted">{item.example}</span>
                        </p>
                      </div>
                      <span className="text-[10px] text-foreground-dim opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mt-1">
                        + Insert
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
