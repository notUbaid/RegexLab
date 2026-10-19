export type Theme = 'dark' | 'light' | 'midnight' | 'oled' | 'nord' | 'dracula';

export type AppView = 
  | 'landing'
  | 'playground'
  | 'visualizer'
  | 'builder'
  | 'ast'
  | 'debugger'
  | 'performance'
  | 'compatibility'
  | 'library'
  | 'compare'
  | 'challenges';

export type TokenCategory =
  | 'anchor'
  | 'char-class'
  | 'quantifier'
  | 'group-open'
  | 'group-close'
  | 'lookaround'
  | 'alternation'
  | 'literal'
  | 'escape'
  | 'range'
  | 'backreference'
  | 'special';

export interface RegexToken {
  id: string;
  category: TokenCategory;
  raw: string;
  start: number;
  end: number;
  title: string;
  humanExplanation: string;
  detail?: string;
  groupIndex?: number;
  groupName?: string;
  quantifier?: {
    min: number;
    max: number | null; // null means infinite
    isLazy: boolean;
    isPossessive: boolean;
  };
}

export interface CaptureGroup {
  index: number;
  name?: string;
  text: string;
  start: number;
  end: number;
}

export interface RegexMatch {
  index: number;
  text: string;
  start: number;
  end: number;
  groups: CaptureGroup[];
}

export interface MatchAnalysis {
  matches: RegexMatch[];
  count: number;
  executionTimeMs: number;
  error?: string;
  isValid: boolean;
}

export type StepAction = 
  | 'start'
  | 'test_char'
  | 'match_char'
  | 'advance_cursor'
  | 'branch_start'
  | 'branch_failed'
  | 'backtrack'
  | 'group_enter'
  | 'group_exit'
  | 'anchor_check'
  | 'success'
  | 'fail';

export interface ExecutionStep {
  stepIndex: number;
  regexIndex: number;
  textIndex: number;
  action: StepAction;
  description: string;
  token?: RegexToken;
  charTested?: string;
  matchedSoFar: string;
  stackDepth: number;
  isBacktracking?: boolean;
}

export interface AstNode {
  id: string;
  type: 'Expression' | 'Alternative' | 'Group' | 'CharacterClass' | 'Quantifier' | 'Anchor' | 'Literal' | 'Lookaround' | 'Disjunction';
  label: string;
  raw: string;
  start: number;
  end: number;
  children?: AstNode[];
  meta?: Record<string, any>;
  collapsed?: boolean;
}

export interface DebuggerAnalysis {
  matched: boolean;
  failureIndex: number;
  expectedDescription: string;
  actualChar: string;
  suggestedFixes: string[];
  explanation: string;
}

export interface ReDoSAnalysis {
  riskScore: number; // 0 - 100
  riskLevel: 'safe' | 'low' | 'medium' | 'critical';
  hasNestedQuantifiers: boolean;
  hasOverlappingAlternations: boolean;
  complexityCategory: 'Linear O(N)' | 'Polynomial O(N^k)' | 'Exponential O(2^N)';
  benchmarkStepsCount: number;
  issues: string[];
  optimizations: string[];
}

export type EngineId = 'javascript' | 'python' | 'pcre' | 'java' | 'go' | 'rust' | 'dotnet';

export interface EngineCompatibilityItem {
  engine: EngineId;
  name: string;
  version: string;
  supported: boolean;
  warnings: string[];
  notes: string[];
  equivalentPattern?: string;
}

export interface PatternItem {
  id: string;
  name: string;
  category: 'Web & Network' | 'Security & Auth' | 'Data & Numbers' | 'Dates & Times' | 'Telephony & Location' | 'Programming';
  description: string;
  regex: string;
  flags: string;
  tags: string[];
  testCases: {
    input: string;
    shouldMatch: boolean;
  }[];
}

export interface Challenge {
  id: string;
  title: string;
  level: 'Novice' | 'Apprentice' | 'Adept' | 'Master' | 'Grandmaster';
  instructions: string;
  hint: string;
  starterPattern: string;
  mustMatch: string[];
  mustNotMatch: string[];
}

export interface BuilderBlockItem {
  id: string;
  type: 
    | 'start_of_line'
    | 'end_of_line'
    | 'word_boundary'
    | 'letters'
    | 'numbers'
    | 'whitespace'
    | 'any_character'
    | 'custom_text'
    | 'character_range'
    | 'custom_set'
    | 'not_in_set'
    | 'group'
    | 'or_alternation';
  value?: string;
  quantifier: 'one' | 'optional' | 'zero_or_more' | 'one_or_more' | 'exact' | 'range';
  min?: number;
  max?: number;
  greedy: boolean;
  captured?: boolean;
  groupName?: string;
}
