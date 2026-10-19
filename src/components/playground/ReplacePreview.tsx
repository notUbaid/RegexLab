import React, { useState } from 'react';
import { useRegexStore } from '../../store/useRegexStore';
import { RefreshCw, Copy, Check, Sparkles } from 'lucide-react';

export const ReplacePreview: React.FC = () => {
  const { pattern, flags, testText, replacementText, setReplacementText } = useRegexStore();
  const [copied, setCopied] = useState(false);

  const computeReplaced = (): string => {
    if (!pattern) return testText;
    try {
      const rx = new RegExp(pattern, flags);
      return testText.replace(rx, replacementText);
    } catch {
      return testText;
    }
  };

  const replacedOutput = computeReplaced();

  const handleCopy = () => {
    navigator.clipboard.writeText(replacedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const quickPills = [
    { label: '$1', val: '$1', title: 'Insert group 1' },
    { label: '$2', val: '$2', title: 'Insert group 2' },
    { label: '$&', val: '$&', title: 'Insert full match' },
    { label: "$'", val: "$'", title: 'Insert after match' },
    { label: '$`', val: '$`', title: 'Insert before match' },
  ];

  return (
    <div className="p-4 rounded-xl bg-surface-subtle border border-border-subtle space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground-muted flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5 text-primary" /> Regex Substitution / Replace Sandbox
        </label>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-elevated text-xs transition-colors flex items-center gap-1"
          title="Copy replaced text"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="text-xs">{copied ? 'Copied' : 'Copy Result'}</span>
        </button>
      </div>

      {/* Replacement String Input */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative flex items-center rounded-xl bg-surface border border-border-subtle focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
          <span className="pl-3 text-xs text-foreground-dim select-none font-mono">Replace with:</span>
          <input
            type="text"
            value={replacementText}
            onChange={(e) => setReplacementText(e.target.value)}
            placeholder="e.g. [$1] or User: $1"
            className="w-full py-2 px-2.5 bg-transparent text-xs font-mono text-foreground placeholder:text-foreground-dim focus:outline-none"
          />
        </div>

        {/* Quick insertion pills */}
        <div className="hidden sm:flex items-center gap-1">
          {quickPills.map((p) => (
            <button
              key={p.label}
              onClick={() => setReplacementText(replacementText + p.val)}
              title={p.title}
              className="px-2 py-1 rounded-lg bg-surface hover:bg-primary/20 text-foreground-muted hover:text-primary text-[11px] font-mono border border-border-subtle transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Replaced Live Output Box */}
      <div className="rounded-xl bg-muted/50 border border-border/80 p-3 max-h-36 overflow-y-auto">
        <div className="text-[11px] font-semibold text-foreground-dim mb-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-primary" /> Transformed Output:
        </div>
        <pre className="font-mono text-xs text-foreground whitespace-pre-wrap break-all leading-relaxed">
          {replacedOutput}
        </pre>
      </div>
    </div>
  );
};
