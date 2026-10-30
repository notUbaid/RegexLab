import { EngineCompatibility } from './types';

export function checkCompatibility(pattern: string, flags: string): EngineCompatibility[] {
  const hasNamedGroups = /\(\?<[a-zA-Z]/.test(pattern);
  const hasLookaround = /\(\?<?[=!][^\)]*\)/.test(pattern);
  const hasLookbehind = /\(\?<=|\(\?<!/.test(pattern);
  const hasBackreferences = /\\[1-9]/.test(pattern);

  const engines: EngineCompatibility[] = [
    {
      engine: 'js',
      name: 'JavaScript (ECMAScript / V8)',
      version: 'ES2024',
      supported: true,
      warnings: [],
      snippet: `const rx = /${pattern}/${flags};`,
    },
    {
      engine: 'python',
      name: 'Python (re module)',
      version: '3.10+',
      supported: true,
      warnings: hasNamedGroups
        ? ['Python re syntax requires (?P<name>...) for named groups.']
        : [],
      snippet: (() => {
        const pyFlags: string[] = [];
        if (flags.includes('i')) pyFlags.push('re.IGNORECASE');
        if (flags.includes('m')) pyFlags.push('re.MULTILINE');
        if (flags.includes('s')) pyFlags.push('re.DOTALL');
        const flagArg = pyFlags.length ? `, ${pyFlags.join(' | ')}` : '';
        const pyPattern = pattern.replace(/\(\?<([a-zA-Z0-9_]+)>/g, '(?P<$1>');
        return `import re\nrx = re.compile(r"${pyPattern}"${flagArg})`;
      })(),
    },
    {
      engine: 'pcre',
      name: 'PCRE2 (PHP, C, Apache)',
      version: '10.42',
      supported: true,
      warnings: [],
      snippet: `$pattern = '/${pattern}/${flags}';\npreg_match($pattern, $text, $matches);`,
    },
    {
      engine: 'go',
      name: 'Go (regexp / RE2)',
      version: '1.22+',
      supported: !hasLookaround && !hasBackreferences,
      warnings: [
        ...(hasLookaround ? ['Go RE2 engine intentionally omits lookarounds for linear O(N) guarantees.'] : []),
        ...(hasBackreferences ? ['Backreferences are not supported in RE2.'] : []),
      ],
      snippet: `import "regexp"\nrx := regexp.MustCompile(\`${pattern}\`)`,
    },
    {
      engine: 'rust',
      name: 'Rust (regex crate)',
      version: '1.10+',
      supported: !hasLookaround && !hasBackreferences,
      warnings: [
        ...(hasLookaround ? ['Rust regex crate uses DFA/NFA without backtracking; lookarounds unsupported. Use fancy-regex if required.'] : []),
        ...(hasBackreferences ? ['Backreferences not supported in rust regex crate.'] : []),
      ],
      snippet: `use regex::Regex;\nlet rx = Regex::new(r"${pattern}").unwrap();`,
    },
    {
      engine: 'java',
      name: 'Java (java.util.regex)',
      version: 'JDK 17+',
      supported: true,
      warnings: [],
      snippet: `import java.util.regex.Pattern;\nPattern rx = Pattern.compile("${pattern.replace(/\\/g, '\\\\')}");`,
    },
    {
      engine: 'dotnet',
      name: 'C# / .NET (System.Text.RegularExpressions)',
      version: '.NET 8',
      supported: true,
      warnings: [],
      snippet: `using System.Text.RegularExpressions;\nvar rx = new Regex(@"${pattern.replace(/"/g, '""')}");`,
    },
  ];

  return engines;
}
