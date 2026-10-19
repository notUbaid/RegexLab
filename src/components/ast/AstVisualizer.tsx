import React, { useMemo, useState } from 'react';
import { 
  GitBranch, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronRight, 
  ChevronDown, 
  Code2, 
  Layers, 
  Info,
  Maximize2,
  FolderTree
} from 'lucide-react';
import { useRegexStore } from '../../store/useRegexStore';
import { buildRegexAst } from '../../parser/ast';
import { AstNode } from '../../types/regex';
import { DoubleBezelCard } from '../common/DoubleBezelCard';

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Expression: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/30' },
  Group: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30' },
  CharacterClass: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/30' },
  Quantifier: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  Anchor: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  Literal: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  Lookaround: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
  Alternative: { bg: 'bg-amber-600/10', text: 'text-amber-300', border: 'border-amber-600/30' },
  Disjunction: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
};

interface TreeNodeProps {
  node: AstNode;
  depth: number;
  selectedId: string | null;
  onSelect: (node: AstNode) => void;
  collapsedMap: Record<string, boolean>;
  onToggleCollapse: (id: string) => void;
}

const TreeNodeItem: React.FC<TreeNodeProps> = ({
  node,
  depth,
  selectedId,
  onSelect,
  collapsedMap,
  onToggleCollapse,
}) => {
  const isSelected = selectedId === node.id;
  const hasChildren = node.children && node.children.length > 0;
  const isCollapsed = collapsedMap[node.id] || false;
  const colors = TYPE_COLORS[node.type] || { bg: 'bg-muted', text: 'text-foreground', border: 'border-border' };

  return (
    <div className="relative pl-6">
      {/* Branch Connector lines */}
      {depth > 0 && (
        <div className="absolute left-2.5 top-0 bottom-0 w-px bg-border/80" />
      )}
      {depth > 0 && (
        <div className="absolute left-2.5 top-5 w-3.5 h-px bg-border/80" />
      )}

      {/* Node Pill Card */}
      <div className="py-1.5 flex items-center gap-2">
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse(node.id);
            }}
            className="w-5 h-5 rounded hover:bg-muted flex items-center justify-center text-foreground/60 hover:text-foreground transition-all shrink-0 z-10"
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        ) : (
          <div className="w-5 h-5 flex items-center justify-center shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-foreground/30" />
          </div>
        )}

        <button
          onClick={() => onSelect(node)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs text-left transition-all group ${
            isSelected
              ? 'bg-primary/20 border-primary shadow-sm shadow-primary/20 ring-1 ring-primary'
              : 'bg-card hover:bg-muted/60 border-border/70 hover:border-border'
          }`}
        >
          <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border ${colors.bg} ${colors.text} ${colors.border}`}>
            {node.type}
          </span>
          <span className="font-semibold text-foreground">
            {node.label}
          </span>
          {node.raw && (
            <code className="px-1.5 py-0.5 rounded bg-muted/80 font-mono text-xs text-foreground/70">
              {node.raw}
            </code>
          )}
          <span className="text-[11px] font-mono text-foreground/40 ml-1">
            [{node.start}:{node.end}]
          </span>
        </button>
      </div>

      {/* Children list */}
      {hasChildren && !isCollapsed && (
        <div className="space-y-0.5">
          {node.children!.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              collapsedMap={collapsedMap}
              onToggleCollapse={onToggleCollapse}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const AstVisualizer: React.FC = () => {
  const { pattern, selectedAstNodeId, setSelectedAstNodeId, setHoveredTokenId } = useRegexStore();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});
  const [activeSelectedNode, setActiveSelectedNode] = useState<AstNode | null>(null);

  const astRoot = useMemo(() => {
    return buildRegexAst(pattern);
  }, [pattern]);

  const handleSelectNode = (node: AstNode) => {
    setSelectedAstNodeId(node.id);
    setActiveSelectedNode(node);
  };

  const handleToggleCollapse = (id: string) => {
    setCollapsedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleExpandAll = () => {
    setCollapsedMap({});
  };

  const handleCollapseAll = () => {
    const newMap: Record<string, boolean> = {};
    function collect(node: AstNode) {
      if (node.children && node.children.length > 0) {
        newMap[node.id] = true;
        node.children.forEach(collect);
      }
    }
    if (astRoot.children) {
      astRoot.children.forEach(collect);
    }
    setCollapsedMap(newMap);
  };

  return (
    <div className="max-w-[1120px] mx-auto px-6 sm:px-10 pt-4 pb-24 space-y-10">
      {/* Top Header Card */}
      <DoubleBezelCard innerClassName="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[34px] leading-none font-semibold tracking-[-0.03em] text-foreground">
            Regex Tree: Parts of Your Pattern
          </h1>
          <p className="text-[15px] text-foreground-muted mt-3 max-w-xl leading-snug">
            Break down your regex pattern into simple pieces like letters, numbers, repeating quantifiers, and groups.
          </p>
        </div>

        {/* Tree Controls */}
        <div className="flex items-center gap-2 bg-muted/60 p-2 rounded-xl border border-border/80 self-stretch md:self-auto justify-between md:justify-start">
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
            title="Zoom Out"
            className="p-2 rounded-lg hover:bg-card text-foreground/70 hover:text-foreground transition-all"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono px-1 font-semibold text-foreground/70">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.1))}
            title="Zoom In"
            className="p-2 rounded-lg hover:bg-card text-foreground/70 hover:text-foreground transition-all"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            title="Reset Zoom"
            className="p-2 rounded-lg hover:bg-card text-foreground/70 hover:text-foreground transition-all border-l border-border/60 pl-2"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="border-l border-border/60 pl-2 flex items-center gap-1">
            <button
              onClick={handleExpandAll}
              className="px-2.5 py-1 rounded text-xs font-semibold hover:bg-card text-foreground/70 hover:text-foreground transition-all"
            >
              Expand All
            </button>
            <button
              onClick={handleCollapseAll}
              className="px-2.5 py-1 rounded text-xs font-semibold hover:bg-card text-foreground/70 hover:text-foreground transition-all"
            >
              Collapse All
            </button>
          </div>
        </div>
      </DoubleBezelCard>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Tree Canvas */}
        <div className="lg:col-span-8">
          <DoubleBezelCard innerClassName="p-6 min-h-[560px] max-h-[750px] overflow-auto flex flex-col justify-between">
            <div 
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
              className="transition-transform duration-150 space-y-2"
            >
              <TreeNodeItem
                node={astRoot}
                depth={0}
                selectedId={selectedAstNodeId}
                onSelect={handleSelectNode}
                collapsedMap={collapsedMap}
                onToggleCollapse={handleToggleCollapse}
              />
            </div>

            <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs text-foreground/50 font-mono">
              <span>Click any node to inspect detailed syntax coordinates</span>
              <span>Root: {astRoot.children?.length ?? 0} direct children</span>
            </div>
          </DoubleBezelCard>
        </div>

        {/* Right Column: Node Detail Inspector */}
        <div className="lg:col-span-4 space-y-6">
          <DoubleBezelCard innerClassName="p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                AST Node Inspector
              </h3>
            </div>

            {activeSelectedNode ? (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-foreground/60 font-semibold uppercase">Node Type</span>
                    <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold border ${TYPE_COLORS[activeSelectedNode.type]?.bg} ${TYPE_COLORS[activeSelectedNode.type]?.text} ${TYPE_COLORS[activeSelectedNode.type]?.border}`}>
                      {activeSelectedNode.type}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-foreground">
                    {activeSelectedNode.label}
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                    <span className="text-foreground/60">Raw Regex Slice:</span>
                    <code className="font-mono bg-muted px-2 py-0.5 rounded text-foreground font-bold">
                      {activeSelectedNode.raw || '-'}
                    </code>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                    <span className="text-foreground/60">Character Range:</span>
                    <span className="font-mono text-foreground font-semibold">
                      [{activeSelectedNode.start} .. {activeSelectedNode.end}] ({activeSelectedNode.end - activeSelectedNode.start} chars)
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                    <span className="text-foreground/60">Sub-nodes / Children:</span>
                    <span className="font-mono text-foreground font-semibold">
                      {activeSelectedNode.children?.length ?? 0}
                    </span>
                  </div>
                  {activeSelectedNode.meta && Object.keys(activeSelectedNode.meta).length > 0 && (
                    <div className="pt-2">
                      <span className="text-foreground/60 block mb-1.5 font-semibold">Metadata:</span>
                      <pre className="p-2.5 rounded-lg bg-background border border-border font-mono text-xs text-foreground/80 overflow-x-auto">
                        {JSON.stringify(activeSelectedNode.meta, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center space-y-2 text-foreground/60">
                <Code2 className="w-8 h-8 mx-auto opacity-50" />
                <p className="text-xs">Select any node in the syntax tree to inspect its grammatical properties.</p>
              </div>
            )}
          </DoubleBezelCard>

          {/* Node Category Legend */}
          <DoubleBezelCard innerClassName="p-5 space-y-3">
            <h4 className="text-xs font-bold text-foreground pb-2 border-b border-border">
              Grammar Category Legend
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(TYPE_COLORS).map(([type, color]) => (
                <div key={type} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${color.bg} border ${color.border}`} />
                  <span className="text-foreground/80 font-medium">{type}</span>
                </div>
              ))}
            </div>
          </DoubleBezelCard>
        </div>
      </div>
    </div>
  );
};
