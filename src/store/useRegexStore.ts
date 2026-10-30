/**
 * ============================================================================
 * RegexLab - Central Application State Store (Zustand)
 * ============================================================================
 * 
 * Welcome! In modern React applications, components often need to share data.
 * For example:
 * - When the user edits the regex in the Playground, the Engine Visualizer,
 *   AST Tree, and ReDoS Analyzer all need to know about the new pattern!
 * 
 * WHAT IS ZUSTAND?
 * Zustand is a lightweight, high-performance state management library.
 * Instead of passing data through dozens of nested component props ("prop drilling"),
 * any component in RegexLab can simply call:
 * 
 * ```typescript
 * const pattern = useRegexStore(state => state.pattern);
 * const setPattern = useRegexStore(state => state.setPattern);
 * ```
 * 
 * IMMUTABILITY:
 * Following professional coding standards, we NEVER mutate state directly
 * (e.g. `state.builderBlocks.push(...)`). We always return new copies using
 * spread operators `[...state.builderBlocks, newBlock]` to ensure React
 * re-renders cleanly and reliably!
 */

import { create } from 'zustand';
import {
  AppView,
  BuilderBlockItem,
  CaptureGroup,
  MatchAnalysis,
  RegexMatch,
  Theme,
} from '../types/regex';

// ============================================================================
// STORE STATE & ACTIONS INTERFACE
// ============================================================================

export interface RegexStoreState {
  // --------------------------------------------------------------------------
  // 1. Core Playground State
  // --------------------------------------------------------------------------
  /** Current regex pattern string (e.g., `([a-z]+)@([a-z]+)`) */
  pattern: string;

  /** Active flags (e.g., 'g' for global, 'i' for case-insensitive) */
  flags: string;

  /** Sample text being matched against */
  testText: string;

  /** Template string used for regex replace/substitution preview */
  replacementText: string;

  /** The currently active screen or tool */
  activeView: AppView;

  /** Active color theme */
  theme: Theme;

  /** Whether the Web Audio tactile sound effects are turned on */
  soundEnabled: boolean;

  // --------------------------------------------------------------------------
  // 2. Interactive Hover Synchronization
  // --------------------------------------------------------------------------
  /** Token currently hovered in the editor or human translator */
  hoveredTokenId: string | null;

  /** Capture group index currently hovered in the legend or text overlay */
  hoveredGroupIndex: number | null;

  /** Node currently selected in the AST Explorer */
  selectedAstNodeId: string | null;

  // --------------------------------------------------------------------------
  // 3. Comparison Mode State
  // --------------------------------------------------------------------------
  /** Secondary regex pattern used in the Smart Pattern Compare tool */
  comparePattern: string;

  /** Secondary regex flags */
  compareFlags: string;

  // --------------------------------------------------------------------------
  // 4. Visual Builder Blocks
  // --------------------------------------------------------------------------
  /** Array of visual Lego-style blocks in the no-code builder */
  builderBlocks: BuilderBlockItem[];

  // --------------------------------------------------------------------------
  // 5. Engine Visualizer State
  // --------------------------------------------------------------------------
  /** Active frame index in the step-by-step debugger playback */
  currentStepIndex: number;

  /** Is the visualizer currently auto-playing through steps? */
  isPlaying: boolean;

  /** Playback speed multiplier (1x, 2x, 0.5x, etc.) */
  playbackSpeed: number;

  // --------------------------------------------------------------------------
  // 6. Interactive Challenges State
  // --------------------------------------------------------------------------
  /** The currently selected challenge puzzle ID */
  activeChallengeId: string;

  /** IDs of all challenge levels completed by the user */
  completedChallenges: string[];

  // --------------------------------------------------------------------------
  // 7. Store Actions
  // --------------------------------------------------------------------------
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

  // Utility functions
  loadPattern: (pattern: string, flags?: string, sampleText?: string) => void;
  getMatches: () => MatchAnalysis;
  encodeShareUrl: () => string;
  loadFromShareUrl: () => boolean;
}

// ============================================================================
// DEFAULT INITIAL STATE VALUES
// ============================================================================

/** Default email matching regular expression */
const INITIAL_DEFAULT_PATTERN = '([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)\\.([a-zA-Z]{2,})';

/** Default flags: 'g' for global matching */
const INITIAL_DEFAULT_FLAGS = 'g';

/** Default test text populated on first visit */
const INITIAL_DEFAULT_TEST_TEXT = `Welcome to RegexLab!
Test your regex patterns in real time:

Primary: developer@regexlab.dev
Support: hello+feedback@skynet.ai
Personal: john.doe_99@gmail.com
Invalid sample: missing-at-sign.com
Another invalid: @domain-only.org

Feel free to edit this text or paste your own sample!`;

/** Safety limit for regex execution loops to avoid browser freezing on zero-width matches */
const MAXIMUM_MATCH_LOOP_ITERATIONS = 2000;

// ============================================================================
// ZUSTAND STORE CREATION
// ============================================================================

export const useRegexStore = create<RegexStoreState>((set, get) => ({
  // Core initial values
  pattern: INITIAL_DEFAULT_PATTERN,
  flags: INITIAL_DEFAULT_FLAGS,
  testText: INITIAL_DEFAULT_TEST_TEXT,
  replacementText: 'User: $1 | Domain: $2.$3',
  activeView: 'landing',
  theme: 'dark',
  soundEnabled: false,

  hoveredTokenId: null,
  hoveredGroupIndex: null,
  selectedAstNodeId: null,

  comparePattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
  compareFlags: 'g',

  builderBlocks: [
    { id: 'b-1', type: 'start_of_line', quantifier: 'one', greedy: true },
    {
      id: 'b-2',
      type: 'letters',
      quantifier: 'one_or_more',
      greedy: true,
      captured: true,
      groupName: 'username',
    },
    { id: 'b-3', type: 'custom_text', value: '@', quantifier: 'one', greedy: true },
    {
      id: 'b-4',
      type: 'letters',
      quantifier: 'one_or_more',
      greedy: true,
      captured: true,
      groupName: 'domain',
    },
    { id: 'b-5', type: 'custom_text', value: '.', quantifier: 'one', greedy: true },
    {
      id: 'b-6',
      type: 'letters',
      quantifier: 'range',
      min: 2,
      max: 6,
      greedy: true,
      captured: true,
      groupName: 'tld',
    },
    { id: 'b-7', type: 'end_of_line', quantifier: 'one', greedy: true },
  ],

  currentStepIndex: 0,
  isPlaying: false,
  playbackSpeed: 1,

  activeChallengeId: 'ch-1',
  completedChallenges: [],

  // --------------------------------------------------------------------------
  // Core Actions
  // --------------------------------------------------------------------------
  setPattern: (newPattern: string) =>
    set({ pattern: newPattern, currentStepIndex: 0 }),

  setFlags: (newFlags: string) =>
    set({ flags: newFlags }),

  toggleFlag: (flagToToggle: string) => {
    const { flags } = get();
    if (flags.includes(flagToToggle)) {
      set({ flags: flags.replace(flagToToggle, '') });
    } else {
      set({ flags: flags + flagToToggle });
    }
  },

  setTestText: (newTestText: string) =>
    set({ testText: newTestText, currentStepIndex: 0 }),

  setReplacementText: (newReplacementText: string) =>
    set({ replacementText: newReplacementText }),

  setActiveView: (newView: AppView) =>
    set({ activeView: newView }),

  setTheme: (newTheme: Theme) => {
    set({ theme: newTheme });
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  },

  setSoundEnabled: (soundEnabled: boolean) =>
    set({ soundEnabled }),

  setHoveredTokenId: (tokenId: string | null) =>
    set({ hoveredTokenId: tokenId }),

  setHoveredGroupIndex: (groupIndex: number | null) =>
    set({ hoveredGroupIndex: groupIndex }),

  setSelectedAstNodeId: (nodeId: string | null) =>
    set({ selectedAstNodeId: nodeId }),

  // --------------------------------------------------------------------------
  // Visual Builder Actions (Immutability Pattern)
  // --------------------------------------------------------------------------
  setBuilderBlocks: (builderBlocks: BuilderBlockItem[]) =>
    set({ builderBlocks }),

  addBuilderBlock: (newBlock: BuilderBlockItem) =>
    set((state) => ({ builderBlocks: [...state.builderBlocks, newBlock] })),

  removeBuilderBlock: (blockIdToRemove: string) =>
    set((state) => ({
      builderBlocks: state.builderBlocks.filter((block) => block.id !== blockIdToRemove),
    })),

  updateBuilderBlock: (blockId: string, updates: Partial<BuilderBlockItem>) =>
    set((state) => ({
      builderBlocks: state.builderBlocks.map((block) =>
        block.id === blockId ? { ...block, ...updates } : block
      ),
    })),

  reorderBuilderBlocks: (fromIndex: number, toIndex: number) =>
    set((state) => {
      const clonedList = [...state.builderBlocks];
      const [movedItem] = clonedList.splice(fromIndex, 1);
      clonedList.splice(toIndex, 0, movedItem);
      return { builderBlocks: clonedList };
    }),

  // --------------------------------------------------------------------------
  // Engine Visualizer Actions
  // --------------------------------------------------------------------------
  setCurrentStepIndex: (stepIndex: number) =>
    set({ currentStepIndex: stepIndex }),

  setIsPlaying: (isPlaying: boolean) =>
    set({ isPlaying }),

  setPlaybackSpeed: (speedMultiplier: number) =>
    set({ playbackSpeed: speedMultiplier }),

  // --------------------------------------------------------------------------
  // Pattern Compare Actions
  // --------------------------------------------------------------------------
  setComparePattern: (comparePattern: string) =>
    set({ comparePattern }),

  setCompareFlags: (compareFlags: string) =>
    set({ compareFlags }),

  // --------------------------------------------------------------------------
  // Challenge Actions
  // --------------------------------------------------------------------------
  setActiveChallengeId: (challengeId: string) =>
    set({ activeChallengeId: challengeId }),

  markChallengeCompleted: (challengeId: string) =>
    set((state) => ({
      completedChallenges: state.completedChallenges.includes(challengeId)
        ? state.completedChallenges
        : [...state.completedChallenges, challengeId],
    })),

  // --------------------------------------------------------------------------
  // Utility: Load Prebuilt Pattern from Library
  // --------------------------------------------------------------------------
  loadPattern: (newPattern: string, newFlags: string = 'gm', sampleText?: string) => {
    set({
      pattern: newPattern,
      flags: newFlags,
      ...(sampleText ? { testText: sampleText } : {}),
      currentStepIndex: 0,
    });
  },

  // --------------------------------------------------------------------------
  // Utility: Execute Regex Matches with High-Resolution Timing
  // --------------------------------------------------------------------------
  getMatches: (): MatchAnalysis => {
    const { pattern, flags, testText } = get();

    if (!pattern) {
      return { matches: [], count: 0, executionTimeMs: 0, isValid: true };
    }

    const startTime = performance.now();

    try {
      const compiledRegex = new RegExp(pattern, flags);
      const discoveredMatches: RegexMatch[] = [];

      // Non-global regex: matches at most once
      if (!flags.includes('g')) {
        const singleMatch = compiledRegex.exec(testText);

        if (singleMatch) {
          const captureGroups: CaptureGroup[] = [];

          if (singleMatch.length > 1) {
            for (let g = 1; g < singleMatch.length; g++) {
              captureGroups.push({
                index: g,
                text: singleMatch[g] ?? '',
                start: singleMatch.index,
                end: singleMatch.index + (singleMatch[g]?.length ?? 0),
              });
            }
          }

          discoveredMatches.push({
            index: 0,
            text: singleMatch[0],
            start: singleMatch.index,
            end: singleMatch.index + singleMatch[0].length,
            groups: captureGroups,
          });
        }
      }
      // Global regex: loop to find all occurrences
      else {
        let regexExecResult: RegExpExecArray | null;
        let matchCounter = 0;
        let loopSafetyGuard = MAXIMUM_MATCH_LOOP_ITERATIONS;

        while (
          (regexExecResult = compiledRegex.exec(testText)) !== null &&
          loopSafetyGuard-- > 0
        ) {
          const captureGroups: CaptureGroup[] = [];

          if (regexExecResult.length > 1) {
            for (let g = 1; g < regexExecResult.length; g++) {
              captureGroups.push({
                index: g,
                text: regexExecResult[g] ?? '',
                start: regexExecResult.index,
                end: regexExecResult.index + (regexExecResult[g]?.length ?? 0),
              });
            }
          }

          discoveredMatches.push({
            index: matchCounter++,
            text: regexExecResult[0],
            start: regexExecResult.index,
            end: regexExecResult.index + regexExecResult[0].length,
            groups: captureGroups,
          });

          // Prevent infinite loops on zero-width assertions like `^` or `(?=)`
          if (regexExecResult.index === compiledRegex.lastIndex) {
            compiledRegex.lastIndex++;
          }
        }
      }

      const elapsedMs = Math.round((performance.now() - startTime) * 100) / 100;

      return {
        matches: discoveredMatches,
        count: discoveredMatches.length,
        executionTimeMs: elapsedMs,
        isValid: true,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      return {
        matches: [],
        count: 0,
        executionTimeMs: 0,
        error: errorMessage,
        isValid: false,
      };
    }
  },

  // --------------------------------------------------------------------------
  // Utility: URL State Sharing
  // --------------------------------------------------------------------------
  encodeShareUrl: (): string => {
    const { pattern, flags, testText } = get();

    if (typeof window === 'undefined') return '';

    try {
      const statePayload = JSON.stringify({ p: pattern, f: flags, t: testText });
      const encodedBase64 = btoa(encodeURIComponent(statePayload));
      return `${window.location.origin}${window.location.pathname}#r=${encodedBase64}`;
    } catch {
      return window.location.href;
    }
  },

  loadFromShareUrl: (): boolean => {
    if (typeof window === 'undefined') return false;

    try {
      const urlHash = window.location.hash;

      if (urlHash.startsWith('#r=')) {
        const decodedPayload = decodeURIComponent(atob(urlHash.slice(3)));
        const parsedData = JSON.parse(decodedPayload);

        if (parsedData && typeof parsedData.p === 'string') {
          set({
            pattern: parsedData.p,
            flags: parsedData.f ?? 'g',
            testText: parsedData.t ?? INITIAL_DEFAULT_TEST_TEXT,
          });
          return true;
        }
      }
    } catch {
      // Ignore URL decoding errors
    }

    return false;
  },
}));
