import React from 'react';
import { ExplanationBlock } from '../engine/types';
import { soundFX } from '../utils/soundEffects';

interface ExplanationPaneProps {
  explanation: ExplanationBlock[];
  hoveredTokenId: string | null;
  onHoverToken: (id: string | null) => void;
}

export const ExplanationPane: React.FC<ExplanationPaneProps> = ({
  explanation,
  hoveredTokenId,
  onHoverToken,
}) => {
  if (explanation.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-foreground-dim font-mono text-xs">
        Enter a pattern above to see an explanation
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-surface p-3 select-none font-mono text-xs space-y-2">
      <div className="flex items-center justify-between pb-2 border-b border-border text-[11px] text-foreground-dim">
        <span>Plain English Breakdown</span>
        <span>Hover to highlight token</span>
      </div>

      <div className="space-y-1.5">
        {explanation.map((block) => {
          const isHovered =
            block.tokenIds.some((id) => id === hoveredTokenId) ||
            block.id === hoveredTokenId;

          return (
            <div
              key={block.id}
              onMouseEnter={() => {
                soundFX.playHoverPlink(1.05);
                onHoverToken(block.tokenIds[0] || block.id);
              }}
              onMouseLeave={() => onHoverToken(null)}
              onClick={() => {
                soundFX.playLatch();
                onHoverToken(isHovered ? null : block.tokenIds[0] || block.id);
              }}
              className={`p-2 rounded border transition-colors cursor-pointer ${
                isHovered
                  ? 'bg-amber-400/15 border-amber-400/40 text-foreground'
                  : 'bg-surface-subtle border-border/60 hover:bg-surface-elevated text-foreground-muted'
              }`}
              style={{ marginLeft: `${Math.min(24, block.depth * 12)}px` }}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-semibold text-foreground text-[11px]">
                  {block.title}
                </span>
                {block.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded border text-[10px] uppercase font-semibold ${
                      block.badgeColor || 'text-foreground-dim bg-surface border-border'
                    }`}
                  >
                    {block.badge}
                  </span>
                )}
              </div>
              <p className="text-[11px] leading-relaxed text-foreground-muted">
                {block.summary}
              </p>
              {block.details && (
                <p className="text-[10px] text-foreground-dim mt-1">
                  {block.details}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
