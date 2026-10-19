import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Play, 
  Activity, 
  Layers, 
  BookOpen, 
  ShieldCheck, 
  Globe, 
  Cpu, 
  CheckCircle2, 
  Terminal,
  Trophy,
  Zap,
  Code2
} from 'lucide-react';
import { useRegexStore } from '../../store/useRegexStore';
import { translateRegex, ExplanationBlock } from '../../parser/translator';
import { DoubleBezelCard } from '../common/DoubleBezelCard';
import { Regex3DUniverse } from '../common/Regex3DUniverse';

export const LandingHero: React.FC = () => {
  const { setActiveView, loadPattern } = useRegexStore();
  const [heroPattern, setHeroPattern] = useState('^([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)\\.([a-zA-Z]{2,})$');
  const [heroText, setHeroText] = useState('contact@regexlab.dev\ninvalid-email.org\nhello.world@sub.domain.io');

  // Hero live translation
  const translation = translateRegex(heroPattern);

  // Hero live match check
  const matchResult = (() => {
    try {
      const rx = new RegExp(heroPattern, 'gm');
      const matches = Array.from(heroText.matchAll(rx));
      return { count: matches.length, valid: true };
    } catch {
      return { count: 0, valid: false };
    }
  })();

  const handleLaunchWithHero = () => {
    loadPattern(heroPattern, 'gm', heroText);
    setActiveView('playground');
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 py-12 space-y-20 overflow-hidden">
      {/* 3D WebGL Holographic Particle Universe Background */}
      <div className="absolute inset-x-0 top-0 h-[600px] overflow-hidden pointer-events-none opacity-40 z-0">
        <Regex3DUniverse particleCount={850} interactive={true} />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 text-center space-y-6 max-w-4xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>The Visual Regular Expression Laboratory</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
          See regex work, <span className="text-primary">letter by letter.</span>
        </h1>

        <p className="text-base sm:text-lg text-foreground-muted max-w-2xl mx-auto leading-relaxed">
          Regular expressions look like secret code when you start learning programming. 
          RegexLab is a visual playground where you can watch patterns check each letter one by one, 
          read plain English explanations, and build regex using simple blocks without fear.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setActiveView('playground')}
            className="px-6 py-3 rounded-xl bg-primary text-primary-fg font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-current" />
            Open Playground
          </button>

          <button
            onClick={() => setActiveView('visualizer')}
            className="px-6 py-3 rounded-xl bg-surface-elevated hover:bg-surface text-foreground border border-border font-semibold text-sm transition-all flex items-center gap-2"
          >
            <Activity className="w-4 h-4 text-primary" />
            Step-by-Step Matcher
          </button>

          <button
            onClick={() => setActiveView('challenges')}
            className="px-6 py-3 rounded-xl bg-surface-elevated hover:bg-surface text-foreground border border-border font-semibold text-sm transition-all flex items-center gap-2"
          >
            <Trophy className="w-4 h-4 text-primary" />
            Practice Puzzles
          </button>
        </div>
      </div>

      {/* Live Interactive Hero Sandbox */}
      <div className="max-w-5xl mx-auto">
        <DoubleBezelCard innerClassName="p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono font-semibold text-foreground/60 ml-2">
                Live Interactive Laboratory Demo
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {matchResult.count} Matches Found
              </span>
              <button
                onClick={handleLaunchWithHero}
                className="px-3 py-1 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 text-xs font-semibold flex items-center gap-1 transition-all"
              >
                Inspect in Studio <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Interactive Pattern Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-foreground/60 font-medium">
              <span>Interactive Regex Input (try editing!):</span>
              <span className="font-mono text-[11px]">Flags: gm</span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-foreground/40 font-bold">
                /
              </span>
              <input
                type="text"
                value={heroPattern}
                onChange={(e) => setHeroPattern(e.target.value)}
                className="w-full pl-7 pr-7 py-3 rounded-xl bg-background border border-border font-mono text-sm text-foreground font-bold focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-foreground/40 font-bold">
                /gm
              </span>
            </div>
          </div>

          {/* Live Translation Cards Grid */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground/50 block">
              Live English Translation:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {translation.slice(0, 4).map((block: ExplanationBlock, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-card border border-border/70 text-xs space-y-1"
                >
                  <div className="font-bold text-primary flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {block.title}
                  </div>
                  <p className="text-foreground/70 text-[11px] leading-snug line-clamp-2">
                    {block.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Text Area */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground/50 block">
              Test Text Subject:
            </span>
            <textarea
              value={heroText}
              onChange={(e) => setHeroText(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl bg-background border border-border font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
            />
          </div>
        </DoubleBezelCard>
      </div>

      {/* Feature Value Matrix */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Made for beginners, loved by everyone.
          </h2>
          <p className="text-xs sm:text-sm text-foreground-muted max-w-xl mx-auto">
            Everything you need to understand, build, and test regular expressions without getting overwhelmed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <DoubleBezelCard innerClassName="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Step-by-Step Matcher</h3>
            <p className="text-xs text-foreground-muted leading-relaxed">
              Watch regex read your text letter by letter. See the cursor move forward when it matches, and watch it back up and try another route when it fails.
            </p>
          </DoubleBezelCard>

          {/* Card 2 */}
          <DoubleBezelCard innerClassName="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Plain English Helper</h3>
            <p className="text-xs text-foreground-muted leading-relaxed">
              Never stare blindly at weird brackets and carets again. Translates cryptic regex characters into plain, simple English sentences.
            </p>
          </DoubleBezelCard>

          {/* Card 3 */}
          <DoubleBezelCard innerClassName="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">No-Code Builder</h3>
            <p className="text-xs text-foreground-muted leading-relaxed">
              Assemble clean regex patterns by clicking simple visual blocks for letters, numbers, and words &mdash; no syntax memorization required.
            </p>
          </DoubleBezelCard>

          {/* Card 4 */}
          <DoubleBezelCard innerClassName="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Speed & Loop Check</h3>
            <p className="text-xs text-foreground-muted leading-relaxed">
              Check if your regex could freeze your browser. We run tests with longer and longer strings to see if your pattern gets stuck in slow loops.
            </p>
          </DoubleBezelCard>
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <DoubleBezelCard innerClassName="p-8 md:p-12 text-center space-y-4 bg-gradient-to-b from-card to-background">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Ready to experiment without fear?
        </h2>
        <p className="text-xs sm:text-sm text-foreground/70 max-w-md mx-auto">
          Open the laboratory and experience regular expressions like never before. Zero install, completely free, and fully private in your browser.
        </p>
        <div className="pt-2">
          <button
            onClick={() => setActiveView('playground')}
            className="px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/25 hover:scale-105 active:scale-95"
          >
            Launch RegexLab Playground
          </button>
        </div>
      </DoubleBezelCard>
    </div>
  );
};
