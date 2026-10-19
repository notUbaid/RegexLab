/**
 * ============================================================================
 * RegexLab - Core Type Definitions
 * ============================================================================
 * 
 * Welcome to RegexLab! This file defines all the data shapes (TypeScript types
 * and interfaces) used across the application.
 * 
 * If you are new to TypeScript or regular expressions, think of this file as
 * the "blueprint" or "dictionary" for the entire project. It tells the compiler
 * exactly what data looks like, helping us catch bugs before the code even runs!
 */

// ============================================================================
// 1. THEME & NAVIGATION TYPES
// ============================================================================

/**
 * The available visual color themes for RegexLab.
 * Users can switch between these themes in real time.
 */
export type Theme = 
  | 'dark'       // Midnight Slate (default modern developer dark mode)
  | 'light'      // Crisp Clean Editorial (high readability light mode)
  | 'midnight'   // Cosmic Deep Indigo (purple-tinted developer theme)
  | 'oled'       // Pure Vantablack (ideal for high-contrast OLED displays)
  | 'nord'       // Arctic Frost (cool pastel Nordic palette)
  | 'dracula';   // Vampire Purple Noir (vibrant cyberpunk aesthetic)

/**
 * The primary screens/views available in the application.
 * Clicking a navigation tab changes the current view to one of these values.
 */
export type AppView = 
  | 'landing'        // Hero landing page with 3D particles & live demo
  | 'playground'     // Main interactive regex editor and match tester
  | 'visualizer'     // Signature step-by-step engine execution visualizer
  | 'builder'        // Visual no-code regex builder
  | 'ast'            // Hierarchical Abstract Syntax Tree explorer
  | 'debugger'       // Match failure analyzer with 1-click fixes
  | 'performance'    // ReDoS risk detector & complexity analyzer
  | 'compatibility'  // 7-engine syntax comparison matrix
  | 'library'        // Prebuilt pattern catalog (emails, URLs, dates, etc.)
  | 'compare'        // Side-by-side regex pattern comparison tool
  | 'challenges';    // Interactive learning puzzle challenges

// ============================================================================
// 2. TOKEN & PARSER TYPES
// ============================================================================

/**
 * Every character or symbol in a regular expression belongs to a "Category".
 * This helps us color-code tokens and explain their purpose in plain English.
 */
export type TokenCategory =
  | 'anchor'         // Position anchors like `^` (start) or `$` (end)
  | 'char-class'     // Character sets like `\d`, `\w`, `[a-z]`
  | 'quantifier'     // Repetition markers like `*`, `+`, `?`, `{2,5}`
  | 'group-open'     // Opening parenthesis `(` or `(?:`
  | 'group-close'    // Closing parenthesis `)`
  | 'lookaround'     // Assertions like `(?=...)`, `(?!...)`, `(?<=...)`
  | 'alternation'    // Pipe symbol `|` meaning "OR"
  | 'literal'        // Plain letters/characters like `a`, `1`, `@`
  | 'escape'         // Escaped characters like `\.`, `\\`, `\n`
  | 'range'          // Hyphen inside character class like `a-z`
  | 'backreference'  // References to earlier groups like `\1` or `\k<name>`
  | 'special';       // Dot `.` (matches any character) or flags

/**
 * A single piece (token) of a regular expression.
 * 
 * For example, in the regex `^a+`:
 * - Token 1: `^` (Category: anchor, Title: Start of string)
 * - Token 2: `a` (Category: literal, Title: Letter "a")
 * - Token 3: `+` (Category: quantifier, Title: One or more times)
 */
export interface RegexToken {
  /** Unique identifier for React list rendering (e.g., 'tok-0') */
  id: string;

  /** What kind of regex construct this is */
  category: TokenCategory;

  /** The exact raw text inside the regex string (e.g., '\d+', '[A-Z]') */
  raw: string;

  /** Zero-based character index where this token starts in the regex */
  start: number;

  /** Zero-based character index where this token ends in the regex (exclusive) */
  end: number;

  /** Short human-readable title (e.g., 'Digit Character', 'Start of Line') */
  title: string;

  /** Full English explanation of what this token does */
  humanExplanation: string;

  /** Optional technical details (e.g., ASCII range, engine caveats) */
  detail?: string;

  /** If this is a capture group, the 1-based index (e.g., group 1, group 2) */
  groupIndex?: number;

  /** If this is a named group `(?<name>...)`, the extracted name */
  groupName?: string;

  /** Metadata for quantifiers */
  quantifier?: {
    /** Minimum required repetitions (e.g., 0 for `*`, 1 for `+`) */
    min: number;
    /** Maximum allowed repetitions (or null if infinite like `+` or `*`) */
    max: number | null;
    /** Is this quantifier lazy/non-greedy? (e.g., `+?` or `*?`) */
    isLazy: boolean;
    /** Is this quantifier possessive? (e.g., `++` in PCRE/Java) */
    isPossessive: boolean;
  };
}

// ============================================================================
// 3. MATCHING & TEST STRING TYPES
// ============================================================================

/**
 * Represents a single captured group inside a regex match.
 * 
 * Example: In `/(\d{4})-(\d{2})/` matching `"2026-10"`,
 * Group 1 is `"2026"` and Group 2 is `"10"`.
 */
export interface CaptureGroup {
  /** 1-based index of this capture group */
  index: number;

  /** Optional group name if syntax like `(?<year>\d{4})` was used */
  name?: string;

  /** The substring matched by this group */
  text: string;

  /** Starting character index within the test string */
  start: number;

  /** Ending character index within the test string (exclusive) */
  end: number;
}

/**
 * Represents a complete match found by the regular expression in the test text.
 */
export interface RegexMatch {
  /** 0-based index of which match this is (0 for 1st match, 1 for 2nd, etc.) */
  index: number;

  /** The full text substring that matched */
  text: string;

  /** Starting character index in the test string */
  start: number;

  /** Ending character index in the test string (exclusive) */
  end: number;

  /** All sub-groups captured inside this match */
  groups: CaptureGroup[];
}

/**
 * The output returned after executing the regex against the test string.
 */
export interface MatchAnalysis {
  /** Array of all matches found */
  matches: RegexMatch[];

  /** Total count of matches found */
  count: number;

  /** How many milliseconds the match took to execute (performance timing) */
  executionTimeMs: number;

  /** If the regex was invalid or threw a syntax error, the message is stored here */
  error?: string;

  /** Whether the regular expression is syntactically valid */
  isValid: boolean;
}

// ============================================================================
// 4. ENGINE SIMULATOR & DEBUGGER TYPES
// ============================================================================

/**
 * All possible actions the regex engine can take during execution.
 * These drive the animated debugger visualizer.
 */
export type StepAction = 
  | 'start'           // Engine starts matching at the current text position
  | 'test_char'       // Engine tests a character against a token
  | 'match_char'      // Character test passed!
  | 'advance_cursor'  // Engine moves one character forward in the text
  | 'branch_start'    // Engine enters an alternation branch (e.g., `cat|dog`)
  | 'branch_failed'   // The current branch failed, trying the next branch
  | 'backtrack'       // A greedy match failed later; rewinding cursor to try alternatives
  | 'group_enter'     // Engine enters a capture group
  | 'group_exit'      // Engine successfully exits a capture group
  | 'anchor_check'    // Verifying `^` or `$` or `\b` boundary
  | 'success'         // Complete match confirmed!
  | 'fail';           // Matching at this position failed completely

/**
 * A single recorded snapshot in the regex engine's execution timeline.
 */
export interface ExecutionStep {
  /** Sequential step number (0, 1, 2, 3...) */
  stepIndex: number;

  /** Character offset in the regex pattern string */
  regexIndex: number;

  /** Character offset in the test string being searched */
  textIndex: number;

  /** What action the virtual machine is performing */
  action: StepAction;

  /** Clear explanation of what is happening in this step */
  description: string;

  /** Which regex token is currently being evaluated */
  token?: RegexToken;

  /** The character in the test text currently under test */
  charTested?: string;

  /** All characters matched up to this point in the step */
  matchedSoFar: string;

  /** Current depth in nested groups or branching alternatives */
  stackDepth: number;

  /** Flag indicating whether this step represents a backtrack */
  isBacktracking?: boolean;
}

// ============================================================================
// 5. ABSTRACT SYNTAX TREE (AST) TYPES
// ============================================================================

/**
 * Represents a node in the hierarchical tree structure of the regex pattern.
 * Compilers convert code into trees like this to understand their grammar.
 */
export interface AstNode {
  /** Unique ID for the node */
  id: string;

  /** Grammar type of the node */
  type: 
    | 'Expression'      // Top-level container
    | 'Alternative'     // One branch of an OR condition
    | 'Group'           // Parenthesized group
    | 'CharacterClass'  // Set of allowed chars like `[a-z0-9]`
    | 'Quantifier'      // Repetition multiplier like `*` or `{3}`
    | 'Anchor'          // Position anchor like `^` or `$`
    | 'Literal'         // Single exact character
    | 'Lookaround'      // Zero-width lookahead or lookbehind
    | 'Disjunction';    // An OR separator `|`

  /** Human-friendly label for display in the tree */
  label: string;

  /** The raw substring of this AST branch */
  raw: string;

  /** Start position in the pattern */
  start: number;

  /** End position in the pattern */
  end: number;

  /** Child nodes nested inside this node */
  children?: AstNode[];

  /** Additional node-specific metadata (safely typed without 'any') */
  meta?: Record<string, unknown>;

  /** Whether the node is currently collapsed in the visual tree */
  collapsed?: boolean;
}

// ============================================================================
// 6. DEBUGGER & REDOS TYPES
// ============================================================================

/**
 * Diagnostic analysis produced when a user's regex fails to match.
 * Instead of simply saying "No match", this explains WHY and suggests a fix.
 */
export interface DebuggerAnalysis {
  /** Did the regex match the input text? */
  matched: boolean;

  /** Character position in test text where the match failed */
  failureIndex: number;

  /** Description of what the regex expected at the failure point */
  expectedDescription: string;

  /** The actual character found in the text that caused the failure */
  actualChar: string;

  /** Recommended pattern changes to make the match succeed */
  suggestedFixes: string[];

  /** Comprehensive human-friendly explanation of the failure */
  explanation: string;
}

/**
 * Results of analyzing a pattern for Regular Expression Denial of Service (ReDoS).
 * ReDoS occurs when greedy nested quantifiers cause exponential backtracking.
 */
export interface ReDoSAnalysis {
  /** Numeric risk score between 0 (completely safe) and 100 (catastrophic) */
  riskScore: number;

  /** Qualitative risk tier */
  riskLevel: 'safe' | 'low' | 'medium' | 'critical';

  /** True if patterns like `(a+)+` or `(a*)*` are detected */
  hasNestedQuantifiers: boolean;

  /** True if overlapping alternatives like `(a|a)+` are detected */
  hasOverlappingAlternations: boolean;

  /** Big-O algorithmic complexity classification */
  complexityCategory: 'Linear O(N)' | 'Polynomial O(N^k)' | 'Exponential O(2^N)';

  /** Simulated step count for adversarial inputs */
  benchmarkStepsCount: number;

  /** List of detected vulnerability warnings */
  issues: string[];

  /** Actionable recommendations to make the pattern safe */
  optimizations: string[];
}

// ============================================================================
// 7. COMPATIBILITY & MULTI-ENGINE TYPES
// ============================================================================

/**
 * Identifier for the 7 supported programming language regex engines.
 */
export type EngineId = 
  | 'javascript'  // V8 / SpiderMonkey (ECMAScript RegExp)
  | 'python'      // Python 3 `re` module
  | 'pcre'        // PCRE2 (PHP, C, Apache, Nginx)
  | 'java'        // java.util.regex
  | 'go'          // Go `regexp` (RE2 engine - guarantees O(N) execution)
  | 'rust'        // Rust `regex` crate (DFA/NFA hybrid, no backtracking)
  | 'dotnet';     // .NET System.Text.RegularExpressions

/**
 * Information regarding how a regular expression behaves in a specific engine.
 */
export interface EngineCompatibilityItem {
  /** The target engine identifier */
  engine: EngineId;

  /** Formal display name of the engine (e.g., 'Python (re)', 'Go (RE2)') */
  name: string;

  /** Engine or specification version */
  version: string;

  /** Is the current pattern supported in this engine? */
  supported: boolean;

  /** Compatibility caveats or syntax warnings */
  warnings: string[];

  /** Informational notes about engine-specific behavior */
  notes: string[];

  /** If unsupported, the equivalent pattern syntax for this engine */
  equivalentPattern?: string;
}

// ============================================================================
// 8. PATTERN LIBRARY & CHALLENGE TYPES
// ============================================================================

/**
 * A curated prebuilt regular expression pattern in the library.
 */
export interface PatternItem {
  /** Unique ID */
  id: string;

  /** Display name (e.g., "RFC 5322 Email", "Strong Password") */
  name: string;

  /** Domain category */
  category: 
    | 'Web & Network' 
    | 'Security & Auth' 
    | 'Data & Numbers' 
    | 'Dates & Times' 
    | 'Telephony & Location' 
    | 'Programming';

  /** Plain-language description of what this pattern matches */
  description: string;

  /** The regular expression pattern string */
  regex: string;

  /** Standard flags (e.g., 'g', 'i', 'm') */
  flags: string;

  /** Search tags for filtering */
  tags: string[];

  /** Predefined test cases demonstrating passing and failing inputs */
  testCases: {
    input: string;
    shouldMatch: boolean;
  }[];
}

/**
 * An interactive regex challenge puzzle.
 */
export interface Challenge {
  /** Unique challenge ID */
  id: string;

  /** Challenge title */
  title: string;

  /** Difficulty level */
  level: 'Novice' | 'Apprentice' | 'Adept' | 'Master' | 'Grandmaster';

  /** Clear objective instructions */
  instructions: string;

  /** Helpful hint if the user gets stuck */
  hint: string;

  /** Initial boilerplate regex pattern */
  starterPattern: string;

  /** Test strings that MUST match to pass the level */
  mustMatch: string[];

  /** Test strings that MUST NOT match to pass the level */
  mustNotMatch: string[];
}

// ============================================================================
// 9. VISUAL BUILDER TYPES
// ============================================================================

/**
 * A visual block used in the no-code regex builder.
 * Users assemble these blocks like Lego bricks to construct complex regexes.
 */
export interface BuilderBlockItem {
  /** Unique block ID */
  id: string;

  /** Type of construct represented by this block */
  type: 
    | 'start_of_line'     // `^`
    | 'end_of_line'       // `$`
    | 'word_boundary'     // `\b`
    | 'letters'           // `[a-zA-Z]`
    | 'numbers'           // `\d`
    | 'whitespace'        // `\s`
    | 'any_character'     // `.`
    | 'custom_text'       // Exact text literal
    | 'character_range'   // Custom range like `A-Z`
    | 'custom_set'        // Allowed set like `[abc]`
    | 'not_in_set'        // Negated set like `[^abc]`
    | 'group'             // Parenthesized group
    | 'or_alternation';   // `|`

  /** The custom value (if type is custom_text or character_range) */
  value?: string;

  /** How many times this block repeats */
  quantifier: 'one' | 'optional' | 'zero_or_more' | 'one_or_more' | 'exact' | 'range';

  /** Minimum repetition count when quantifier is 'exact' or 'range' */
  min?: number;

  /** Maximum repetition count when quantifier is 'range' */
  max?: number;

  /** Greedy matching behavior (true = greedy, false = lazy) */
  greedy: boolean;

  /** Should this block be captured as a group `(...)`? */
  captured?: boolean;

  /** Optional group name for named captures */
  groupName?: string;
}
