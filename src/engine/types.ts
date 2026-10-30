export interface RegexToken {
  id: string;
  type: string;
  category: 'literal' | 'character_class' | 'quantifier' | 'anchor' | 'group' | 'alternation' | 'lookaround' | 'special';
  raw: string;
  start: number;
  end: number;
  title: string;
  explanation: string;
  depth: number;
  groupIndex?: number;
  quantifier?: { min: number; max?: number; greedy: boolean };
}

export interface AstNode {
  id: string;
  type: string;
  label: string;
  raw: string;
  start: number;
  end: number;
  depth?: number;
  groupIndex?: number;
  explanation?: string;
  children?: AstNode[];
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
  start: number;
  end: number;
  text: string;
  groups: CaptureGroup[];
}

export interface TraceStep {
  stepIndex: number;
  charIndex: number;
  char: string;
  state: string;
  action: 'match' | 'backtrack' | 'branch' | 'fail' | 'success';
  explanation: string;
  isBacktracking: boolean;
  matchedSoFar: string;
  tokenId?: string;
}

export interface ComplexityAnalysis {
  riskLevel: 'safe' | 'low' | 'medium' | 'critical';
  riskScore: number;
  timeComplexity: string;
  isVulnerable: boolean;
  explanation: string;
  vulnerableSubpatterns: string[];
  safeAlternative?: string;
}

export interface EngineCompatibility {
  engine: string;
  name: string;
  version: string;
  supported: boolean;
  warnings: string[];
  snippet: string;
}

export interface ExplanationBlock {
  id: string;
  depth: number;
  title: string;
  summary: string;
  details?: string;
  badge?: string;
  badgeColor?: string;
  tokenIds: string[];
}

export interface RegexAnalysisResult {
  pattern: string;
  flags: string;
  isValid: boolean;
  error: string | null;
  tokens: RegexToken[];
  ast: AstNode;
  matches: RegexMatch[];
  matchCount: number;
  executionTimeMs: number;
  trace: TraceStep[];
  complexity: ComplexityAnalysis;
  compatibility: EngineCompatibility[];
  explanation: ExplanationBlock[];
}
