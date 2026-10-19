/**
 * ============================================================================
 * RegexLab - ReDoS & Performance Analyzer
 * ============================================================================
 * 
 * Welcome! If you've ever heard of a website going down or an API freezing
 * because of a bad regular expression, that is called ReDoS:
 * "Regular Expression Denial of Service".
 * 
 * WHAT IS REDOS (CATASTROPHIC BACKTRACKING)?
 * Imagine you write the regex `(a+)+$` and test it against `"aaaaaaaaaaaaX"`.
 * 
 * 1. The inner `a+` consumes all the 'a's greedily.
 * 2. It hits 'X', which fails to match `$`.
 * 3. The engine backtracks: "What if the inner `a+` only took 11 'a's, and the
 *    outer group took the 12th 'a'?"
 * 4. It tries every possible combination of grouping the 12 letters!
 * 
 * For 25 letters, that is over 33,000,000 combinations! The CPU pegs at 100%,
 * the server freezes, and real users cannot access the app!
 * 
 * This module inspects your pattern before it runs in production, detects
 * dangerous structures, assigns a 0-100 risk score, and recommends fixes!
 */

import { ReDoSAnalysis } from '../types/regex';

// ============================================================================
// CONSTANTS & HEURISTICS
// ============================================================================

/** Minimum safe baseline risk score */
const BASELINE_RISK_SCORE = 10;

/** Score penalty added when nested quantifiers like (a+)+ are found */
const NESTED_QUANTIFIER_PENALTY = 65;

/** Score penalty added when overlapping alternation branches like (a|a)+ are found */
const OVERLAPPING_ALTERNATION_PENALTY = 45;

/** Score penalty added when multiple unbounded wildcards (.*) are used */
const MULTIPLE_WILDCARDS_PENALTY = 20;

/** Score penalty added when repeating groups contain only optional elements */
const REPEATED_OPTIONALS_PENALTY = 35;

// ============================================================================
// MAIN PERFORMANCE ANALYSIS FUNCTION
// ============================================================================

/**
 * Analyzes a regular expression for ReDoS risks, backtracking traps, and Big-O complexity.
 * 
 * @param pattern - The regular expression pattern string
 * @returns ReDoS analysis report with risk tier, detected vulnerabilities, and fixes
 * 
 * @example
 * ```typescript
 * const report = analyzeRegexPerformance('(a+)+$');
 * console.log(report.riskLevel); // 'critical'
 * console.log(report.complexityCategory); // 'Exponential O(2^N)'
 * ```
 */
export function analyzeRegexPerformance(pattern: string): ReDoSAnalysis {
  // Step 1: Handle empty pattern
  if (!pattern) {
    return {
      riskScore: 0,
      riskLevel: 'safe',
      hasNestedQuantifiers: false,
      hasOverlappingAlternations: false,
      complexityCategory: 'Linear O(N)',
      benchmarkStepsCount: 0,
      issues: [],
      optimizations: ['Pattern is empty. Enter an expression to evaluate its performance.'],
    };
  }

  let totalRiskScore = BASELINE_RISK_SCORE;
  const detectedIssues: string[] = [];
  const recommendedOptimizations: string[] = [];
  let containsNestedQuantifiers = false;
  let containsOverlappingAlternations = false;

  // --------------------------------------------------------------------------
  // HEURISTIC 1: Nested Quantifiers (e.g., `(a+)+`, `(x*)*`, `(.*)*`)
  // Mathematical complexity: O(2^N) Exponential Explosion!
  // --------------------------------------------------------------------------
  const nestedQuantifierPattern =
    /\((?:[^()]|\([^()]*\))*[+*]\)[+*]|\((?:[^()]|\([^()]*\))*\)\{[0-9]+,[0-9]*\}[+*]/;

  if (nestedQuantifierPattern.test(pattern)) {
    containsNestedQuantifiers = true;
    totalRiskScore += NESTED_QUANTIFIER_PENALTY;

    detectedIssues.push(
      'Critical: Nested quantifiers detected (e.g. `(a+)+` or `(.*)*`). This creates exponential O(2^N) backtracking permutations when evaluated against non-matching text.'
    );
    recommendedOptimizations.push(
      'Un-nest the quantifiers. Instead of `(a+)+`, simplify to `a+`. If parsing structured tokens, use negative character sets like `[^"]*` instead of `.*`.'
    );
  }

  // --------------------------------------------------------------------------
  // HEURISTIC 2: Overlapping Alternations under Repetition (e.g. `(a|a)+`)
  // --------------------------------------------------------------------------
  const overlappingAlternationPattern = /\((?:([a-zA-Z0-9])\|\1)\)[+*]/;

  if (overlappingAlternationPattern.test(pattern)) {
    containsOverlappingAlternations = true;
    totalRiskScore += OVERLAPPING_ALTERNATION_PENALTY;

    detectedIssues.push(
      'Severe: Overlapping alternations detected under repetition (e.g. `(a|a)+`). The engine will redundantly test duplicate branches for the same character.'
    );
    recommendedOptimizations.push(
      'Combine redundant branches into a single character set (e.g. replace `a|a` with `a`) or factor out shared prefixes.'
    );
  }

  // --------------------------------------------------------------------------
  // HEURISTIC 3: Multiple Unbounded Greedy Wildcards (`.*` or `.+`)
  // --------------------------------------------------------------------------
  const wildcardMatches = pattern.match(/\.\*|\.\+/g);
  const wildcardCount = wildcardMatches ? wildcardMatches.length : 0;

  if (wildcardCount >= 2) {
    totalRiskScore += MULTIPLE_WILDCARDS_PENALTY;

    detectedIssues.push(
      `Multiple unconstrained greedy wildcards ('.*' or '.+') found (${wildcardCount}). Unanchored wildcards force extensive backtrack rewinds.`
    );
    recommendedOptimizations.push(
      'Replace greedy `.*` with negated character classes (e.g. replace `.*` with `[^\\s]*` or `[^/]*` to prevent crossing delimiters).'
    );
  }

  // --------------------------------------------------------------------------
  // HEURISTIC 4: Repeated Optional Elements (e.g. `(a?b?)*`)
  // --------------------------------------------------------------------------
  if (/\((?:[^()]*\?)+\)[*+]/.test(pattern)) {
    totalRiskScore += REPEATED_OPTIONALS_PENALTY;

    detectedIssues.push(
      'Repeated optional elements inside a group (e.g. `(a?b?)*`). The engine can match 0 characters in infinite ways, creating polynomial slowdown.'
    );
    recommendedOptimizations.push(
      'Require at least one mandatory token in the group so the engine makes forward progress on every repetition.'
    );
  }

  // --------------------------------------------------------------------------
  // HEURISTIC 5: Quantified Lookarounds (e.g. `(?=...)+`)
  // --------------------------------------------------------------------------
  if (/\(\?<=?[^)]*\)[+*]|\(\?<!?[^)]*\)[+*]/.test(pattern)) {
    totalRiskScore += 15;

    detectedIssues.push(
      'Quantified lookaround assertions may incur high verification overhead across engines.'
    );
    recommendedOptimizations.push(
      'Anchor the lookaround to a specific character or remove the quantifier from the assertion.'
    );
  }

  // Step 3: Run a micro-benchmark against a synthetic adversarial string
  let benchmarkStepEstimation = 0;
  try {
    const adversarialTestString = 'a'.repeat(22) + '!';
    const benchmarkStartTime = performance.now();
    const testRegex = new RegExp(pattern);
    testRegex.test(adversarialTestString);
    const benchmarkElapsedTimeMs = performance.now() - benchmarkStartTime;
    benchmarkStepEstimation = Math.round(Math.max(25, benchmarkElapsedTimeMs * 1000));
  } catch {
    benchmarkStepEstimation = 99999;
  }

  // Step 4: Clamp risk score between 5 and 100
  totalRiskScore = Math.min(100, Math.max(5, totalRiskScore));

  // Step 5: Assign categorical risk tier and algorithmic Big-O notation
  let qualitativeRiskTier: ReDoSAnalysis['riskLevel'] = 'safe';
  let algorithmicComplexity: ReDoSAnalysis['complexityCategory'] = 'Linear O(N)';

  if (totalRiskScore >= 75) {
    qualitativeRiskTier = 'critical';
    algorithmicComplexity = 'Exponential O(2^N)';
  } else if (totalRiskScore >= 45) {
    qualitativeRiskTier = 'medium';
    algorithmicComplexity = 'Polynomial O(N^k)';
  } else if (totalRiskScore >= 25) {
    qualitativeRiskTier = 'low';
    algorithmicComplexity = 'Linear O(N)';
  }

  // If pattern is completely safe, provide positive reinforcement
  if (recommendedOptimizations.length === 0) {
    recommendedOptimizations.push(
      'Great work! This pattern uses deterministic tokens with clear boundaries. No catastrophic backtracking detected.'
    );
    recommendedOptimizations.push(
      'Tip: Consider adding start (^) and end ($) anchors if you are validating entire form fields.'
    );
  }

  return {
    riskScore: totalRiskScore,
    riskLevel: qualitativeRiskTier,
    hasNestedQuantifiers: containsNestedQuantifiers,
    hasOverlappingAlternations: containsOverlappingAlternations,
    complexityCategory: algorithmicComplexity,
    benchmarkStepsCount: benchmarkStepEstimation,
    issues: detectedIssues,
    optimizations: recommendedOptimizations,
  };
}
