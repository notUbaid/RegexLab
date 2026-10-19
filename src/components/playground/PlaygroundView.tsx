import React, { useState } from 'react';
import { RegexInput } from './RegexInput';
import { TestTextEditor } from './TestTextEditor';
import { MatchInspector } from './MatchInspector';
import { ReplacePreview } from './ReplacePreview';
import { LiveTranslator } from '../translator/LiveTranslator';
import { useRegexStore } from '../../store/useRegexStore';

type Tab = 'matches' | 'explain' | 'replace';

export const PlaygroundView: React.FC = () => {
  const [tab, setTab] = useState<Tab>('matches');
  const count = useRegexStore().getMatches().count;
  const tabs: [Tab, string][] = [['matches', 'Matches'], ['explain', 'Explanation'], ['replace', 'Replace']];

  return (
    <div className="space-y-12">
      <RegexInput />
      <TestTextEditor />
      <section aria-label="Results">
        <div role="tablist" className="flex items-baseline gap-7 border-b border-border">
          {tabs.map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
              className={`relative pb-3 text-lg transition-colors ${tab === id ? 'text-foreground font-semibold' : 'text-foreground-dim hover:text-foreground-muted'}`}>
              {label}
              {id === 'matches' && <span className="ml-2 font-mono text-xs text-foreground-dim">{count}</span>}
              {tab === id && <span className="absolute left-0 right-0 -bottom-px h-[3px] bg-hl" />}
            </button>
          ))}
        </div>
        <div className="pt-6">
          {tab === 'matches' && <MatchInspector />}
          {tab === 'explain' && <LiveTranslator />}
          {tab === 'replace' && <ReplacePreview />}
        </div>
      </section>
    </div>
  );
};
