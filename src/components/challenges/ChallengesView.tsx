import React, { useMemo, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Lightbulb, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  Code2, 
  HelpCircle,
  Award,
  ChevronRight,
  Flame,
  Check
} from 'lucide-react';
import { useRegexStore } from '../../store/useRegexStore';
import { REGEX_CHALLENGES } from '../../data/challenges';
import { Challenge } from '../../types/regex';
import { DoubleBezelCard } from '../common/DoubleBezelCard';

const LEVELS = ['All', 'Novice', 'Apprentice', 'Adept', 'Master', 'Grandmaster'] as const;

export const ChallengesView: React.FC = () => {
  const { 
    activeChallengeId, 
    setActiveChallengeId, 
    completedChallenges, 
    markChallengeCompleted 
  } = useRegexStore();

  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [showHint, setShowHint] = useState<boolean>(false);

  // Active challenge lookup
  const activeChallenge = useMemo(() => {
    return REGEX_CHALLENGES.find((c) => c.id === activeChallengeId) || REGEX_CHALLENGES[0];
  }, [activeChallengeId]);

  // Current user pattern for active challenge
  const [userPattern, setUserPattern] = useState(activeChallenge.starterPattern);

  // Reset pattern when switching challenge
  useEffect(() => {
    setUserPattern(activeChallenge.starterPattern);
    setShowHint(false);
  }, [activeChallenge.id]);

  // Filtered challenges list
  const filteredChallenges = useMemo(() => {
    if (selectedLevel === 'All') return REGEX_CHALLENGES;
    return REGEX_CHALLENGES.filter((c) => c.level === selectedLevel);
  }, [selectedLevel]);

  // Test results evaluation
  const testResults = useMemo(() => {
    let rx: RegExp | null = null;
    let syntaxError = '';
    try {
      rx = new RegExp(userPattern);
    } catch (err: any) {
      syntaxError = err.message;
    }

    const mustMatchResults = activeChallenge.mustMatch.map((input) => {
      const passed = rx ? rx.test(input) : false;
      return { input, passed, expected: true };
    });

    const mustNotMatchResults = activeChallenge.mustNotMatch.map((input) => {
      const passed = rx ? !rx.test(input) : false;
      return { input, passed, expected: false };
    });

    const totalTests = mustMatchResults.length + mustNotMatchResults.length;
    const passedCount = 
      mustMatchResults.filter((r) => r.passed).length + 
      mustNotMatchResults.filter((r) => r.passed).length;
    
    const allPassed = totalTests > 0 && passedCount === totalTests && !syntaxError;

    return {
      syntaxError,
      mustMatchResults,
      mustNotMatchResults,
      totalTests,
      passedCount,
      allPassed,
    };
  }, [userPattern, activeChallenge]);

  // Fire confetti when challenge is solved
  useEffect(() => {
    if (testResults.allPassed) {
      markChallengeCompleted(activeChallenge.id);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#818cf8', '#34d399', '#f472b6'],
        });
      } catch {}
    }
  }, [testResults.allPassed, activeChallenge.id, markChallengeCompleted]);

  const handleNextChallenge = () => {
    const currentIndex = REGEX_CHALLENGES.findIndex((c) => c.id === activeChallenge.id);
    if (currentIndex >= 0 && currentIndex < REGEX_CHALLENGES.length - 1) {
      setActiveChallengeId(REGEX_CHALLENGES[currentIndex + 1].id);
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'Novice':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Apprentice':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Adept':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Master':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Grandmaster':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-muted text-foreground/70 border-border';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header Card */}
      <DoubleBezelCard innerClassName="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
              Gamified Mastery
            </span>
            <span className="text-xs text-foreground/60 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-primary" />
              Interactive Regex Challenges
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Regex Mastery Challenges
          </h1>
          <p className="text-xs text-foreground/70 mt-0.5">
            Test and sharpen your regular expression instincts across 11 progressive mastery levels from Novice to Grandmaster.
          </p>
        </div>

        {/* Global Progress Indicator */}
        <div className="flex items-center gap-3 bg-muted/60 p-2.5 rounded-xl border border-border">
          <Award className="w-5 h-5 text-primary" />
          <div className="text-xs font-mono">
            <div className="font-bold text-foreground">
              {completedChallenges.length} / {REGEX_CHALLENGES.length} Completed
            </div>
            <div className="text-[10px] text-foreground/60">
              {Math.round((completedChallenges.length / REGEX_CHALLENGES.length) * 100)}% Solved
            </div>
          </div>
        </div>
      </DoubleBezelCard>

      {/* Level Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {LEVELS.map((level) => (
          <button
            key={level}
            onClick={() => setSelectedLevel(level)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedLevel === level
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                : 'bg-card text-foreground/70 hover:bg-muted border border-border/60 hover:text-foreground'
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Challenge Selector List */}
        <div className="lg:col-span-4 space-y-2 max-h-[700px] overflow-y-auto pr-1">
          {filteredChallenges.map((challenge, idx) => {
            const isActive = challenge.id === activeChallenge.id;
            const isCompleted = completedChallenges.includes(challenge.id);
            const levelStyle = getLevelBadge(challenge.level);

            return (
              <DoubleBezelCard
                key={challenge.id}
                innerClassName={`p-3.5 cursor-pointer transition-all ${
                  isActive
                    ? 'border-primary ring-1 ring-primary/40 bg-primary/10'
                    : 'hover:border-border hover:bg-muted/50'
                }`}
              >
                <div 
                  onClick={() => setActiveChallengeId(challenge.id)}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${levelStyle}`}>
                      {challenge.level}
                    </span>
                    {isCompleted ? (
                      <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-foreground/40">
                        #{idx + 1}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-foreground">
                    {challenge.title}
                  </h4>
                  <p className="text-[11px] text-foreground/60 line-clamp-1">
                    {challenge.instructions}
                  </p>
                </div>
              </DoubleBezelCard>
            );
          })}
        </div>

        {/* Right Column: Challenge Workspace & Live Test Suite */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Challenge Header */}
          <DoubleBezelCard innerClassName="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider border ${getLevelBadge(activeChallenge.level)}`}>
                {activeChallenge.level} Tier
              </span>
              <button
                onClick={() => setUserPattern(activeChallenge.starterPattern)}
                className="text-xs text-foreground/60 hover:text-foreground flex items-center gap-1 transition-all"
                title="Reset to starter pattern"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Starter
              </button>
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-foreground">
                {activeChallenge.title}
              </h2>
              <p className="text-xs text-foreground/70 mt-1 leading-relaxed">
                {activeChallenge.instructions}
              </p>
            </div>

            {/* Hint Drawer */}
            <div className="pt-2 border-t border-border/60">
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-xs text-primary hover:underline font-semibold flex items-center gap-1.5"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                {showHint ? 'Hide Hint' : 'Need a hint?'}
              </button>

              {showHint && (
                <div className="mt-2 p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-foreground/80 leading-relaxed font-mono">
                  {activeChallenge.hint}
                </div>
              )}
            </div>
          </DoubleBezelCard>

          {/* Interactive Regex Solver Input */}
          <DoubleBezelCard innerClassName="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-primary" />
                Your Solution Pattern
              </span>
              <span className="text-xs font-mono text-foreground/50">
                Live Evaluated
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-foreground/40 font-bold">
                /
              </span>
              <input
                type="text"
                value={userPattern}
                onChange={(e) => setUserPattern(e.target.value)}
                placeholder="Write regex to satisfy all test cases..."
                className="w-full pl-7 pr-7 py-2.5 rounded-xl bg-background border border-border font-mono text-sm text-foreground font-bold focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-foreground/40 font-bold">
                /
              </span>
            </div>

            {testResults.syntaxError && (
              <p className="text-xs text-red-400 font-mono">
                Syntax Error: {testResults.syntaxError}
              </p>
            )}
          </DoubleBezelCard>

          {/* Test Suite Progress Card */}
          <DoubleBezelCard innerClassName="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Live Test Suite Results
              </h3>
              <span className="text-xs font-mono font-bold text-foreground">
                {testResults.passedCount} / {testResults.totalTests} Passing ({Math.round((testResults.passedCount / Math.max(1, testResults.totalTests)) * 100)}%)
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <div
                style={{ width: `${(testResults.passedCount / Math.max(1, testResults.totalTests)) * 100}%` }}
                className={`h-full transition-all duration-300 ${
                  testResults.allPassed ? 'bg-emerald-500' : 'bg-primary'
                }`}
              />
            </div>

            {/* Victory Banner */}
            {testResults.allPassed && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-400">Challenge Mastered!</h4>
                    <p className="text-[11px] text-foreground/70">
                      All test cases matched and rejected with surgical precision.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleNextChallenge}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:opacity-90 transition-all flex items-center gap-1.5 shrink-0"
                >
                  Next Challenge
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Test Case Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Must Match */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Must Match ({testResults.mustMatchResults.length})
                </span>
                <div className="space-y-1.5">
                  {testResults.mustMatchResults.map((r, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between transition-all ${
                        r.passed
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
                          : 'bg-red-500/5 border-red-500/20 text-red-300'
                      }`}
                    >
                      <span className="truncate max-w-[180px]">{r.input}</span>
                      {r.passed ? (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Must NOT Match */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  Must NOT Match ({testResults.mustNotMatchResults.length})
                </span>
                <div className="space-y-1.5">
                  {testResults.mustNotMatchResults.map((r, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between transition-all ${
                        r.passed
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
                          : 'bg-red-500/5 border-red-500/20 text-red-300'
                      }`}
                    >
                      <span className="truncate max-w-[180px]">{r.input}</span>
                      {r.passed ? (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DoubleBezelCard>
        </div>
      </div>
    </div>
  );
};
