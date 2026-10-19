import { create } from 'zustand';
import { AppView, BuilderBlockItem, MatchAnalysis, RegexMatch, Theme } from '../types/regex';

interface RegexStoreState {
  // Main playground state
  pattern: string;
  flags: string;
  testText: string;
  replacementText: string;
  activeView: AppView;
  theme: Theme;
  soundEnabled: boolean;

  // Interactive hover sync
  hoveredTokenId: string | null;
  hoveredGroupIndex: number | null;
  selectedAstNodeId: string | null;

  // Comparison mode
  comparePattern: string;
  compareFlags: string;

  // Visual Builder blocks
  builderBlocks: BuilderBlockItem[];

  // Engine Visualizer state
  currentStepIndex: number;
  isPlaying: boolean;
  playbackSpeed: number;

  // Challenges state
  activeChallengeId: string;
  completedChallenges: string[];

  // Actions
  setPattern: (pattern: string) => void;
  setFlags: (flags: string) => void;
  toggleFlag: (flag: string) => void;
  setTestText: (text: string) => void;
  setReplacementText: (text: string) => void;
  setActiveView: (view: AppView) => void;
  setTheme: (theme: Theme) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setHoveredTokenId: (id: string | null) => void;
  setHoveredGroupIndex: (index: number | null) => void;
  setSelectedAstNodeId: (id: string | null) => void;
  
  // Builder actions
  setBuilderBlocks: (blocks: BuilderBlockItem[]) => void;
  addBuilderBlock: (block: BuilderBlockItem) => void;
  removeBuilderBlock: (id: string) => void;
  updateBuilderBlock: (id: string, updates: Partial<BuilderBlockItem>) => void;
  reorderBuilderBlocks: (fromIndex: number, toIndex: number) => void;

  // Visualizer actions
  setCurrentStepIndex: (index: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;

  // Compare actions
  setComparePattern: (pattern: string) => void;
  setCompareFlags: (flags: string) => void;

  // Challenge actions
  setActiveChallengeId: (id: string) => void;
  markChallengeCompleted: (id: string) => void;

  // Utility
  loadPattern: (pattern: string, flags?: string, sampleText?: string) => void;
  getMatches: () => MatchAnalysis;
  encodeShareUrl: () => string;
  loadFromShareUrl: () => boolean;
}

const DEFAULT_PATTERN = '([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)\\.([a-zA-Z]{2,})';
const DEFAULT_FLAGS = 'g';
const DEFAULT_TEST_TEXT = `Welcome to RegexLab!
Test your regex patterns in real time:

Primary: developer@regexlab.dev
Support: hello+feedback@skynet.ai
Personal: john.doe_99@gmail.com
Invalid sample: missing-at-sign.com
Another invalid: @domain-only.org

Feel free to edit this text or paste your own sample!`;

export const useRegexStore = create<RegexStoreState>((set, get) => ({
  pattern: DEFAULT_PATTERN,
  flags: DEFAULT_FLAGS,
  testText: DEFAULT_TEST_TEXT,
  replacementText: 'User: $1 | Domain: $2.$3',
  activeView: 'playground',
  theme: 'dark',
  soundEnabled: false,

  hoveredTokenId: null,
  hoveredGroupIndex: null,
  selectedAstNodeId: null,

  comparePattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
  compareFlags: 'g',

  builderBlocks: [
    { id: 'b-1', type: 'start_of_line', quantifier: 'one', greedy: true },
    { id: 'b-2', type: 'letters', quantifier: 'one_or_more', greedy: true, captured: true, groupName: 'username' },
    { id: 'b-3', type: 'custom_text', value: '@', quantifier: 'one', greedy: true },
    { id: 'b-4', type: 'letters', quantifier: 'one_or_more', greedy: true, captured: true, groupName: 'domain' },
    { id: 'b-5', type: 'custom_text', value: '.', quantifier: 'one', greedy: true },
    { id: 'b-6', type: 'letters', quantifier: 'range', min: 2, max: 6, greedy: true, captured: true, groupName: 'tld' },
    { id: 'b-7', type: 'end_of_line', quantifier: 'one', greedy: true },
  ],

  currentStepIndex: 0,
  isPlaying: false,
  playbackSpeed: 1,

  activeChallengeId: 'ch-1',
  completedChallenges: [],

  setPattern: (pattern) => set({ pattern, currentStepIndex: 0 }),
  setFlags: (flags) => set({ flags }),
  toggleFlag: (flag) => {
    const { flags } = get();
    if (flags.includes(flag)) {
      set({ flags: flags.replace(flag, '') });
    } else {
      set({ flags: flags + flag });
    }
  },
  setTestText: (testText) => set({ testText, currentStepIndex: 0 }),
  setReplacementText: (replacementText) => set({ replacementText }),
  setActiveView: (activeView) => set({ activeView }),
  setTheme: (theme) => {
    set({ theme });
    document.documentElement.setAttribute('data-theme', theme);
  },
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  setHoveredTokenId: (hoveredTokenId) => set({ hoveredTokenId }),
  setHoveredGroupIndex: (hoveredGroupIndex) => set({ hoveredGroupIndex }),
  setSelectedAstNodeId: (selectedAstNodeId) => set({ selectedAstNodeId }),

  setBuilderBlocks: (builderBlocks) => set({ builderBlocks }),
  addBuilderBlock: (block) => set((s) => ({ builderBlocks: [...s.builderBlocks, block] })),
  removeBuilderBlock: (id) => set((s) => ({ builderBlocks: s.builderBlocks.filter((b) => b.id !== id) })),
  updateBuilderBlock: (id, updates) => set((s) => ({
    builderBlocks: s.builderBlocks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
  })),
  reorderBuilderBlocks: (fromIndex, toIndex) => set((s) => {
    const list = [...s.builderBlocks];
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);
    return { builderBlocks: list };
  }),

  setCurrentStepIndex: (currentStepIndex) => set({ currentStepIndex }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),

  setComparePattern: (comparePattern) => set({ comparePattern }),
  setCompareFlags: (compareFlags) => set({ compareFlags }),

  setActiveChallengeId: (activeChallengeId) => set({ activeChallengeId }),
  markChallengeCompleted: (id) => set((s) => ({
    completedChallenges: s.completedChallenges.includes(id) ? s.completedChallenges : [...s.completedChallenges, id],
  })),

  loadPattern: (pattern, flags = 'gm', sampleText) => {
    set({
      pattern,
      flags,
      ...(sampleText ? { testText: sampleText } : {}),
      currentStepIndex: 0,
    });
  },

  getMatches: (): MatchAnalysis => {
    const { pattern, flags, testText } = get();
    if (!pattern) {
      return { matches: [], count: 0, executionTimeMs: 0, isValid: true };
    }

    const t0 = performance.now();
    try {
      const rx = new RegExp(pattern, flags);
      const matches: RegexMatch[] = [];

      if (!flags.includes('g')) {
        const single = rx.exec(testText);
        if (single) {
          const groups = [];
          if (single.length > 1) {
            for (let g = 1; g < single.length; g++) {
              groups.push({
                index: g,
                text: single[g] ?? '',
                start: single.index, // approx
                end: single.index + (single[g]?.length ?? 0),
              });
            }
          }
          matches.push({
            index: 0,
            text: single[0],
            start: single.index,
            end: single.index + single[0].length,
            groups,
          });
        }
      } else {
        let match: RegExpExecArray | null;
        let matchIdx = 0;
        let loopLimit = 2000;

        while ((match = rx.exec(testText)) !== null && loopLimit-- > 0) {
          const groups = [];
          if (match.length > 1) {
            for (let g = 1; g < match.length; g++) {
              groups.push({
                index: g,
                text: match[g] ?? '',
                start: match.index,
                end: match.index + (match[g]?.length ?? 0),
              });
            }
          }
          matches.push({
            index: matchIdx++,
            text: match[0],
            start: match.index,
            end: match.index + match[0].length,
            groups,
          });

          // Prevent infinite loop on zero-width match
          if (match.index === rx.lastIndex) {
            rx.lastIndex++;
          }
        }
      }

      const elapsed = Math.round((performance.now() - t0) * 100) / 100;
      return {
        matches,
        count: matches.length,
        executionTimeMs: elapsed,
        isValid: true,
      };
    } catch (err: any) {
      return {
        matches: [],
        count: 0,
        executionTimeMs: 0,
        error: err.message,
        isValid: false,
      };
    }
  },

  encodeShareUrl: () => {
    const { pattern, flags, testText } = get();
    try {
      const payload = JSON.stringify({ p: pattern, f: flags, t: testText });
      const encoded = btoa(encodeURIComponent(payload));
      return `${window.location.origin}${window.location.pathname}#r=${encoded}`;
    } catch {
      return window.location.href;
    }
  },

  loadFromShareUrl: () => {
    try {
      const hash = window.location.hash;
      if (hash.startsWith('#r=')) {
        const raw = decodeURIComponent(atob(hash.slice(3)));
        const data = JSON.parse(raw);
        if (data && typeof data.p === 'string') {
          set({
            pattern: data.p,
            flags: data.f ?? 'g',
            testText: data.t ?? DEFAULT_TEST_TEXT,
          });
          return true;
        }
      }
    } catch {}
    return false;
  },
}));
