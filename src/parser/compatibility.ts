/**
 * ============================================================================
 * RegexLab - Multi-Engine Compatibility Checker
 * ============================================================================
 * 
 * Welcome! A common trap for developers is writing a regular expression that
 * works perfectly in JavaScript or Python, but throws a syntax error when
 * copied into Go, Rust, or Java!
 * 
 * WHY ARE REGEX ENGINES DIFFERENT?
 * Regular expression engines generally fall into two different philosophies:
 * 
 * 1. Backtracking Engines (NFA):
 *    - Used by: JavaScript, Python, PCRE2, Java, .NET
 *    - Pros: Supports advanced features like lookaheads `(?=...)`,
 *      lookbehinds `(?<=...)`, and backreferences `\1`.
 *    - Cons: Can suffer from ReDoS (catastrophic backtracking) on bad patterns.
 * 
 * 2. Automata-Based Engines (DFA / Thompson NFA):
 *    - Used by: Go (RE2), Rust (`regex` crate)
 *    - Pros: MATHEMATICALLY GUARANTEED to execute in linear time O(N)!
 *      Impossible to crash your server with ReDoS!
 *    - Cons: Deliberately FORBIDS lookarounds and backreferences because
 *      those features cannot be computed in guaranteed linear time.
 * 
 * This module tests your pattern against all 7 major language ecosystems,
 * alerts you to incompatibilities, and provides translated equivalents!
 */

import { EngineCompatibilityItem } from '../types/regex';

/**
 * Evaluates feature compatibility of a regex pattern across 7 major programming languages:
 * JavaScript, Python, PCRE2, Java, Go, Rust, and .NET.
 * 
 * @param pattern - The raw regex pattern string
 * @param flags - Regex flags (e.g. 'i', 'm')
 * @returns Array of compatibility reports for all 7 engines
 * 
 * @example
 * ```typescript
 * const results = checkEngineCompatibility('(?<=foo)bar');
 * const goSupport = results.find(r => r.engine === 'go');
 * console.log(goSupport?.supported); // false (Go doesn't support lookbehinds)
 * ```
 */
export function checkEngineCompatibility(
  pattern: string,
  flags: string = ''
): EngineCompatibilityItem[] {
  // Feature detection flags
  const hasLookahead = /\(\?=[^)]*\)|\(\?![^)]*\)/.test(pattern);
  const hasLookbehind = /\(\?<=[^)]*\)|\(\?<![^)]*\)/.test(pattern);
  const hasVariableLengthLookbehind =
    /\(\?<=[^)]*[+*][^)]*\)|\(\?<![^)]*[+*][^)]*\)/.test(pattern);
  const hasStandardNamedGroups = /\(\?<[a-zA-Z0-9_]+>/.test(pattern);
  const hasPythonNamedGroups = /\(\?P<[a-zA-Z0-9_]+>/.test(pattern);
  const hasBackreferences = /\\[1-9]|\bk<[a-zA-Z0-9_]+>/.test(pattern);
  const hasPossessiveQuantifiers = /[+*?]\+/.test(pattern);
  const hasAtomicGroups = /\(\?>/.test(pattern);
  const hasUnicodeProperties = /\\p\{[a-zA-Z0-9_]+\}/.test(pattern);

  const compatibilityMatrix: EngineCompatibilityItem[] = [
    // ------------------------------------------------------------------------
    // 1. JAVASCRIPT / TYPESCRIPT (V8, JavaScriptCore, SpiderMonkey)
    // ------------------------------------------------------------------------
    {
      engine: 'javascript',
      name: 'JavaScript / TypeScript',
      version: 'ECMAScript 2024 (V8)',
      supported: !hasPossessiveQuantifiers && !hasAtomicGroups && !hasPythonNamedGroups,
      warnings: [
        ...(hasPossessiveQuantifiers
          ? [
              'Possessive quantifiers (e.g., `++`, `*+`) are not supported in JavaScript. Use standard greedy quantifiers instead.',
            ]
          : []),
        ...(hasAtomicGroups
          ? [
              'Atomic groups `(?>...)` are not supported in standard JavaScript. Use non-capturing groups `(?:...)` or lookaheads.',
            ]
          : []),
        ...(hasPythonNamedGroups
          ? [
              'Python-style named group syntax `(?P<name>...)` is invalid in JS. Use standard `(?<name>...)`.',
            ]
          : []),
      ],
      notes: [
        'Supports lookaheads and fixed-length lookbehinds (ECMAScript 2018+).',
        'Supports named capture groups `(?<name>...)` and Unicode property escapes with `u` or `v` flag.',
      ],
      equivalentPattern: hasPythonNamedGroups
        ? pattern.replace(/\(\?P<([a-zA-Z0-9_]+)>/g, '(?<$1>')
        : undefined,
    },

    // ------------------------------------------------------------------------
    // 2. PYTHON (Standard `re` module)
    // ------------------------------------------------------------------------
    {
      engine: 'python',
      name: 'Python',
      version: 'Python 3.12+ (re / regex)',
      supported: !hasVariableLengthLookbehind && !hasPossessiveQuantifiers && !hasAtomicGroups,
      warnings: [
        ...(hasVariableLengthLookbehind
          ? [
              'Standard Python `re` requires fixed-length lookbehinds. Variable length like `(?<=a+)` will fail. Install the `regex` module via `pip install regex` for variable lookbehinds.',
            ]
          : []),
        ...(hasPossessiveQuantifiers
          ? ['Possessive quantifiers (`*+`, `++`) require the third-party `regex` module in Python.']
          : []),
        ...(hasStandardNamedGroups
          ? [
              'Tip: Python historically uses `(?P<name>...)`. Standard `(?<name>...)` is supported in Python 3.8+.',
            ]
          : []),
      ],
      notes: [
        'Always prefix your regex strings with `r"..."` in Python to avoid accidental escape sequence errors.',
        'Full support for lookarounds, backreferences, and word boundaries.',
      ],
      equivalentPattern: hasStandardNamedGroups
        ? pattern.replace(/\(\?<([a-zA-Z0-9_]+)>/g, '(?P<$1>')
        : undefined,
    },

    // ------------------------------------------------------------------------
    // 3. PCRE2 (C, PHP, Apache, Nginx, Perl)
    // ------------------------------------------------------------------------
    {
      engine: 'pcre',
      name: 'PCRE2 / PHP',
      version: 'PCRE2 10.42',
      supported: true,
      warnings: [],
      notes: [
        'Gold standard feature-complete regex engine.',
        'Full support for atomic groups `(?>...)`, possessive quantifiers, variable lookbehinds, and recursive patterns `(?R)`.',
      ],
    },

    // ------------------------------------------------------------------------
    // 4. JAVA (java.util.regex)
    // ------------------------------------------------------------------------
    {
      engine: 'java',
      name: 'Java',
      version: 'Java 21 LTS',
      supported: true,
      warnings: [
        ...(hasVariableLengthLookbehind
          ? [
              'Java supports lookbehinds with a finite maximum length (e.g. `(?<=a{1,5})`), but unbounded repetitions like `*` or `+` inside lookbehinds are rejected.',
            ]
          : []),
      ],
      notes: [
        'Full support for possessive quantifiers `++`, `*+` and atomic groups `(?>...)`.',
        'Named groups `(?<name>...)` fully supported since Java 7.',
      ],
    },

    // ------------------------------------------------------------------------
    // 5. GO (regexp / RE2)
    // ------------------------------------------------------------------------
    {
      engine: 'go',
      name: 'Go',
      version: 'Go 1.22 (regexp / RE2)',
      supported: !hasLookahead && !hasLookbehind && !hasBackreferences,
      warnings: [
        ...(hasLookahead
          ? [
              'Go `regexp` is based on Google RE2 and completely forbids lookaheads `(?=...)` to mathematically guarantee linear O(N) runtime.',
            ]
          : []),
        ...(hasLookbehind
          ? ['Go `regexp` does not support lookbehind assertions `(?<=...)`.']
          : []),
        ...(hasBackreferences
          ? ['Go `regexp` does not support backreferences (`\\1`, `\\k<name>`).']
          : []),
      ],
      notes: [
        'Guarantees linear time complexity with zero catastrophic backtracking (immune to ReDoS).',
        'Supports named capture groups `(?P<name>...)` and POSIX character classes `[:alnum:]`.',
      ],
    },

    // ------------------------------------------------------------------------
    // 6. RUST (regex crate)
    // ------------------------------------------------------------------------
    {
      engine: 'rust',
      name: 'Rust',
      version: 'regex crate 1.10+',
      supported: !hasLookahead && !hasLookbehind && !hasBackreferences,
      warnings: [
        ...(hasLookahead
          ? [
              'Rust `regex` crate uses finite automata and does not support lookaheads `(?=...)`. Use the `fancy-regex` crate if lookarounds are required.',
            ]
          : []),
        ...(hasLookbehind
          ? [
              'Rust `regex` crate does not support lookbehinds. Use `fancy-regex` crate if lookbehinds are needed.',
            ]
          : []),
        ...(hasBackreferences
          ? ['Rust `regex` crate does not support backreferences.']
          : []),
      ],
      notes: [
        'Guaranteed O(N) worst-case linear time execution without ReDoS vulnerability.',
        'Supports named groups `(?P<name>...)` and full Unicode properties.',
      ],
    },

    // ------------------------------------------------------------------------
    // 7. .NET (C#, F#, VB.NET)
    // ------------------------------------------------------------------------
    {
      engine: 'dotnet',
      name: '.NET / C#',
      version: '.NET 8/9 Regex',
      supported: true,
      warnings: [],
      notes: [
        'Supports variable-length lookbehind, atomic groups, and balancing groups `(?<name-other>...)`.',
        'Includes Source Generator Regex compilation for zero-allocation regex evaluation in modern C#.',
      ],
    },
  ];

  return compatibilityMatrix;
}
