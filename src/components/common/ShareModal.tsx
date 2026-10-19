import React, { useState } from 'react';
import { useRegexStore } from '../../store/useRegexStore';
import { X, Copy, Check, Code, Share2, Globe } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const { pattern, flags, testText, encodeShareUrl } = useRegexStore();
  const [selectedLang, setSelectedLang] = useState<'javascript' | 'python' | 'go' | 'rust' | 'java' | 'csharp' | 'php'>('javascript');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const shareUrl = encodeShareUrl();

  const getCodeSnippet = (lang: string): string => {
    switch (lang) {
      case 'javascript':
        return `// JavaScript / TypeScript
const pattern = /${pattern}/${flags};
const text = ${JSON.stringify(testText)};

const matches = [...text.matchAll(pattern)];
matches.forEach((match, idx) => {
  console.log(\`Match \${idx + 1}: "\${match[0]}" at position \${match.index}\`);
  match.slice(1).forEach((group, gIdx) => {
    console.log(\`  Group \${gIdx + 1}: "\${group}"\`);
  });
});`;

      case 'python':
        return `# Python 3
import re

pattern = r"${pattern}"
text = """${testText}"""

matches = re.finditer(pattern, text${flags.includes('i') ? ', re.IGNORECASE' : ''}${flags.includes('m') ? ' | re.MULTILINE' : ''})
for idx, match in enumerate(matches, 1):
    print(f"Match {idx}: '{match.group(0)}' at [{match.start()}:{match.end()}]")
    for g_idx, group in enumerate(match.groups(), 1):
        print(f"  Group {g_idx}: '{group}'")`;

      case 'go':
        return `// Go (golang)
package main

import (
	"fmt"
	"regexp"
)

func main() {
	pattern := \`${pattern}\`
	text := \`${testText}\`

	re := regexp.MustCompile(pattern)
	matches := re.FindAllStringSubmatch(text, -1)
	for i, match := range matches {
		fmt.Printf("Match %d: %s\\n", i+1, match[0])
	}
}`;

      case 'rust':
        return `// Rust (regex crate)
use regex::Regex;

fn main() {
    let re = Regex::new(r"${pattern}").unwrap();
    let text = r#"${testText}"#;

    for (idx, cap) in re.captures_iter(text).enumerate() {
        println!("Match {}: '{}'", idx + 1, &cap[0]);
    }
}`;

      case 'java':
        return `// Java
import java.util.regex.*;

public class RegexExample {
    public static void main(String[] args) {
        String pattern = "${pattern.replace(/\\/g, '\\\\')}";
        String text = "${testText.replace(/\n/g, '\\n').replace(/"/g, '\\"')}";

        Pattern p = Pattern.compile(pattern${flags.includes('i') ? ', Pattern.CASE_INSENSITIVE' : ''});
        Matcher m = p.matcher(text);

        int count = 1;
        while (m.find()) {
            System.out.printf("Match %d: '%s' at [%d, %d]%n", count++, m.group(), m.start(), m.end());
        }
    }
}`;

      case 'csharp':
        return `// C# (.NET)
using System;
using System.Text.RegularExpressions;

class Program {
    static void Main() {
        string pattern = @"${pattern}";
        string text = @"${testText.replace(/"/g, '""')}";

        RegexOptions options = RegexOptions.None${flags.includes('i') ? ' | RegexOptions.IgnoreCase' : ''}${flags.includes('m') ? ' | RegexOptions.Multiline' : ''};
        MatchCollection matches = Regex.Matches(text, pattern, options);

        int idx = 1;
        foreach (Match match in matches) {
            Console.WriteLine($"Match {idx++}: '{match.Value}' at index {match.Index}");
        }
    }
}`;

      case 'php':
        return `<?php
// PHP
$pattern = '/${pattern.replace(/\//g, '\\/')}/${flags}';
$text = <<<'EOD'
${testText}
EOD;

if (preg_match_all($pattern, $text, $matches, PREG_SET_ORDER)) {
    foreach ($matches as $i => $match) {
        echo "Match " . ($i + 1) . ": " . $match[0] . "\\n";
    }
}
?>`;

      default:
        return '';
    }
  };

  const copyToClipboard = (text: string, isLink: boolean) => {
    navigator.clipboard.writeText(text);
    if (isLink) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-surface border border-border-subtle rounded-2xl shadow-2xl overflow-hidden p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Share & Export Pattern</h3>
              <p className="text-xs text-foreground-muted">Generate shareable URL or export production code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shareable Link Section */}
        <div className="mt-5 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-foreground-muted flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" /> Shareable Link (State Encoded)
          </label>
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-surface-subtle border border-border-subtle">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full bg-transparent px-3 text-xs font-mono text-foreground focus:outline-none overflow-hidden text-ellipsis whitespace-nowrap"
            />
            <button
              onClick={() => copyToClipboard(shareUrl, true)}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary-hover flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Code Export Section */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-foreground-muted flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5" /> Production Code Snippet
            </label>
            <div className="flex items-center gap-1">
              {(['javascript', 'python', 'go', 'rust', 'java', 'csharp', 'php'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLang(lang)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    selectedLang === lang
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-foreground-muted hover:text-foreground hover:bg-surface-elevated'
                  }`}
                >
                  {lang === 'csharp' ? 'C#' : lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="relative rounded-xl bg-muted/60 border border-border overflow-hidden">
            <pre className="p-4 text-xs font-mono text-foreground overflow-x-auto max-h-56 leading-relaxed">
              <code>{getCodeSnippet(selectedLang)}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(getCodeSnippet(selectedLang), false)}
              className="absolute top-3 right-3 p-2 rounded-lg bg-surface-elevated/80 hover:bg-surface-elevated text-foreground-muted hover:text-foreground border border-border-subtle transition-all backdrop-blur-sm"
              title="Copy Code"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-medium rounded-xl bg-surface-elevated hover:bg-surface-elevated/80 text-foreground transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
