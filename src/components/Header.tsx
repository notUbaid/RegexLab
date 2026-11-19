// Top bar: app name, the three helper windows, theme switch and the share button.
import { BookOpen, Check, GraduationCap, Library, Link, Moon, Sun } from 'lucide-react';
import { copyLabel, type CopyStatus } from '../useCopy';
import { Tip } from './Tip';

interface HeaderProps {
  onOpenExamples: () => void;
  onOpenCheatsheet: () => void;
  onOpenPractice: () => void;
  theme: string;
  onToggleTheme: () => void;
  onShare: () => void;
  shareStatus: CopyStatus;
}

const navButton =
  'flex items-center gap-1.5 rounded-md px-2 py-1.5 text-foreground-muted hover:bg-surface-elevated hover:text-foreground';

export function Header(props: HeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border bg-surface px-4 text-sm">
      <div className="flex items-center gap-1 sm:gap-2">
        <span className="mr-2 flex items-center gap-2 font-bold">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-hl font-mono text-sm text-[#1a1608]">/</span>
          <span className="hidden sm:inline">RegexLab</span>
        </span>
        <Tip text="Load a ready-made pattern, like an email or a date, with sample text.">
          <button onClick={props.onOpenExamples} className={navButton} aria-label="Examples">
            <Library className="h-4 w-4" />
            <span className="hidden sm:inline">Examples</span>
          </button>
        </Tip>
        <Tip text="All the regex symbols in one place. Click one to add it to your pattern.">
          <button onClick={props.onOpenCheatsheet} className={navButton} aria-label="Cheatsheet">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Cheatsheet</span>
          </button>
        </Tip>
        <Tip text="Small exercises that check your pattern as you type.">
          <button onClick={props.onOpenPractice} className={navButton} aria-label="Practice">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Practice</span>
          </button>
        </Tip>
      </div>

      <div className="flex items-center gap-2">
        <Tip text={props.theme === 'dark' ? 'Switch to the light theme' : 'Switch to the dark theme'} alignRight>
          <button
            onClick={props.onToggleTheme}
            className="rounded-md p-2 text-foreground-muted hover:bg-surface-elevated hover:text-foreground"
            aria-label={props.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {props.theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </Tip>
        <Tip text="Copy a link that opens this exact pattern, flags and text." alignRight>
          <button
            onClick={props.onShare}
            className="flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 font-semibold text-background hover:opacity-90"
          >
            {props.shareStatus === 'copied' ? <Check className="h-4 w-4" /> : <Link className="h-4 w-4" />}
            <span>{copyLabel(props.shareStatus, 'Share')}</span>
          </button>
        </Tip>
      </div>
    </header>
  );
}
