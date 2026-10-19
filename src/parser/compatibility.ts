import { EngineCompatibilityItem } from '../types/regex';

/**
 * Evaluates regex feature compatibility across major programming language engines:
 * JavaScript, Python, PCRE2, Java, Go (RE2), Rust (regex crate), and .NET.
 */
export function checkEngineCompatibility(pattern: string, flags: string = ''): EngineCompatibilityItem[] {
  const hasLookahead = /\(\?=[^)]*\)|\(\?![^)]*\)/.test(pattern);
  const hasLookbehind = /\(\?<=[^)]*\)|\(\?<![^)]*\)/.test(pattern);
  const hasVariableLookbehind = /\(\?<=[^)]*[+*][^)]*\)|\(\?<![^)]*[+*][^)]*\)/.test(pattern);
  const hasNamedGroups = /\(\?<[a-zA-Z0-9_]+>/.test(pattern);
  const hasPythonNamedGroups = /\(\?P<[a-zA-Z0-9_]+>/.test(pattern);
  const hasBackreferences = /\\[1-9]|\bk<[a-zA-Z0-9_]+>/.test(pattern);
  const hasPossessiveQuantifiers = /[+*?]\+/.test(pattern);
  const hasAtomicGroups = /\(\?>/.test(pattern);
  const hasUnicodeProperties = /\\p\{[a-zA-Z0-9_]+\}/.test(pattern);

  const results: EngineCompatibilityItem[] = [
    // 1. JavaScript (ECMAScript 2024 / V8)
    {
      engine: 'javascript',
      name: 'JavaScript / TypeScript',
      version: 'ECMAScript 2024 (V8)',
      supported: !hasPossessiveQuantifiers && !hasAtomicGroups && !hasPythonNamedGroups,
      warnings: [
        ...(hasPossessiveQuantifiers ? ['Possessive quantifiers (e.g., ++, *+) are not natively supported in standard JavaScript. Use standard greedy quantifiers instead.'] : []),
        ...(hasAtomicGroups ? ['Atomic groups (?>...) are not supported in standard JavaScript. Use non-capturing groups (?:...) or lookaheads.'] : []),
        ...(hasPythonNamedGroups ? ['Python-style named group syntax (?P<name>...) is unsupported in JS. Use standard (?<name>...).'] : []),
      ],
      notes: [
        'Supports lookaheads and fixed-length lookbehinds (ECMAScript 2018+).',
        'Supports named capture groups `(?<name>...)` and Unicode property escapes with `u` or `v` flag.',
      ],
      equivalentPattern: hasPythonNamedGroups ? pattern.replace(/\(\?P<([a-zA-Z0-9_]+)>/g, '(?<$1>') : undefined,
    },

    // 2. Python (re module)
    {
      engine: 'python',
      name: 'Python',
      version: 'Python 3.12+ (re / regex)',
      supported: !hasVariableLookbehind && !hasPossessiveQuantifiers && !hasAtomicGroups,
      warnings: [
        ...(hasVariableLookbehind ? ['Standard `re` module does not support variable-length lookbehinds. Consider using the third-party `regex` module (pip install regex).'] : []),
        ...(hasPossessiveQuantifiers ? ['Possessive quantifiers (*+, ++) require the third-party `regex` module in Python.'] : []),
        ...(hasNamedGroups ? ['Standard `re` accepts `(?P<name>...)` and Python 3.8+ also accepts `(?<name>...)`.'] : []),
      ],
      notes: [
        'Full support for lookarounds, backreferences, and word boundaries.',
        'Use raw string syntax `r"..."` in Python to avoid escape sequence issues.',
      ],
      equivalentPattern: hasNamedGroups ? pattern.replace(/\(\?<([a-zA-Z0-9_]+)>/g, '(?P<$1>') : undefined,
    },

    // 3. PCRE2 (C / PHP / Apache / Perl)
    {
      engine: 'pcre',
      name: 'PCRE2 / PHP',
      version: 'PCRE2 10.42',
      supported: true,
      warnings: [],
      notes: [
        'Gold standard feature-complete regex engine.',
        'Full support for atomic groups (?>...), possessive quantifiers, variable-length lookbehinds, and recursion (?R).',
      ],
    },

    // 4. Java (java.util.regex)
    {
      engine: 'java',
      name: 'Java',
      version: 'Java 21 LTS',
      supported: true,
      warnings: [
        ...(hasVariableLookbehind ? ['Java supports lookbehinds with a maximum finite length, but unbounded quantifiers inside lookbehinds (like * or +) are rejected.'] : []),
      ],
      notes: [
        'Full support for possessive quantifiers `++`, `*+` and atomic groups `(?>...)`.',
        'Named groups `(?<name>...)` fully supported since Java 7.',
      ],
    },

    // 5. Go (regexp / RE2)
    {
      engine: 'go',
      name: 'Go',
      version: 'Go 1.22 (regexp / RE2)',
      supported: !hasLookahead && !hasLookbehind && !hasBackreferences,
      warnings: [
        ...(hasLookahead ? ['Go `regexp` is based on RE2 and completely forbids lookahead assertions (?=...) to guarantee linear O(N) runtime.'] : []),
        ...(hasLookbehind ? ['Go `regexp` does not support lookbehind assertions (?<=...).'] : []),
        ...(hasBackreferences ? ['Go `regexp` does not support backreferences (\\1, \\k<name>).'] : []),
      ],
      notes: [
        'Guarantees linear time complexity with zero catastrophic backtracking.',
        'Supports named capture groups `(?P<name>...)` and POSIX character classes `[:alnum:]`.',
      ],
    },

    // 6. Rust (regex crate)
    {
      engine: 'rust',
      name: 'Rust',
      version: 'regex crate 1.10+',
      supported: !hasLookahead && !hasLookbehind && !hasBackreferences,
      warnings: [
        ...(hasLookahead ? ['Rust `regex` crate is based on finite automata and does not support lookaheads (?=...). For lookarounds, use the `fancy-regex` crate.'] : []),
        ...(hasLookbehind ? ['Rust `regex` crate does not support lookbehinds. Use `fancy-regex` if lookbehinds are essential.'] : []),
        ...(hasBackreferences ? ['Rust `regex` crate does not support backreferences.'] : []),
      ],
      notes: [
        'Guaranteed O(N) worst-case linear time execution without ReDoS vulnerability.',
        'Supports named groups `(?P<name>...)` and Unicode character classes.',
      ],
    },

    // 7. .NET (C# / F# / VB)
    {
      engine: 'dotnet',
      name: '.NET / C#',
      version: '.NET 8/9 Regex',
      supported: true,
      warnings: [],
      notes: [
        'Supports variable-length lookbehind, atomic groups, and balancing groups `(?<name-other>...)`.',
        'Includes Source Generator Regex compilation for zero-allocation regex evaluation.',
      ],
    },
  ];

  return results;
}
