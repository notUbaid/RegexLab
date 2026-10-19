import React, { useState } from 'react';
import { useRegexStore } from '../../store/useRegexStore';
import { Theme } from '../../types/regex';
import { ALL_NAV } from './navItems';
import { Share2, Volume2, VolumeX, Check, Sun, Moon } from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

interface HeaderProps { onOpenShare: () => void; onOpenCheatSheet: () => void }

const THEMES: { id: Theme; label: string; dot: string }[] = [
  { id: 'dark', label: 'Ink', dot: '#2d2b36' }, { id: 'light', label: 'Paper', dot: '#f4f3ef' },
  { id: 'midnight', label: 'Dusk', dot: '#282a48' }, { id: 'oled', label: 'Black', dot: '#000000' },
  { id: 'nord', label: 'Fjord', dot: '#263a3c' }, { id: 'dracula', label: 'Plum', dot: '#3a2c48' },
];

export const Header: React.FC<HeaderProps> = ({ onOpenShare }) => {
  const { activeView, theme, setTheme, soundEnabled, setSoundEnabled } = useRegexStore();
  const [open, setOpen] = useState(false);
  const current = ALL_NAV.find((n) => n.view === activeView);
  const ghost = 'p-2 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-elevated transition-colors';

  return (
    <header className="sticky top-0 lg:top-0 max-lg:top-12 z-30 h-14 flex items-center justify-end px-6 pointer-events-none">
      <div className="flex items-center gap-1 pointer-events-auto">
        <button className={ghost} aria-label={soundEnabled ? 'Mute sounds' : 'Turn on sounds'}
          onClick={() => { const n = !soundEnabled; setSoundEnabled(n); soundFX.setEnabled(n); if (n) soundFX.playSuccess(); }}>
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
        <div className="relative">
          <button className={ghost} onClick={() => setOpen(!open)} aria-label="Change theme" aria-expanded={open}>
            {theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {open && (<>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 mt-1.5 w-40 panel p-1 z-50 shadow-2xl">
              {THEMES.map((t) => (
                <button key={t.id} onClick={() => { setTheme(t.id); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] ${theme === t.id ? 'bg-surface-elevated text-foreground' : 'text-foreground-muted hover:bg-surface-elevated/60 hover:text-foreground'}`}>
                  <span className="w-3 h-3 rounded-full ring-1 ring-foreground/25" style={{ background: t.dot }} />
                  <span className="flex-1 text-left">{t.label}</span>
                  {theme === t.id && <Check className="w-3.5 h-3.5 text-primary" />}
                </button>
              ))}
            </div>
          </>)}
        </div>
        <button onClick={onOpenShare} className="ml-1 flex items-center gap-1.5 h-8 px-3 rounded-md bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/85 transition-colors">
          <Share2 className="w-3.5 h-3.5" />Share
        </button>
      </div>
    </header>
  );
};
