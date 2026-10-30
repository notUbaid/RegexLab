import React, { useState } from 'react';
import { Volume2, VolumeX, Sun, Moon, Share2, BookOpen, Library, Trophy, SlidersHorizontal, Check } from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

interface TopBarProps {
  onOpenLibrary: () => void;
  onOpenChallenges: () => void;
  onOpenCheatsheet: () => void;
  onShare: () => void;
  paletteOpen: boolean;
  onTogglePalette: () => void;
  theme: string;
  onSelectTheme: (theme: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  shareCopied: boolean;
}

const THEMES = [
  { id: 'dark', label: 'Ink', dot: '#2d2b36' },
  { id: 'light', label: 'Paper', dot: '#f4f3ef' },
  { id: 'midnight', label: 'Dusk', dot: '#282a48' },
  { id: 'oled', label: 'Black', dot: '#000000' },
  { id: 'nord', label: 'Fjord', dot: '#263a3c' },
  { id: 'dracula', label: 'Plum', dot: '#3a2c48' },
];

export const TopBar: React.FC<TopBarProps> = ({
  onOpenLibrary,
  onOpenChallenges,
  onOpenCheatsheet,
  onShare,
  paletteOpen,
  onTogglePalette,
  theme,
  onSelectTheme,
  soundEnabled,
  onToggleSound,
  shareCopied,
}) => {
  const [themeOpen, setThemeOpen] = useState(false);

  return (
    <header className="h-11 border-b border-border bg-surface px-4 flex items-center justify-between shrink-0 select-none text-xs">
      {/* Brand & Left Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-bold tracking-tight text-sm text-foreground">
          <span className="w-5 h-5 rounded bg-hl text-[#1a1608] font-mono text-xs flex items-center justify-center font-semibold -rotate-3">
            /
          </span>
          <span>RegexLab</span>
        </div>

        <span className="h-4 w-px bg-border mx-1" />

        <button
          onClick={onTogglePalette}
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
            paletteOpen
              ? 'bg-foreground/10 text-foreground font-semibold'
              : 'text-foreground-muted hover:text-foreground hover:bg-surface-elevated'
          }`}
          title="Toggle Token Palette"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Tokens</span>
        </button>

        <button
          onClick={onOpenLibrary}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-foreground-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
          title="Browse Pattern Presets"
        >
          <Library className="w-3.5 h-3.5" />
          <span>Presets</span>
        </button>

        <button
          onClick={onOpenChallenges}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-foreground-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
          title="Practice Challenges"
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Practice</span>
        </button>

        <button
          onClick={onOpenCheatsheet}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-foreground-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
          title="Regex Quick Reference (Ctrl+K)"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Cheatsheet</span>
          <kbd className="hidden md:inline px-1 py-0.2 rounded bg-surface-elevated border border-border text-[10px] text-foreground-dim font-mono">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onToggleSound}
          className="p-1.5 rounded text-foreground-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
          title={soundEnabled ? 'Mute sound effects' : 'Enable tactile clicks'}
          aria-label="Sound toggle"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* Theme Picker */}
        <div className="relative">
          <button
            onClick={() => setThemeOpen(!themeOpen)}
            className="p-1.5 rounded text-foreground-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
            title="Switch theme"
            aria-label="Theme toggle"
          >
            {theme === 'light' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {themeOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setThemeOpen(false)} />
              <div className="absolute right-0 mt-1 w-36 py-1 rounded-md bg-surface border border-border shadow-xl z-50">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTheme(t.id);
                      setThemeOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-left text-xs ${
                      theme === t.id
                        ? 'bg-surface-elevated text-foreground font-semibold'
                        : 'text-foreground-muted hover:bg-surface-elevated/60 hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full ring-1 ring-foreground/20" style={{ background: t.dot }} />
                      <span>{t.label}</span>
                    </div>
                    {theme === t.id && <Check className="w-3 h-3 text-primary" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Share Button */}
        <button
          onClick={onShare}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-foreground text-background font-semibold text-xs hover:bg-foreground/90 transition-colors"
          title="Copy shareable URL (Ctrl+S)"
        >
          {shareCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{shareCopied ? 'Copied' : 'Share'}</span>
        </button>
      </div>
    </header>
  );
};
