import React, { useEffect, useState } from 'react';
import { useRegexStore } from './store/useRegexStore';
import { Header } from './components/common/Header';
import { ShareModal } from './components/common/ShareModal';
import { CheatSheetModal } from './components/common/CheatSheetModal';
import { LandingHero } from './components/landing/LandingHero';
import { PlaygroundView } from './components/playground/PlaygroundView';
import { EngineVisualizer } from './components/visualizer/EngineVisualizer';
import { VisualBuilder } from './components/builder/VisualBuilder';
import { AstVisualizer } from './components/ast/AstVisualizer';
import { RegexDebuggerView } from './components/debugger/RegexDebuggerView';
import { PerformanceView } from './components/performance/PerformanceView';
import { CompatibilityView } from './components/compatibility/CompatibilityView';
import { PatternLibraryView } from './components/library/PatternLibraryView';
import { PatternCompareView } from './components/compare/PatternCompareView';
import { ChallengesView } from './components/challenges/ChallengesView';
import { Sparkles, Terminal, Heart, Code2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const App: React.FC = () => {
  const { activeView, theme, loadFromShareUrl } = useRegexStore();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);

  // Initialize theme attribute & load URL state on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    loadFromShareUrl();
  }, [theme, loadFromShareUrl]);

  // Global hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCheatSheetOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsShareOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderActiveView = () => {
    switch (activeView) {
      case 'landing':
        return <LandingHero />;
      case 'playground':
        return (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <PlaygroundView />
          </div>
        );
      case 'visualizer':
        return <EngineVisualizer />;
      case 'builder':
        return <VisualBuilder />;
      case 'ast':
        return <AstVisualizer />;
      case 'debugger':
        return <RegexDebuggerView />;
      case 'performance':
        return <PerformanceView />;
      case 'compatibility':
        return <CompatibilityView />;
      case 'library':
        return <PatternLibraryView />;
      case 'compare':
        return <PatternCompareView />;
      case 'challenges':
        return <ChallengesView />;
      default:
        return (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <PlaygroundView />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Global Application Header */}
      <Header
        onOpenShare={() => setIsShareOpen(true)}
        onOpenCheatSheet={() => setIsCheatSheetOpen(true)}
      />

      {/* Main Content Area with Spring Transitions */}
      <main className="flex-1 relative overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Modern Minimal Footer */}
      <footer className="border-t border-border-subtle bg-surface/60 py-6 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-foreground/60">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-foreground flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              RegexLab
            </span>
            <span className="text-foreground/40">•</span>
            <span>The Visual Regular Expression Laboratory</span>
          </div>

          <div className="flex items-center gap-4 text-foreground/50">
            <span className="font-mono text-[11px] hidden md:inline">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">K</kbd> Quick Reference
            </span>
            <span>Zero-tracking • Runs 100% Client-Side</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
      <CheatSheetModal
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
      />
    </div>
  );
};

export default App;
