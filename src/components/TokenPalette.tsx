import React from 'react';
import { X } from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

interface TokenPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertToken: (tokenSnippet: string) => void;
}

interface PaletteItem {
  token: string;
  label: string;
  desc: string;
}

interface PaletteSection {
  title: string;
  items: PaletteItem[];
}

const PALETTE_SECTIONS: PaletteSection[] = [
  {
    title: 'Character Classes',
    items: [
      { token: '\\d', label: 'Digit (0-9)', desc: 'Matches any single digit character' },
      { token: '\\D', label: 'Non-digit', desc: 'Matches any character that is not a digit' },
      { token: '\\w', label: 'Word character', desc: 'Matches [a-zA-Z0-9_]' },
      { token: '\\W', label: 'Non-word char', desc: 'Matches punctuation or symbols' },
      { token: '\\s', label: 'Whitespace', desc: 'Matches space, tab, or newline' },
      { token: '\\S', label: 'Non-whitespace', desc: 'Matches any non-space character' },
      { token: '.', label: 'Any character', desc: 'Matches any char except newline' },
      { token: '[a-z]', label: 'Range a-z', desc: 'Matches lowercase letter' },
      { token: '[^a-z]', label: 'Negated set', desc: 'Matches anything NOT in set' },
    ],
  },
  {
    title: 'Quantifiers',
    items: [
      { token: '+', label: 'One or more', desc: 'Matches 1 or more occurrences (greedy)' },
      { token: '*', label: 'Zero or more', desc: 'Matches 0 or more occurrences (greedy)' },
      { token: '?', label: 'Optional (0 or 1)', desc: 'Makes preceding item optional' },
      { token: '{2,5}', label: 'Between 2 and 5', desc: 'Matches between min and max count' },
      { token: '{3,}', label: 'At least 3', desc: 'Matches minimum 3 occurrences' },
      { token: '+?', label: 'Lazy quantifier', desc: 'Matches as few characters as possible' },
    ],
  },
  {
    title: 'Anchors & Boundaries',
    items: [
      { token: '^', label: 'Start of string/line', desc: 'Asserts position at start' },
      { token: '$', label: 'End of string/line', desc: 'Asserts position at end' },
      { token: '\\b', label: 'Word boundary', desc: 'Boundary between word and non-word' },
      { token: '\\B', label: 'Non-word boundary', desc: 'Position inside a continuous word' },
    ],
  },
  {
    title: 'Groups & Alternation',
    items: [
      { token: '()', label: 'Capture group', desc: 'Captures enclosed subpattern' },
      { token: '(?:)', label: 'Non-capturing group', desc: 'Groups without capturing memory' },
      { token: '(?<id>)', label: 'Named group', desc: 'Captures with named identifier' },
      { token: '|', label: 'Alternation (OR)', desc: 'Matches either left or right branch' },
    ],
  },
  {
    title: 'Lookarounds',
    items: [
      { token: '(?=)', label: 'Positive lookahead', desc: 'Matches if followed by pattern' },
      { token: '(?! )', label: 'Negative lookahead', desc: 'Matches if NOT followed by pattern' },
      { token: '(?<=)', label: 'Positive lookbehind', desc: 'Matches if preceded by pattern' },
      { token: '(?<! )', label: 'Negative lookbehind', desc: 'Matches if NOT preceded by pattern' },
    ],
  },
];

export const TokenPalette: React.FC<TokenPaletteProps> = ({
  isOpen,
  onClose,
  onInsertToken,
}) => {
  if (!isOpen) return null;

  return (
    <aside className="w-64 border-r border-border bg-surface flex flex-col h-full shrink-0 select-none z-20 animate-drawer-in shadow-lg">
      {/* Drawer Header */}
      <div className="h-9 px-3 border-b border-border bg-surface-subtle flex items-center justify-between text-xs">
        <span className="font-semibold text-foreground tracking-tight">Token Palette</span>
        <button
          onClick={() => {
            soundFX.playLatch();
            onClose();
          }}
          className="p-1 rounded text-foreground-dim hover:text-foreground hover:bg-surface-elevated transition-colors"
          title="Close palette"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Token List */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-4 text-xs">
        {PALETTE_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            <h3 className="px-1 text-[10px] font-bold uppercase tracking-wider text-foreground-dim">
              {section.title}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <button
                  key={item.token}
                  onClick={() => {
                    soundFX.playKeypress();
                    onInsertToken(item.token);
                  }}
                  className="w-full text-left p-1.5 rounded flex items-center justify-between hover:bg-surface-elevated border border-transparent hover:border-border transition-all active:scale-[0.98] group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <code className="px-1.5 py-0.5 rounded bg-surface-subtle text-foreground font-mono text-xs font-semibold group-hover:bg-foreground group-hover:text-background transition-colors">
                      {item.token}
                    </code>
                    <span className="text-foreground-muted group-hover:text-foreground text-[11px] truncate">
                      {item.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
