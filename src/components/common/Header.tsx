import React, { useState } from 'react';
import { useRegexStore } from '../../store/useRegexStore';
import { AppView, Theme } from '../../types/regex';
import { 
  Play, 
  Workflow, 
  Blocks, 
  Network, 
  Bug, 
  Gauge, 
  Globe2, 
  Library, 
  GitCompare, 
  Trophy, 
  Share2, 
  BookOpen, 
  Palette, 
  Volume2, 
  VolumeX,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

interface HeaderProps {
  onOpenShare: () => void;
  onOpenCheatSheet: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenShare, onOpenCheatSheet }) => {
  const { activeView, setActiveView, theme, setTheme, soundEnabled, setSoundEnabled } = useRegexStore();
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const navItems: { view: AppView; label: string; icon: React.ReactNode; badge?: string }[] = [
    { view: 'playground', label: 'Playground', icon: <Play className="w-3.5 h-3.5" /> },
    { view: 'visualizer', label: 'Step-by-Step', icon: <Workflow className="w-3.5 h-3.5" /> },
    { view: 'builder', label: 'No-Code Builder', icon: <Blocks className="w-3.5 h-3.5" /> },
    { view: 'ast', label: 'Regex Tree', icon: <Network className="w-3.5 h-3.5" /> },
    { view: 'debugger', label: 'Fix Errors', icon: <Bug className="w-3.5 h-3.5" /> },
    { view: 'performance', label: 'Speed Check', icon: <Gauge className="w-3.5 h-3.5" /> },
    { view: 'compatibility', label: 'Languages', icon: <Globe2 className="w-3.5 h-3.5" /> },
    { view: 'library', label: 'Examples', icon: <Library className="w-3.5 h-3.5" /> },
    { view: 'compare', label: 'Compare', icon: <GitCompare className="w-3.5 h-3.5" /> },
    { view: 'challenges', label: 'Practice', icon: <Trophy className="w-3.5 h-3.5" /> },
  ];

  const themes: { id: Theme; label: string; dotColor: string }[] = [
    { id: 'dark', label: 'Studio Obsidian', dotColor: '#f59e0b' },
    { id: 'light', label: 'Studio Paper', dotColor: '#d97706' },
    { id: 'midnight', label: 'Terracotta', dotColor: '#f97316' },
    { id: 'oled', label: 'Pure Monolith', dotColor: '#ffffff' },
    { id: 'nord', label: 'Studio Sage', dotColor: '#10b981' },
    { id: 'dracula', label: 'Vintage Amber CRT', dotColor: '#eab308' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/90 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setActiveView('landing')} 
          className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-primary group-hover:border-primary group-hover:bg-primary/15 transition-all duration-200">
            <span className="font-mono font-bold text-xs">/r/</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-foreground">
              Regex<span className="text-primary font-black">Lab</span>
            </span>
            <span className="px-1.5 py-0.5 rounded bg-surface-elevated text-foreground-dim text-[10px] font-mono border border-border">
              beginner friendly
            </span>
          </div>
        </div>

        {/* Center Nav Navigation */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setActiveView(item.view)}
                className={`relative px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'text-foreground bg-surface-elevated shadow-sm border border-border-subtle'
                    : 'text-foreground-muted hover:text-foreground hover:bg-surface-elevated/50'
                }`}
              >
                <span className={isActive ? 'text-primary' : 'text-foreground-dim'}>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1 py-0.2 rounded text-[8px] font-semibold uppercase tracking-wider bg-primary/20 text-primary">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Tools & Theme Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Sound FX Toggle */}
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              soundFX.setEnabled(next);
              if (next) soundFX.playSuccess();
            }}
            className={`p-2 rounded-lg border transition-all flex items-center justify-center text-xs ${
              soundEnabled
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'text-foreground-muted hover:text-foreground hover:bg-surface-elevated border-transparent'
            }`}
            title={soundEnabled ? 'Disable Audio Feedback' : 'Enable Audio Feedback'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Cheat Sheet trigger */}
          <button
            onClick={onOpenCheatSheet}
            className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-elevated border border-transparent hover:border-border-subtle transition-all flex items-center gap-1.5 text-xs font-medium"
            title="Open Regex Cheat Sheet"
          >
            <BookOpen className="w-4 h-4 text-foreground-dim" />
            <span className="hidden sm:inline">Cheat Sheet</span>
          </button>

          {/* Share Modal trigger */}
          <button
            onClick={onOpenShare}
            className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-elevated border border-transparent hover:border-border-subtle transition-all flex items-center gap-1.5 text-xs font-medium"
            title="Share or Export Code"
          >
            <Share2 className="w-4 h-4 text-foreground-dim" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Theme Dropdown */}
          <div className="relative">
            <button
              onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-elevated border border-border-subtle transition-all flex items-center gap-1.5 text-xs"
              title="Change Color Theme"
            >
              <Palette className="w-4 h-4 text-primary" />
              <ChevronDown className="w-3 h-3 text-foreground-dim" />
            </button>

            {themeDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setThemeDropdownOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-surface border border-border-subtle shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground-dim border-b border-border-subtle mb-1">
                    Theme Palette
                  </div>
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id);
                        setThemeDropdownOpen(false);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                        theme === t.id
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-foreground-muted hover:text-foreground hover:bg-surface-elevated'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.dotColor }} />
                        <span>{t.label}</span>
                      </div>
                      {theme === t.id && <Sparkles className="w-3 h-3 text-primary" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden flex items-center gap-1 px-4 py-1.5 overflow-x-auto border-t border-border-subtle/50 bg-surface-subtle/60 scrollbar-none">
        {navItems.map((item) => {
          const isActive = activeView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setActiveView(item.view)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 shrink-0 ${
                isActive
                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                  : 'text-foreground-muted hover:text-foreground hover:bg-surface-elevated'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
