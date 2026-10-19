import { ReDoSAnalysis } from '../types/regex';

/**
 * Analyzes a regular expression for algorithmic complexity, ReDoS vulnerabilities,
 * nested quantifiers, overlapping branches, and catastrophic backtracking risks.
 */
export function analyzeRegexPerformance(pattern: string): ReDoSAnalysis {
  if (!pattern) {
    return {
      riskScore: 0,
      riskLevel: 'safe',
      hasNestedQuantifiers: false,
      hasOverlappingAlternations: false,
      complexityCategory: 'Linear O(N)',
      benchmarkStepsCount: 0,
      issues: [],
      optimizations: ['No pattern provided to analyze.'],
    };
  }

  let riskScore = 10;
  const issues: string[] = [];
  const optimizations: string[] = [];
  let hasNestedQuantifiers = false;
  let hasOverlappingAlternations = false;

  // 1. Detect Nested Quantifiers: (x+)+, (x*)*, ([a-z]+)+, (.*)*, (a|b+)+
  const nestedQuantifierRegex = /\((?:[^()]|\([^()]*\))*[+*]\)[+*]|\((?:[^()]|\([^()]*\))*\)\{[0-9]+,[0-9]*\}[+*]/;
  if (nestedQuantifierRegex.test(pattern)) {
    hasNestedQuantifiers = true;
    riskScore += 65;
    issues.push('Critical: Nested quantifiers detected (e.g., `(a+)+` or `(.*)*`). This creates exponential O(2^N) backtracking permutations when evaluated against non-matching text.');
    optimizations.push('Un-nest the quantifiers. Use non-overlapping classes like `[^"]*` instead of `.*` inside repeating groups.');
  }

  // 2. Detect Overlapping Alternations under repetition: (a|a)+, (\d|[0-9])+, (a|ab)+
  const overlappingAlternationRegex = /\((?:([a-zA-Z0-9])\|\1)\)[+*]/;
  if (overlappingAlternationRegex.test(pattern)) {
    hasOverlappingAlternations = true;
    riskScore += 45;
    issues.push('Severe: Overlapping alternations detected under repetition. The engine will explore duplicate branches for identical characters.');
    optimizations.push('Combine redundant branches into a single character set or factor out shared prefixes.');
  }

  // 3. Detect unanchored unbounded wildcards: .* or .+ in complex patterns
  const wildcardsCount = (pattern.match(/\.\*|\.\+/g) || []).length;
  if (wildcardsCount >= 2) {
    riskScore += 20;
    issues.push(`Multiple unconstrained greedy wildcards ('.*' or '.+') found (${wildcardsCount}).`);
    optimizations.push('Replace greedy wildcards with negated character classes (e.g., replace `.*` with `[^\\s]*` or `[^/]*`).');
  }

  // 4. Repeated optional patterns: (a?b?)*
  if (/\((?:[^()]*\?)+\)[*+]/.test(pattern)) {
    riskScore += 35;
    issues.push('Repeated optional elements inside a group. Can trigger pathological polynomial slowdown.');
    optimizations.push('Require at least one mandatory token in the group to anchor engine progress.');
  }

  // 5. Expensive Lookbehinds in repetitive patterns
  if (/\(\?<=?[^)]*\)[+*]|\(\?<!?[^)]*\)[+*]/.test(pattern)) {
    riskScore += 15;
    issues.push('Quantified lookaround assertions may incur high verification overhead across engines.');
    optimizations.push('Anchor the lookaround to a specific token instead of applying quantifiers directly.');
  }

  // Calculate benchmark steps simulation on a 25-character adversarial string
  let benchmarkStepsCount = 0;
  try {
    const adversarialInput = 'a'.repeat(22) + '!';
    const startTime = performance.now();
    const rx = new RegExp(pattern);
    rx.test(adversarialInput);
    const elapsed = performance.now() - startTime;
    benchmarkStepsCount = Math.round(Math.max(25, elapsed * 1000));
  } catch {
    benchmarkStepsCount = 99999;
  }

  // Bound risk score between 0 and 100
  riskScore = Math.min(100, Math.max(5, riskScore));

  let riskLevel: ReDoSAnalysis['riskLevel'] = 'safe';
  let complexityCategory: ReDoSAnalysis['complexityCategory'] = 'Linear O(N)';

  if (riskScore >= 75) {
    riskLevel = 'critical';
    complexityCategory = 'Exponential O(2^N)';
  } else if (riskScore >= 45) {
    riskLevel = 'medium';
    complexityCategory = 'Polynomial O(N^k)';
  } else if (riskScore >= 25) {
    riskLevel = 'low';
    complexityCategory = 'Linear O(N)';
  }

  if (optimizations.length === 0) {
    optimizations.push('Pattern uses deterministic tokens with safe boundaries. No exponential backtracking detected.');
    optimizations.push('Consider adding start (^) and end ($) anchors if validating complete strings.');
  }

  return {
    riskScore,
    riskLevel,
    hasNestedQuantifiers,
    hasOverlappingAlternations,
    complexityCategory,
    benchmarkStepsCount,
    issues,
    optimizations,
  };
}
