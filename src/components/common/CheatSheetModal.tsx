import React, { useState } from 'react';
import { useRegexStore } from '../../store/useRegexStore';
import { X, Search, BookOpen, Plus } from 'lucide-react';

interface CheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
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
      { token: '\\B', name: 'Non-Word Boundary', desc: 'Inside a word boundary', example: '\\Bcat' },
    ],
  },
  {
    category: 'Quantifiers (Repetition)',
    items: [
      { token: '*', name: 'Zero or More', desc: 'Matches 0 or more times (greedy)', example: 'a* -> "", "a", "aaa"' },
      { token: '+', name: 'One or More', desc: 'Matches 1 or more times (greedy)', example: 'a+ -> "a", "aaa"' },
      { token: '?', name: 'Optional', desc: 'Matches 0 or 1 time', example: 'colou?r' },
      { token: '{n}', name: 'Exact Count', desc: 'Matches exactly n times', example: '\\d{4}' },
      { token: '{n,}', name: 'At Least n', desc: 'Matches n or more times', example: '\\d{2,}' },
      { token: '{n,m}', name: 'Between n and m', desc: 'Matches between n and m times', example: '\\d{2,4}' },
      { token: '*?', name: 'Lazy Quantifier', desc: 'Matches as few characters as possible', example: '<.*?>' },
    ],
  },
  {
    category: 'Groups & Lookarounds',
    items: [
      { token: '(abc)', name: 'Capture Group', desc: 'Captures matched text as group', example: '(user)' },
      { token: '(?:abc)', name: 'Non-Capturing Group', desc: 'Groups without capturing memory', example: '(?:https?|ftp)' },
      { token: '(?<name>abc)', name: 'Named Group', desc: 'Captures with explicit name key', example: '(?<id>\\d+)' },
      { token: 'a|b', name: 'Alternation (OR)', desc: 'Matches either branch a or b', example: 'cat|dog' },
      { token: '(?=abc)', name: 'Positive Lookahead', desc: 'Asserts pattern follows (zero-width)', example: 'q(?=u)' },
      { token: '(?!abc)', name: 'Negative Lookahead', desc: 'Asserts pattern does NOT follow', example: 'q(?!u)' },
      { token: '(?<=abc)', name: 'Positive Lookbehind', desc: 'Asserts pattern precedes', example: '(?<=\\$)\\d+' },
      { token: '(?<!abc)', name: 'Negative Lookbehind', desc: 'Asserts pattern does NOT precede', example: '(?<!\\$)\\d+' },
    ],
  },
];

export const CheatSheetModal: React.FC<CheatSheetModalProps> = ({ isOpen, onClose }) => {
  const { pattern, setPattern } = useRegexStore();
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const handleInsert = (token: string) => {
    setPattern(pattern + token);
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-surface border border-border-subtle rounded-2xl shadow-2xl overflow-hidden p-6 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border-subtle shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Regex Cheat Sheet & Quick Reference</h3>
              <p className="text-xs text-foreground-muted">Click any item to insert it directly into your pattern editor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="my-4 relative shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground-dim" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tokens, symbols, explanations..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-foreground placeholder:text-foreground-dim focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Categories list */}
        <div className="overflow-y-auto space-y-5 pr-1 flex-1">
          {filteredCategories.map((cat) => (
            <div key={cat.category} className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">{cat.category}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {cat.items.map((item) => (
                  <div
                    key={item.token}
                    onClick={() => handleInsert(item.token)}
                    className="group p-2.5 rounded-xl bg-surface-subtle hover:bg-surface-elevated border border-border-subtle hover:border-primary/30 cursor-pointer transition-all flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-black/40 text-primary font-mono text-xs font-bold border border-white/5">
                          {item.token}
                        </span>
                        <span className="text-xs font-medium text-foreground truncate">{item.name}</span>
                      </div>
                      <p className="text-[11px] text-foreground-muted line-clamp-1">{item.desc}</p>
                      <p className="text-[10px] text-foreground-dim font-mono">{item.example}</p>
                    </div>
                    <button
                      className="p-1.5 rounded-lg bg-surface hover:bg-primary hover:text-primary-foreground text-foreground-muted opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      title="Insert into pattern"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border-subtle flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-medium rounded-xl bg-surface-elevated hover:bg-surface-elevated/80 text-foreground transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
