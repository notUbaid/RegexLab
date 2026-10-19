import React, { useState } from 'react';
import { RegexInput } from './RegexInput';
import { TestTextEditor } from './TestTextEditor';
import { MatchInspector } from './MatchInspector';
import { ReplacePreview } from './ReplacePreview';
import { LiveTranslator } from '../translator/LiveTranslator';
import { DoubleBezelCard } from '../common/DoubleBezelCard';
import { Layers, Languages, ArrowRightLeft } from 'lucide-react';

export const PlaygroundView: React.FC = () => {
  const [rightPanelTab, setRightPanelTab] = useState<'matches' | 'explanation'>('matches');

  return (
    <div className="space-y-4">
      {/* Top Regex Editor Card */}
      <DoubleBezelCard innerClassName="p-5">
        <RegexInput />
      </DoubleBezelCard>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Test String Canvas & Replace Sandbox (7 cols) */}
        <div className="lg:col-span-7 space-y-4 flex flex-col">
          <DoubleBezelCard innerClassName="p-5 flex-1 flex flex-col min-h-[380px]">
            <TestTextEditor />
          </DoubleBezelCard>

          <ReplacePreview />
        </div>

        {/* Right Column: Match Inspector & Live Translator Tabs (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <DoubleBezelCard innerClassName="p-5 flex-1 flex flex-col min-h-[500px]">
            {/* Tab switch header */}
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle mb-3">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-subtle border border-border-subtle">
                <button
                  onClick={() => setRightPanelTab('matches')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    rightPanelTab === 'matches'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" /> Matches
                </button>
                <button
                  onClick={() => setRightPanelTab('explanation')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    rightPanelTab === 'explanation'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  <Languages className="w-3.5 h-3.5" /> Explanation
                </button>
              </div>

              <span className="text-[10px] text-foreground-dim font-medium flex items-center gap-1">
                <ArrowRightLeft className="w-3 h-3 text-primary" /> Real-time
              </span>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-hidden">
              {rightPanelTab === 'matches' ? <MatchInspector /> : <LiveTranslator />}
            </div>
          </DoubleBezelCard>
        </div>
      </div>
    </div>
  );
};
