import React, { useEffect, useState } from 'react';
import { useRegexStore } from './store/useRegexStore';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
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
          <div className="max-w-[1120px] mx-auto px-6 sm:px-10 pt-4 pb-24">
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
          <div className="max-w-[1120px] mx-auto px-6 sm:px-10 pt-4 pb-24">
            <PlaygroundView />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-foreground">
      <Sidebar onOpenCheatSheet={() => setIsCheatSheetOpen(true)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header onOpenShare={() => setIsShareOpen(true)} onOpenCheatSheet={() => setIsCheatSheetOpen(true)} />
        <main className="flex-1 relative overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={activeView} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

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
