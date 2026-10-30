import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { TopBar } from './TopBar';
import { PatternInput } from './PatternInput';
import { TestEditor } from './TestEditor';
import { MatchTable } from './MatchTable';
import { TokenPalette } from './TokenPalette';
import { Inspector, InspectorTab } from './Inspector';
import { CheatsheetModal } from './CheatsheetModal';
import { LibraryModal } from './LibraryModal';
import { ChallengesModal } from './ChallengesModal';
import { analyzeRegex } from '../engine/analyze';
import { soundFX, SoundProfile } from '../utils/soundEffects';

const DEFAULT_PATTERN = 'v?(\\d+)\\.(\\d+)\\.(\\d+)(?:-([0-9A-Za-z.-]+))?';
const DEFAULT_FLAGS = 'gm';
const DEFAULT_TEST_TEXT = `v1.2.3
v2.0.0-beta.1
1.0.4-rc.2
release-v0.9.0-alpha
v3.14.159-preview.5
invalid-version-here
v4.0.0
2.1.0-rc1`;

export const Workspace: React.FC = () => {
  // 1. Initial state parsing from URL if available
  const getInitialState = () => {
    try {
      const search = window.location.search || (window.location.hash.startsWith('#?') ? window.location.hash.slice(1) : '');
      const params = new URLSearchParams(search);
      const p = params.get('p');
      const f = params.get('f');
      const t = params.get('t');
      const tab = params.get('tab') as InspectorTab;

      return {
        pattern: p !== null ? decodeURIComponent(p) : DEFAULT_PATTERN,
        flags: f !== null ? decodeURIComponent(f) : DEFAULT_FLAGS,
        testText: t !== null ? decodeURIComponent(t) : DEFAULT_TEST_TEXT,
        activeTab: tab || 'visualizer',
      };
    } catch {
      return {
        pattern: DEFAULT_PATTERN,
        flags: DEFAULT_FLAGS,
        testText: DEFAULT_TEST_TEXT,
        activeTab: 'visualizer' as InspectorTab,
      };
    }
  };

  const initial = getInitialState();

  const [pattern, setPattern] = useState<string>(initial.pattern);
  const [flags, setFlags] = useState<string>(initial.flags);
  const [testText, setTestText] = useState<string>(initial.testText);
  const [activeTab, setActiveTab] = useState<InspectorTab>(initial.activeTab);
  const [isInspectorCollapsed, setIsInspectorCollapsed] = useState<boolean>(false);

  // Compare mode pattern & flags
  const [comparePattern, setComparePattern] = useState<string>('v?\\d+\\.\\d+\\.\\d+');
  const [compareFlags, setCompareFlags] = useState<string>('g');
  const [replacementText, setReplacementText] = useState<string>('[$&]');

  // UI Drawer & Modal States
  const [paletteOpen, setPaletteOpen] = useState<boolean>(false);
  const [libraryOpen, setLibraryOpen] = useState<boolean>(false);
  const [challengesOpen, setChallengesOpen] = useState<boolean>(false);
  const [cheatsheetOpen, setCheatsheetOpen] = useState<boolean>(false);
  const [shareCopied, setShareCopied] = useState<boolean>(false);

  // Hover synchronization state
  const [hoveredTokenId, setHoveredTokenId] = useState<string | null>(null);
  const [hoveredGroupIndex, setHoveredGroupIndex] = useState<number | null>(null);

  // Theme & Sound
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem('regexlab_theme') || 'dark';
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('regexlab_sound') !== 'false';
  });
  const [soundProfile, setSoundProfile] = useState<SoundProfile>(() => {
    return soundFX.getProfile();
  });

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('regexlab_theme', theme);
  }, [theme]);

  // Sync URL query params
  useEffect(() => {
    try {
      const params = new URLSearchParams();
      if (pattern !== DEFAULT_PATTERN) params.set('p', encodeURIComponent(pattern));
      if (flags !== DEFAULT_FLAGS) params.set('f', encodeURIComponent(flags));
      if (activeTab !== 'visualizer') params.set('tab', activeTab);
      
      const queryStr = params.toString();
      const newUrl = queryStr ? `${window.location.pathname}?${queryStr}` : window.location.pathname;
      window.history.replaceState(null, '', newUrl);
    } catch {
      // ignore
    }
  }, [pattern, flags, activeTab]);

  // Share URL handler
  const handleShare = useCallback(() => {
    soundFX.playCopy();
    const params = new URLSearchParams();
    params.set('p', encodeURIComponent(pattern));
    params.set('f', encodeURIComponent(flags));
    params.set('t', encodeURIComponent(testText));
    params.set('tab', activeTab);
    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

    navigator.clipboard.writeText(shareUrl);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  }, [pattern, flags, testText, activeTab]);

  // Global keyboard shortcuts: developer ergonomics
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputFocused =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable);

      // Ctrl+K or Cmd+K: Cheatsheet
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        soundFX.playLatch();
        setCheatsheetOpen((prev) => !prev);
      }
      // Ctrl+S or Cmd+S: Share link
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleShare();
      }
      // Ctrl+B or Cmd+B: Toggle Token Palette
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        soundFX.playLatch();
        setPaletteOpen((prev) => !prev);
      }
      // Ctrl+P or Cmd+P: Open Presets Library
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        soundFX.playLatch();
        setLibraryOpen((prev) => !prev);
      }
      // '?' (when not typing in an input): Open Cheatsheet
      else if (!isInputFocused && e.key === '?') {
        e.preventDefault();
        soundFX.playLatch();
        setCheatsheetOpen(true);
      }
      // Alt+1 through Alt+6: Switch bottom inspector tabs
      else if (e.altKey && ['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        e.preventDefault();
        const tabMap: Record<string, InspectorTab> = {
          '1': 'visualizer',
          '2': 'ast',
          '3': 'debugger',
          '4': 'performance',
          '5': 'compatibility',
          '6': 'explanation',
        };
        const targetTab = tabMap[e.key];
        if (targetTab) {
          soundFX.playTab();
          setActiveTab(targetTab);
          setIsInspectorCollapsed(false);
        }
      }
      // Esc: Close any open modal or drawer
      else if (e.key === 'Escape') {
        if (cheatsheetOpen || libraryOpen || challengesOpen || paletteOpen) {
          soundFX.playLatch();
          setCheatsheetOpen(false);
          setLibraryOpen(false);
          setChallengesOpen(false);
          setPaletteOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    pattern,
    flags,
    testText,
    activeTab,
    cheatsheetOpen,
    libraryOpen,
    challengesOpen,
    paletteOpen,
    handleShare,
  ]);

  // 2. UNIFIED ENGINE PARSE PASS: Single pure analysis computation
  const analysis = useMemo(() => {
    return analyzeRegex(pattern, flags, testText);
  }, [pattern, flags, testText]);

  // Apply sound toggle to soundFX
  useEffect(() => {
    soundFX.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Flag toggle handler
  const handleToggleFlag = useCallback((f: string) => {
    setFlags((prev) => (prev.includes(f) ? prev.replace(f, '') : prev + f));
  }, []);

  // Pattern change handler
  const handlePatternChange = useCallback((newPattern: string) => {
    setPattern(newPattern);
  }, []);

  // Token insertion from palette or cheatsheet
  const handleInsertToken = useCallback((tokenSnippet: string) => {
    soundFX.playKeypress();
    setPattern((prev) => prev + tokenSnippet);
  }, []);

  // 1-Click fix applicator from trace debugger
  const handleApplyFix = useCallback((fixedPattern: string, fixedFlags: string) => {
    soundFX.playSuccess();
    setPattern(fixedPattern);
    setFlags(fixedFlags);
  }, []);

  // Load from preset library
  const handleSelectPreset = useCallback((presetPattern: string, presetFlags: string, sampleText: string) => {
    soundFX.playSuccess();
    setPattern(presetPattern);
    setFlags(presetFlags || 'g');
    if (sampleText) setTestText(sampleText);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-background text-foreground overflow-hidden font-sans select-none">
      {/* 1. Top Bar */}
      <TopBar
        onOpenLibrary={() => setLibraryOpen(true)}
        onOpenChallenges={() => setChallengesOpen(true)}
        onOpenCheatsheet={() => setCheatsheetOpen(true)}
        onShare={handleShare}
        paletteOpen={paletteOpen}
        onTogglePalette={() => setPaletteOpen(!paletteOpen)}
        theme={theme}
        onSelectTheme={setTheme}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          setSoundEnabled(!soundEnabled);
        }}
        soundProfile={soundProfile}
        onSelectSoundProfile={(p) => {
          soundFX.setProfile(p);
          setSoundProfile(p);
        }}
        shareCopied={shareCopied}
      />

      {/* 2. Full-Width Pattern Input & Telemetry Strip */}
      <PatternInput
        pattern={pattern}
        flags={flags}
        onPatternChange={handlePatternChange}
        onToggleFlag={handleToggleFlag}
        analysis={analysis}
        hoveredTokenId={hoveredTokenId}
        onHoverToken={setHoveredTokenId}
        onSelectTab={(tab) => {
          setActiveTab(tab as InspectorTab);
          setIsInspectorCollapsed(false);
        }}
      />

      {/* 3. Middle Work Area: Token Palette Drawer + Middle Split */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Collapsible Left Drawer: Token Palette */}
        <TokenPalette
          isOpen={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          onInsertToken={handleInsertToken}
        />

        {/* Middle Split: Test Editor (Left) & Match Details / Replace / Compare (Right) */}
        <main className="flex-1 min-h-0 min-w-0 flex flex-col md:flex-row overflow-hidden">
          {/* Left Split: Test String Editor */}
          <div className="flex-1 min-h-0 min-w-0 h-full">
            <TestEditor
              testText={testText}
              onTestTextChange={setTestText}
              analysis={analysis}
              hoveredGroupIndex={hoveredGroupIndex}
              onHoverGroup={setHoveredGroupIndex}
              hoveredTokenId={hoveredTokenId}
            />
          </div>

          {/* Right Split: Match Inspector, Capture Groups, Replace & Compare */}
          <div className="w-full md:w-[380px] lg:w-[440px] border-t md:border-t-0 md:border-l border-border h-full flex flex-col shrink-0">
            <MatchTable
              analysis={analysis}
              testText={testText}
              hoveredGroupIndex={hoveredGroupIndex}
              onHoverGroup={setHoveredGroupIndex}
              replacementText={replacementText}
              onReplacementTextChange={setReplacementText}
              comparePattern={comparePattern}
              compareFlags={compareFlags}
              onComparePatternChange={setComparePattern}
              onCompareFlagsChange={setCompareFlags}
            />
          </div>
        </main>
      </div>

      {/* 4. Bottom Inspector Drawer */}
      <Inspector
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        analysis={analysis}
        testText={testText}
        pattern={pattern}
        flags={flags}
        hoveredTokenId={hoveredTokenId}
        onHoverToken={setHoveredTokenId}
        isCollapsed={isInspectorCollapsed}
        onToggleCollapse={() => setIsInspectorCollapsed(!isInspectorCollapsed)}
        onApplyFix={handleApplyFix}
      />

      {/* 5. Precision Developer Status Bar */}
      <footer className="h-6 px-3 bg-surface-subtle border-t border-border flex items-center justify-between text-[10px] font-mono text-foreground-dim select-none shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundFX.playLatch();
              setCheatsheetOpen(true);
            }}
            className="hover:text-foreground transition-colors flex items-center gap-1"
            title="Open syntax cheatsheet"
          >
            <kbd className="px-1 py-0.2 rounded bg-surface border border-border text-[9px]">Ctrl+K</kbd>
            <span>Cheatsheet</span>
          </button>

          <span className="text-border">·</span>

          <button
            onClick={handleShare}
            className="hover:text-foreground transition-colors flex items-center gap-1"
            title="Copy shareable link"
          >
            <kbd className="px-1 py-0.2 rounded bg-surface border border-border text-[9px]">Ctrl+S</kbd>
            <span>Share</span>
          </button>

          <span className="text-border">·</span>

          <button
            onClick={() => {
              soundFX.playLatch();
              setPaletteOpen(!paletteOpen);
            }}
            className="hover:text-foreground transition-colors flex items-center gap-1"
            title="Toggle token palette"
          >
            <kbd className="px-1 py-0.2 rounded bg-surface border border-border text-[9px]">Ctrl+B</kbd>
            <span>Tokens</span>
          </button>

          <span className="text-border hidden md:inline">·</span>

          <span className="hidden md:inline text-foreground-muted/60">
            <kbd className="px-1 py-0.2 rounded bg-surface border border-border text-[9px]">Alt+1..6</kbd> Switch Tabs
          </span>

          <span className="text-border hidden md:inline">·</span>

          <span className="hidden md:inline text-foreground-muted/60">
            <kbd className="px-1 py-0.2 rounded bg-surface border border-border text-[9px]">?</kbd> Shortcuts
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-foreground-muted/80">
            AST Engine: <strong className="text-foreground font-semibold">Recursive Descent</strong>
          </span>
          <span className="text-border">·</span>
          <span className="text-foreground-muted/80">
            Switch: <strong className="text-amber-400 font-semibold uppercase">{soundProfile}</strong>
          </span>
        </div>
      </footer>

      {/* Modals with spring entrance */}
      <CheatsheetModal
        isOpen={cheatsheetOpen}
        onClose={() => setCheatsheetOpen(false)}
        onInsertToken={handleInsertToken}
      />

      <LibraryModal
        isOpen={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onSelectPattern={handleSelectPreset}
      />

      <ChallengesModal
        isOpen={challengesOpen}
        onClose={() => setChallengesOpen(false)}
        onLoadIntoWorkspace={handleSelectPreset}
      />
    </div>
  );
};
