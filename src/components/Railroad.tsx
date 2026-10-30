import React, { useMemo } from 'react';
import { RegexToken } from '../engine/types';

interface RailroadProps {
  tokens: RegexToken[];
  hoveredTokenId: string | null;
  onHoverToken: (id: string | null) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  character_class: 'class',
  quantifier: 'quant',
  alternation: 'or',
  lookaround: 'look',
  literal: 'lit',
  anchor: 'pos',
  group: 'group',
  special: 'esc',
};

export const Railroad: React.FC<RailroadProps> = ({
  tokens,
  hoveredTokenId,
  onHoverToken,
}) => {
  // Compute positions for SVG rendering
  const layout = useMemo(() => {
    let currentX = 50;
    const centerY = 60;
    const nodeSpacing = 18;
    const items = tokens.map((t) => {
      const textWidth = Math.max(44, t.raw.length * 10 + 20);
      const x = currentX;
      currentX += textWidth + nodeSpacing;
      return {
        token: t,
        x,
        y: centerY - 14,
        w: textWidth,
        h: 28,
        midX: x + textWidth / 2,
      };
    });

    const totalWidth = Math.max(600, currentX + 60);
    return { items, totalWidth, centerY };
  }, [tokens]);

  if (tokens.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-foreground-dim font-mono text-xs">
        Enter a pattern above to generate the railroad state graph
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-x-auto overflow-y-hidden bg-surface p-3 flex flex-col justify-center select-none font-mono">
      <div className="flex items-center justify-between mb-2 text-[11px] text-foreground-dim">
        <span>Railroad State Diagram</span>
        <span>{tokens.length} state nodes</span>
      </div>

      <div className="flex-1 min-h-[140px] flex items-center">
        <svg
          width={layout.totalWidth}
          height={120}
          className="overflow-visible"
        >
          {/* Main spine line */}
          <line
            x1={10}
            y1={layout.centerY}
            x2={layout.totalWidth - 20}
            y2={layout.centerY}
            stroke="currentColor"
            className="text-border stroke-2"
          />

          {/* Start terminal circle */}
          <circle
            cx={25}
            cy={layout.centerY}
            r={6}
            className="fill-foreground text-background"
          />
          <text
            x={25}
            y={layout.centerY - 12}
            textAnchor="middle"
            className="fill-foreground-dim text-[10px]"
          >
            START
          </text>

          {/* Nodes */}
          {layout.items.map(({ token, x, y, w, h }) => {
            const isHovered = hoveredTokenId === token.id;
            const isGroup = token.category === 'group';
            const isQuant = token.category === 'quantifier';
            const isAnchor = token.category === 'anchor';

            let fillClass = 'fill-surface-elevated stroke-border';
            let textClass = 'fill-foreground';

            if (isHovered) {
              fillClass = 'fill-amber-400/20 stroke-amber-400 stroke-2';
              textClass = 'fill-amber-300 font-bold';
            } else if (isGroup) {
              fillClass = 'fill-violet-500/10 stroke-violet-500/40';
              textClass = 'fill-violet-300';
            } else if (isQuant) {
              fillClass = 'fill-amber-500/10 stroke-amber-500/40';
              textClass = 'fill-amber-300';
            } else if (isAnchor) {
              fillClass = 'fill-orange-500/10 stroke-orange-500/40';
              textClass = 'fill-orange-300';
            }

            return (
              <g
                key={token.id}
                onMouseEnter={() => onHoverToken(token.id)}
                onMouseLeave={() => onHoverToken(null)}
                className="cursor-pointer transition-all"
              >
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  rx={4}
                  className={`${fillClass} transition-colors`}
                />
                <text
                  x={x + w / 2}
                  y={y + 18}
                  textAnchor="middle"
                  className={`${textClass} text-xs font-mono select-none pointer-events-none`}
                >
                  {token.raw}
                </text>
                <text
                  x={x + w / 2}
                  y={y - 6}
                  textAnchor="middle"
                  className="fill-foreground-dim text-[9px] uppercase tracking-wider font-semibold pointer-events-none"
                >
                  {CATEGORY_LABELS[token.category] || token.category}
                </text>
              </g>
            );
          })}

          {/* End terminal double circle */}
          <circle
            cx={layout.totalWidth - 30}
            cy={layout.centerY}
            r={8}
            className="fill-transparent stroke-foreground stroke-2"
          />
          <circle
            cx={layout.totalWidth - 30}
            cy={layout.centerY}
            r={4}
            className="fill-foreground"
          />
          <text
            x={layout.totalWidth - 30}
            y={layout.centerY - 14}
            textAnchor="middle"
            className="fill-foreground-dim text-[10px]"
          >
            END
          </text>
        </svg>
      </div>
    </div>
  );
};
