import React from 'react';
import { useRegexStore } from '../../store/useRegexStore';
import { translateRegexToHuman, ExplanationBlock } from '../../parser/translator';
import { Languages, Info, Sparkles } from 'lucide-react';

export const LiveTranslator: React.FC = () => {
  const { pattern, hoveredTokenId, setHoveredTokenId } = useRegexStore();
  const blocks = translateRegexToHuman(pattern);

  return (
    <div className="space-y-3 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <label className="text-xs font-semibold text-foreground-muted flex items-center gap-1.5">
          <Languages className="w-3.5 h-3.5 text-primary" /> Natural Language Translator
        </label>
        <span className="text-[11px] text-foreground-dim flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-primary" /> Hover sync active
        </span>
      </div>

      {/* Explanation Blocks list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[200px]">
        {blocks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 rounded-xl bg-surface-subtle/40 border border-dashed border-border-subtle text-center">
            <Info className="w-6 h-6 text-foreground-dim mb-2" />
            <p className="text-xs font-medium text-foreground-muted">Type a pattern above to see its natural English breakdown.</p>
          </div>
        ) : (
          blocks.map((block: ExplanationBlock) => {
            const isHovered = block.tokenIds.some((id) => id === hoveredTokenId);

            return (
              <div
                key={block.id}
                onMouseEnter={() => setHoveredTokenId(block.tokenIds[0])}
                onMouseLeave={() => setHoveredTokenId(null)}
                style={{ marginLeft: `${block.depth * 14}px` }}
                className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isHovered
                    ? 'bg-primary/10 border-primary ring-1 ring-primary shadow-glow-primary'
                    : 'bg-surface-subtle hover:bg-surface-elevated/70 border-border-subtle'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    {block.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold border ${block.badgeColor}`}>
                        {block.badge}
                      </span>
                    )}
                    <h5 className="text-xs font-semibold text-foreground">{block.title}</h5>
                  </div>
                </div>

                <p className="text-xs text-foreground-muted leading-relaxed">{block.summary}</p>
                {block.details && (
                  <p className="text-xs text-foreground-dim font-mono mt-1">{block.details}</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
