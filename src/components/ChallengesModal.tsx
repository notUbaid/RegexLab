import React, { useState, useMemo, useEffect } from 'react';
import { X, Trophy, Check, Lightbulb, Play, ArrowRight, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { REGEX_CHALLENGES } from '../data/challenges';
import { Challenge } from '../types/regex';

interface ChallengesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadIntoWorkspace: (pattern: string, flags: string, testText: string) => void;
}

const LEVELS = ['All', 'Novice', 'Apprentice', 'Adept', 'Master', 'Grandmaster'];

export const ChallengesModal: React.FC<ChallengesModalProps> = ({
  isOpen,
  onClose,
  onLoadIntoWorkspace,
}) => {
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [activeChallengeId, setActiveChallengeId] = useState<string>(REGEX_CHALLENGES[0].id);
  const [userPattern, setUserPattern] = useState<string>(REGEX_CHALLENGES[0].starterPattern);
  const [showHint, setShowHint] = useState(false);
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('regexlab_completed_challenges');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const activeChallenge = useMemo(() => {
    return REGEX_CHALLENGES.find((c) => c.id === activeChallengeId) || REGEX_CHALLENGES[0];
  }, [activeChallengeId]);

  // Sync user pattern when active challenge changes
  useEffect(() => {
    setUserPattern(activeChallenge.starterPattern);
    setShowHint(false);
  }, [activeChallenge]);

  const filteredChallenges = useMemo(() => {
    if (selectedLevel === 'All') return REGEX_CHALLENGES;
    return REGEX_CHALLENGES.filter((c) => c.level === selectedLevel);
  }, [selectedLevel]);

  // Test evaluator
  const testResults = useMemo(() => {
    let rx: RegExp | null = null;
    let syntaxError = '';

    try {
      rx = new RegExp(userPattern);
    } catch (e) {
      syntaxError = (e as Error).message;
    }

    const matchChecks = activeChallenge.mustMatch.map((input) => {
      if (!rx) return { input, passed: false, expected: true };
      return { input, passed: rx.test(input), expected: true };
    });

    const notMatchChecks = activeChallenge.mustNotMatch.map((input) => {
      if (!rx) return { input, passed: false, expected: false };
      return { input, passed: !rx.test(input), expected: false };
    });

    const allPassed =
      !syntaxError &&
      matchChecks.every((c) => c.passed) &&
      notMatchChecks.every((c) => c.passed);

    return {
      syntaxError,
      matchChecks,
      notMatchChecks,
      allPassed,
    };
  }, [userPattern, activeChallenge]);

  // Handle completion trigger
  useEffect(() => {
    if (testResults.allPassed && !completedIds.has(activeChallenge.id)) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
      const next = new Set(completedIds).add(activeChallenge.id);
      setCompletedIds(next);
      try {
        localStorage.setItem('regexlab_completed_challenges', JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
    }
  }, [testResults.allPassed, activeChallenge.id, completedIds]);

  const handleLoadWorkspace = () => {
    const combinedTest = [
      ...activeChallenge.mustMatch,
      ...activeChallenge.mustNotMatch,
    ].join('\n');
    onLoadIntoWorkspace(userPattern, '', combinedTest);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] bg-surface border border-border rounded-lg flex flex-col shadow-2xl overflow-hidden select-none font-mono">
        {/* Header */}
        <div className="h-11 px-4 border-b border-border bg-surface-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-xs text-foreground tracking-tight">
              Regex Practice Challenges ({completedIds.size}/{REGEX_CHALLENGES.length} Completed)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-foreground-dim hover:text-foreground hover:bg-surface-elevated transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Level Filters */}
        <div className="px-4 py-2 border-b border-border bg-surface flex items-center gap-1.5 overflow-x-auto text-xs">
          {LEVELS.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-2 py-0.5 rounded text-[11px] whitespace-nowrap transition-colors ${
                selectedLevel === lvl
                  ? 'bg-foreground text-background font-semibold'
                  : 'bg-surface-subtle text-foreground-muted hover:text-foreground'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Main Content Split */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)] overflow-hidden text-xs">
          {/* Challenge List Sidebar */}
          <div className="border-r border-border bg-surface-subtle overflow-y-auto p-2 space-y-1">
            {filteredChallenges.map((c) => {
              const isSelected = c.id === activeChallenge.id;
              const isDone = completedIds.has(c.id);

              return (
                <button
                  key={c.id}
                  onClick={() => setActiveChallengeId(c.id)}
                  className={`w-full text-left p-2 rounded border transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-surface-elevated border-border text-foreground font-semibold'
                      : 'border-transparent text-foreground-muted hover:text-foreground hover:bg-surface'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-[11px] truncate">{c.title}</div>
                    <div className="text-[9px] text-foreground-dim">{c.level}</div>
                  </div>
                  {isDone && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Active Challenge Solver Pane */}
          <div className="flex-1 min-h-0 flex flex-col p-4 overflow-y-auto space-y-4 bg-surface">
            {/* Title & Instructions */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  {activeChallenge.title}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-surface-subtle border border-border text-foreground-dim uppercase">
                  {activeChallenge.level}
                </span>
              </div>
              <p className="text-xs text-foreground-muted leading-relaxed">
                {activeChallenge.instructions}
              </p>
            </div>

            {/* Hint Accordion */}
            <div>
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-1.5 text-[11px] text-amber-400/90 hover:text-amber-300 transition-colors"
              >
                <Lightbulb className="w-3 h-3" />
                <span>{showHint ? 'Hide Hint' : 'Need a hint?'}</span>
              </button>
              {showHint && (
                <div className="mt-1.5 p-2 rounded bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 leading-snug">
                  {activeChallenge.hint}
                </div>
              )}
            </div>

            {/* Pattern Input Box */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground-muted">
                Your Pattern
              </label>
              <div className="flex items-center gap-2 p-2 rounded bg-surface-subtle border border-border focus-within:border-foreground/30">
                <span className="text-foreground-dim text-sm select-none">/</span>
                <input
                  type="text"
                  value={userPattern}
                  onChange={(e) => setUserPattern(e.target.value)}
                  placeholder="Type regular expression..."
                  className="flex-1 bg-transparent text-xs text-foreground font-mono focus:outline-none"
                />
                <span className="text-foreground-dim text-sm select-none">/</span>
                <button
                  onClick={() => setUserPattern(activeChallenge.starterPattern)}
                  className="p-1 text-foreground-dim hover:text-foreground"
                  title="Reset to starter pattern"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
              {testResults.syntaxError && (
                <div className="text-[11px] text-rose-400">
                  {testResults.syntaxError}
                </div>
              )}
            </div>

            {/* Test Cases Table */}
            <div className="space-y-2 pt-2 border-t border-border">
              <span className="text-[11px] font-semibold text-foreground-muted">
                Validation Test Cases
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Must Match */}
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-foreground-dim">
                    Must Match
                  </div>
                  <div className="space-y-1">
                    {testResults.matchChecks.map((tc, idx) => (
                      <div
                        key={idx}
                        className={`p-1.5 rounded border text-[11px] flex items-center justify-between ${
                          tc.passed
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-surface-subtle border-border text-foreground-muted'
                        }`}
                      >
                        <code className="truncate max-w-[150px]">{tc.input}</code>
                        <span className="text-[10px] font-semibold">
                          {tc.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Must NOT Match */}
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-foreground-dim">
                    Must NOT Match
                  </div>
                  <div className="space-y-1">
                    {testResults.notMatchChecks.map((tc, idx) => (
                      <div
                        key={idx}
                        className={`p-1.5 rounded border text-[11px] flex items-center justify-between ${
                          tc.passed
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        }`}
                      >
                        <code className="truncate max-w-[150px]">{tc.input}</code>
                        <span className="text-[10px] font-semibold">
                          {tc.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <div>
                {testResults.allPassed ? (
                  <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> All test cases passed!
                  </span>
                ) : (
                  <span className="text-foreground-dim text-[11px]">
                    Fix pattern to satisfy all criteria.
                  </span>
                )}
              </div>

              <button
                onClick={handleLoadWorkspace}
                className="px-3 py-1.5 rounded bg-foreground text-background font-semibold text-xs flex items-center gap-1.5 hover:bg-foreground/90 transition-colors"
              >
                <span>Load into Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
