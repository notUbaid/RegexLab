import { RegexAnalysisResult } from './types';
import { tokenize } from './lexer';
import { parseAst } from './parser';
import { executeMatches, simulateTrace } from './matcher';
import { analyzeComplexity } from './complexity';
import { checkCompatibility } from './compatibility';
import { translateTokens } from './translator';

export function analyzeRegex(pattern: string, flags: string, testText: string): RegexAnalysisResult {
  if (!pattern) {
    const emptyAst = parseAst([], '');
    return {
      pattern: '',
      flags,
      isValid: true,
      error: null,
      tokens: [],
      ast: emptyAst,
      matches: [],
      matchCount: 0,
      executionTimeMs: 0,
      trace: [],
      complexity: analyzeComplexity(''),
      compatibility: checkCompatibility('', flags),
      explanation: [],
    };
  }

  // 1. Verify syntax validity
  let isValid = true;
  let syntaxError: string | null = null;
  try {
    new RegExp(pattern, flags);
  } catch (err: unknown) {
    isValid = false;
    syntaxError = err instanceof Error ? err.message : String(err);
  }

  // 2. Lexical & AST pipeline
  const tokens = tokenize(pattern);
  const ast = parseAst(tokens, pattern);

  // 3. Execution & matching
  const { matches, timeMs } = isValid
    ? executeMatches(pattern, flags, testText)
    : { matches: [], timeMs: 0 };

  // 4. Trace, Complexity, Compatibility, and Explanation
  const trace = isValid ? simulateTrace(tokens, testText) : [];
  const complexity = analyzeComplexity(pattern);
  const compatibility = checkCompatibility(pattern, flags);
  const explanation = translateTokens(tokens);

  return {
    pattern,
    flags,
    isValid,
    error: syntaxError,
    tokens,
    ast,
    matches,
    matchCount: matches.length,
    executionTimeMs: timeMs,
    trace,
    complexity,
    compatibility,
    explanation,
  };
}
