import React, { useState } from 'react';
import { AstNode } from '../engine/types';
import { soundFX } from '../utils/soundEffects';

interface AstTreeProps {
  ast: AstNode;
  hoveredTokenId: string | null;
  onHoverToken: (id: string | null) => void;
}

interface AstNodeRowProps {
  node: AstNode;
  depth: number;
  hoveredTokenId: string | null;
  onHoverToken: (id: string | null) => void;
}

const AstNodeRow: React.FC<AstNodeRowProps> = ({
  node,
  depth,
  hoveredTokenId,
  onHoverToken,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const isHovered = hoveredTokenId === node.id;

  const categoryColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'group':
        return 'text-violet-400 bg-violet-500/10 border-violet-500/30';
      case 'characterclass':
        return 'text-teal-400 bg-teal-500/10 border-teal-500/30';
      case 'quantifier':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'anchor':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'literal':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'alternation':
      case 'disjunction':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      default:
        return 'text-foreground-muted bg-surface-elevated border-border';
    }
  };

  return (
    <div className="font-mono text-xs select-none">
      <div
        onMouseEnter={() => {
          soundFX.playHoverPlink(1.0 + depth * 0.12);
          onHoverToken(node.id);
        }}
        onMouseLeave={() => onHoverToken(null)}
        onClick={() => {
          if (hasChildren) {
            soundFX.playLatch();
            setCollapsed(!collapsed);
          }
        }}
        className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer transition-colors ${
          isHovered
            ? 'bg-amber-400/15 text-amber-300'
            : 'hover:bg-surface-elevated text-foreground'
        }`}
        style={{ paddingLeft: `${Math.max(8, depth * 18)}px` }}
      >
        {/* Expand/collapse marker or dot */}
        {hasChildren ? (
          <span className="w-3 text-center text-[10px] text-foreground-dim">
            {collapsed ? '▶' : '▼'}
          </span>
        ) : (
          <span className="w-3 text-center text-foreground-dim/40">•</span>
        )}

        {/* Node Type Badge */}
        <span
          className={`px-1.5 py-0.2 rounded border text-[10px] uppercase font-semibold tracking-wider ${categoryColor(
            node.type
          )}`}
        >
          {node.type}
        </span>

        {/* Node Label / Description */}
        <span className="text-foreground font-medium text-[11px] truncate max-w-sm">
          {node.label}
        </span>

        {/* Raw Regex Segment */}
        {node.raw && (
          <code className="text-foreground-dim text-[11px] bg-surface-subtle px-1 rounded border border-border/50">
            {node.raw}
          </code>
        )}

        {/* Byte Span */}
        <span className="ml-auto text-[10px] text-foreground-dim font-mono">
          [{node.start}..{node.end}]
        </span>
      </div>

      {/* Children */}
      {hasChildren && !collapsed && (
        <div className="border-l border-border/40 ml-4">
          {node.children!.map((child) => (
            <AstNodeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              hoveredTokenId={hoveredTokenId}
              onHoverToken={onHoverToken}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const AstTree: React.FC<AstTreeProps> = ({
  ast,
  hoveredTokenId,
  onHoverToken,
}) => {
  if (!ast || (!ast.children && !ast.type)) {
    return (
      <div className="h-full flex items-center justify-center text-foreground-dim font-mono text-xs">
        Enter a pattern above to see the syntax tree
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-surface p-3 space-y-1">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border text-[11px] text-foreground-dim">
        <span>Syntax Tree (AST)</span>
        <span>Click node to expand/collapse</span>
      </div>
      <AstNodeRow
        node={ast}
        depth={0}
        hoveredTokenId={hoveredTokenId}
        onHoverToken={onHoverToken}
      />
    </div>
  );
};
