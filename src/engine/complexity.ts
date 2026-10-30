import { ComplexityAnalysis } from './types';

export function analyzeComplexity(pattern: string): ComplexityAnalysis {
  if (!pattern) {
    return {
      riskLevel: 'safe',
      riskScore: 0,
      timeComplexity: 'O(1)',
      isVulnerable: false,
      explanation: 'Empty pattern evaluates instantly.',
      vulnerableSubpatterns: [],
    };
  }

  const vulnerableSubpatterns: string[] = [];
  let riskScore = 10;
  let timeComplexity = 'O(N)';

  // Heuristic 1: Nested Quantifiers (e.g., (a+)+, (.*)*, ([0-9]+)+)
  // This causes catastrophic backtracking exponential O(2^N)
  const nestedQuantifierRegex = /(\([^\)]*[\+\*][^\)]*\))[\+\*]/g;
  let match: RegExpExecArray | null;
  while ((match = nestedQuantifierRegex.exec(pattern)) !== null) {
    vulnerableSubpatterns.push(match[0]);
    riskScore += 45;
  }

  // Heuristic 2: Overlapping Alternations inside Repetition (e.g., (a|a)+ or (a|ab)+)
  const overlappingAlternationRegex = /\(([a-zA-Z0-9_\\]+)\|(\1[a-zA-Z0-9_\\]*)\)[\+\*]/g;
  while ((match = overlappingAlternationRegex.exec(pattern)) !== null) {
    vulnerableSubpatterns.push(match[0]);
    riskScore += 35;
  }

  // Heuristic 3: Adjacent Greedy Wildcards (e.g., .*.* or \d+.*\d+)
  const adjacentWildcardsRegex = /\.\*[\s\S]*?\.\*/g;
  if (adjacentWildcardsRegex.test(pattern)) {
    vulnerableSubpatterns.push('.*.*');
    riskScore += 25;
  }

  // Cap score at 100
  riskScore = Math.min(100, riskScore);

  let riskLevel: ComplexityAnalysis['riskLevel'] = 'safe';
  let explanation = 'Linear execution complexity. Safe for high-throughput production.';

  if (riskScore >= 75) {
    riskLevel = 'critical';
    timeComplexity = 'O(2^N)';
    explanation = 'Severe ReDoS hazard: nested quantifiers create exponential backtracking branches that can freeze the process on mismatched inputs.';
  } else if (riskScore >= 40) {
    riskLevel = 'medium';
    timeComplexity = 'O(N^2)';
    explanation = 'Polynomial backtracking: multiple greedy expressions without distinct boundaries may cause latency spikes on large text inputs.';
  } else if (riskScore > 15) {
    riskLevel = 'low';
    timeComplexity = 'O(N)';
    explanation = 'Mild backtracking overhead: bounded quantifiers and greedy scans. Safe for normal workloads.';
  }

  const safeAlternative = vulnerableSubpatterns.length > 0
    ? pattern.replace(/(\([^\)]+)\+([^\)]*\))\+/g, '$1$2+').replace(/\.\*(\w+)/g, '[^$1]*$1')
    : undefined;

  return {
    riskLevel,
    riskScore,
    timeComplexity,
    isVulnerable: riskLevel === 'critical' || riskLevel === 'medium',
    explanation,
    vulnerableSubpatterns,
    safeAlternative,
  };
}
