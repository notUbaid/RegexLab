import React from 'react';
import { useRegexStore } from '../../store/useRegexStore';
import { NAV_GROUPS, ALL_NAV } from './navItems';

export const Brand: React.FC = () => {
  const { setActiveView } = useRegexStore();
  return (
    <button onClick={() => setActiveView('landing')} className="flex items-center gap-2.5 select-none" aria-label="RegexLab home">
      <span className="grid place-items-center w-7 h-7 rounded-[6px] bg-hl text-[#1a1608] font-mono text-[15px] font-semibold -rotate-3" aria-hidden>/</span>
      <span className="text-[18px] font-bold tracking-tight">RegexLab</span>
    </button>
  );
};

export const Sidebar: React.FC<{ onOpenCheatSheet: () => void }> = ({ onOpenCheatSheet }) => {
  const { activeView, setActiveView } = useRegexStore();
  return (
    <>
      <aside className="hidden lg:flex w-56 shrink-0 sticky top-0 h-screen flex-col border-r border-border px-6 py-7">
        <Brand />
        <nav className="flex-1 overflow-y-auto mt-10 space-y-7 scrollbar-none" aria-label="Main">
          {NAV_GROUPS.map((g, gi) => (
            <div key={gi}>
              {g.title && <div className="pb-2 text-xs text-foreground-dim">{g.title}</div>}
              <ul className="space-y-1">
                {g.items.map((it) => {
                  const on = activeView === it.view;
                  return (
                    <li key={it.view}>
                      <button onClick={() => setActiveView(it.view)} aria-current={on ? 'page' : undefined} title={it.hint}
                        className={`text-[16px] leading-7 transition-colors ${on ? 'text-foreground font-semibold' : 'text-foreground-muted hover:text-foreground'}`}>
                        <span className={`px-0.5 -mx-0.5 ${on ? 'swipe' : 'swipe-hover'}`}>{it.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <button onClick={onOpenCheatSheet} className="mt-6 flex items-center justify-between text-[13px] text-foreground-muted hover:text-foreground">
          Cheat sheet <kbd>Ctrl K</kbd>
        </button>
      </aside>

      <nav className="lg:hidden sticky top-0 z-40 flex items-center gap-4 px-4 h-12 border-b border-border bg-background/95 backdrop-blur overflow-x-auto scrollbar-none" aria-label="Main">
        <Brand />
        {ALL_NAV.map((it) => (
          <button key={it.view} onClick={() => setActiveView(it.view)} className={`shrink-0 text-[14px] ${activeView === it.view ? 'text-foreground font-semibold' : 'text-foreground-muted'}`}>
            <span className={activeView === it.view ? 'swipe' : ''}>{it.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
};
