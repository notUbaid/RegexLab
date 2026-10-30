import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { RegexAnalysisResult } from '../engine/types';
import { Railroad } from './Railroad';
import { AstTree } from './AstTree';
import { TraceDebugger } from './TraceDebugger';
import { PerformancePane } from './PerformancePane';
import { CompatibilityPane } from './CompatibilityPane';
import { ExplanationPane } from './ExplanationPane';
import { soundFX } from '../utils/soundEffects';

export type InspectorTab =
  | 'visualizer'
  | 'ast'
  | 'debugger'
  | 'performance'
  | 'compatibility'
  | 'explanation';

interface InspectorProps {
  activeTab: InspectorTab;
  onSelectTab: (tab: InspectorTab) => void;
  analysis: RegexAnalysisResult;
  testText: string;
  pattern: string;
  flags: string;
  hoveredTokenId: string | null;
  onHoverToken: (id: string | null) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onApplyFix?: (pattern: string, flags: string) => void;
}

const TABS: { id: InspectorTab; label: string }[] = [
  { id: 'visualizer', label: 'Visualizer' },
  { id: 'ast', label: 'AST' },
  { id: 'debugger', label: 'Debugger' },
  { id: 'performance', label: 'Performance' },
  { id: 'compatibility', label: 'Compatibility' },
  { id: 'explanation', label: 'Explanation' },
];

export const Inspector: React.FC<InspectorProps> = ({
  activeTab,
  onSelectTab,
  analysis,
  testText,
  pattern,
  flags,
  hoveredTokenId,
  onHoverToken,
  isCollapsed,
  onToggleCollapse,
  onApplyFix,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const heightClass = isCollapsed
    ? 'h-9'
    : isExpanded
    ? 'h-96'
    : 'h-64';

  return (
    <div
      className={`border-t border-border bg-surface flex flex-col shrink-0 select-none transition-all duration-200 ${heightClass}`}
    >
      {/* Tab Bar Header (Text-only tabs, no icon soup) */}
      <div className="h-9 px-3 border-b border-border bg-surface-subtle flex items-center justify-between text-xs">
        <div className="flex items-center gap-0.5">
          {TABS.map((t) => {
            const isActive = activeTab === t.id && !isCollapsed;
            return (
              <button
                key={t.id}
                onClick={() => {
                  soundFX.playTab();
                  onSelectTab(t.id);
                  if (isCollapsed) onToggleCollapse();
                }}
                className={`px-3 py-1 rounded text-xs transition-all ${
                  isActive
                    ? 'bg-surface-elevated text-foreground font-semibold border border-border shadow-sm'
                    : 'text-foreground-muted hover:text-foreground hover:bg-surface'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Height Controls & Collapse Toggle */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono text-foreground-dim hidden sm:inline mr-1">
            Inspector
          </span>
          {!isCollapsed && (
            <button
              onClick={() => {
                soundFX.playLatch();
                setIsExpanded(!isExpanded);
              }}
              className="p-1 rounded text-foreground-dim hover:text-foreground hover:bg-surface-elevated transition-colors"
              title={isExpanded ? 'Restore height' : 'Expand height (h-96)'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
          <button
            onClick={() => {
              soundFX.playLatch();
              onToggleCollapse();
            }}
            className="p-1 rounded text-foreground-dim hover:text-foreground hover:bg-surface-elevated transition-colors"
            title={isCollapsed ? 'Expand Inspector' : 'Collapse Inspector'}
          >
            {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Pane Content */}
      {!isCollapsed && (
        <div className="flex-1 min-h-0 overflow-hidden animate-tab-enter">
          {activeTab === 'visualizer' && (
            <Railroad
              tokens={analysis.tokens}
              hoveredTokenId={hoveredTokenId}
              onHoverToken={(id) => {
                if (id) soundFX.playHoverPlink();
                onHoverToken(id);
              }}
            />
          )}

          {activeTab === 'ast' && (
            <AstTree
              ast={analysis.ast}
              hoveredTokenId={hoveredTokenId}
              onHoverToken={(id) => {
                if (id) soundFX.playHoverPlink();
                onHoverToken(id);
              }}
            />
          )}

          {activeTab === 'debugger' && (
            <TraceDebugger
              trace={analysis.trace}
              testText={testText}
              pattern={pattern}
              flags={flags}
              onApplyFix={onApplyFix}
            />
          )}

          {activeTab === 'performance' && (
            <PerformancePane
              complexity={analysis.complexity}
              pattern={pattern}
              onApplyAlternative={(alt) => onApplyFix && onApplyFix(alt, flags)}
            />
          )}

          {activeTab === 'compatibility' && (
            <CompatibilityPane compatibility={analysis.compatibility} />
          )}

          {activeTab === 'explanation' && (
            <ExplanationPane
              explanation={analysis.explanation}
              hoveredTokenId={hoveredTokenId}
              onHoverToken={(id) => {
                if (id) soundFX.playHoverPlink();
                onHoverToken(id);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
