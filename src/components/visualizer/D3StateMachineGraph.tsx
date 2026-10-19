import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { RegexToken, ExecutionStep } from '../../types/regex';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';

interface D3StateMachineGraphProps {
  tokens: RegexToken[];
  currentStep: ExecutionStep | null;
  className?: string;
}

interface GraphNode {
  id: string;
  label: string;
  type: 'start' | 'token' | 'accept' | 'backtrack';
  token?: RegexToken;
  x: number;
  y: number;
}

interface GraphLink {
  source: string;
  target: string;
  label?: string;
  isBacktrack?: boolean;
}

export const D3StateMachineGraph: React.FC<D3StateMachineGraphProps> = ({
  tokens,
  currentStep,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [zoomScale, setZoomScale] = useState(1);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const width = svgRef.current.clientWidth || 800;
    const height = 280;

    // Define defs (arrowheads, glow filters)
    const defs = svg.append('defs');

    // Arrow marker standard
    defs.append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 22)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto-start-reverse')
      .append('path')
      .attr('d', 'M 0 1.5 L 10 5 L 0 8.5 z')
      .attr('fill', '#64748b');

    // Arrow marker active
    defs.append('marker')
      .attr('id', 'arrow-active')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 24)
      .attr('refY', 5)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto-start-reverse')
      .append('path')
      .attr('d', 'M 0 1.5 L 10 5 L 0 8.5 z')
      .attr('fill', '#38bdf8');

    // Glow filter
    const filter = defs.append('filter')
      .attr('id', 'node-glow')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'blur');
    filter.append('feComposite')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'blur')
      .attr('operator', 'over');

    // Build Node & Link lists
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    // Start node
    nodes.push({
      id: 'node-start',
      label: 'START',
      type: 'start',
      x: 60,
      y: height / 2,
    });

    const spacing = Math.max(90, Math.min(140, (width - 160) / Math.max(1, tokens.length + 1)));

    tokens.forEach((token, idx) => {
      nodes.push({
        id: `node-${token.id}`,
        label: token.raw.length > 5 ? `${token.raw.slice(0, 4)}...` : token.raw,
        type: 'token',
        token,
        x: 60 + (idx + 1) * spacing,
        y: height / 2 + (idx % 2 === 1 ? -15 : 15),
      });

      // Forward link
      const prevId = idx === 0 ? 'node-start' : `node-${tokens[idx - 1].id}`;
      links.push({
        source: prevId,
        target: `node-${token.id}`,
        label: `T${idx + 1}`,
      });
    });

    // Accept node
    const lastTokenId = tokens.length > 0 ? `node-${tokens[tokens.length - 1].id}` : 'node-start';
    nodes.push({
      id: 'node-accept',
      label: 'ACCEPT',
      type: 'accept',
      x: 60 + (tokens.length + 1) * spacing,
      y: height / 2,
    });

    links.push({
      source: lastTokenId,
      target: 'node-accept',
      label: 'match',
    });

    // Create zoom container
    const g = svg.append('g').attr('class', 'graph-container');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomScale(event.transform.k);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // Map for quick node lookup
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // Draw Links
    const linkElements = g.append('g')
      .attr('class', 'links')
      .selectAll('path')
      .data(links)
      .enter()
      .append('path')
      .attr('d', (d) => {
        const s = nodeMap.get(d.source)!;
        const t = nodeMap.get(d.target)!;
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.2;
        return `M ${s.x} ${s.y} A ${dr} ${dr} 0 0,1 ${t.x} ${t.y}`;
      })
      .attr('fill', 'none')
      .attr('stroke', '#475569')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrow)');

    // Active token determination
    const activeToken = currentStep?.token;
    const activeNodeId = currentStep?.action === 'success' 
      ? 'node-accept' 
      : activeToken 
      ? `node-${activeToken.id}` 
      : 'node-start';

    // Highlight active link if matching
    linkElements
      .attr('stroke', (d) => (d.target === activeNodeId ? '#38bdf8' : '#334155'))
      .attr('stroke-width', (d) => (d.target === activeNodeId ? 3 : 1.5))
      .attr('marker-end', (d) => (d.target === activeNodeId ? 'url(#arrow-active)' : 'url(#arrow)'));

    // Animated pulse on active link
    if (activeNodeId) {
      const activeLink = links.find(l => l.target === activeNodeId);
      if (activeLink) {
        const s = nodeMap.get(activeLink.source);
        const t = nodeMap.get(activeLink.target);
        if (s && t) {
          const pulse = g.append('circle')
            .attr('r', 4.5)
            .attr('fill', '#38bdf8')
            .attr('cx', s.x)
            .attr('cy', s.y)
            .attr('filter', 'url(#node-glow)');

          pulse.transition()
            .duration(500)
            .attr('cx', t.x)
            .attr('cy', t.y)
            .remove();
        }
      }
    }

    // Draw Nodes
    const nodeGroups = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('transform', (d) => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer');

    // Outer node circle
    nodeGroups.append('circle')
      .attr('r', (d) => (d.type === 'token' ? 18 : 22))
      .attr('fill', (d) => {
        if (d.id === activeNodeId) return '#0369a1';
        if (d.type === 'start') return '#1e293b';
        if (d.type === 'accept') return '#064e3b';
        return '#0f172a';
      })
      .attr('stroke', (d) => {
        if (d.id === activeNodeId) return '#38bdf8';
        if (d.type === 'start') return '#64748b';
        if (d.type === 'accept') return '#10b981';
        return '#334155';
      })
      .attr('stroke-width', (d) => (d.id === activeNodeId ? 3 : 1.5))
      .attr('filter', (d) => (d.id === activeNodeId ? 'url(#node-glow)' : null));

    // Active pulsing ring
    nodeGroups.filter((d) => d.id === activeNodeId)
      .append('circle')
      .attr('r', 28)
      .attr('fill', 'none')
      .attr('stroke', '#38bdf8')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.8)
      .transition()
      .duration(1000)
      .ease(d3.easeCubicOut)
      .attr('r', 36)
      .attr('opacity', 0)
      .remove();

    // Node labels
    nodeGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', (d) => (d.id === activeNodeId ? '#f8fafc' : '#cbd5e1'))
      .attr('font-size', (d) => (d.type === 'token' ? '12px' : '9px'))
      .attr('font-weight', '700')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text((d) => d.label);

    // Node subtitle
    nodeGroups.filter((d) => d.type === 'token' && !!d.token)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '2.6em')
      .attr('fill', '#94a3b8')
      .attr('font-size', '9px')
      .attr('font-family', 'Inter, sans-serif')
      .text((d) => d.token!.title.slice(0, 10));

  }, [tokens, currentStep]);

  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().call(zoomBehaviorRef.current.scaleBy, 1.25);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().call(zoomBehaviorRef.current.scaleBy, 0.8);
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  };

  return (
    <div className={`relative w-full rounded-2xl bg-slate-950/80 border border-slate-800/80 p-2 overflow-hidden shadow-2xl ${className}`}>
      {/* Top Overlay Controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 shadow-lg">
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="text-[10px] font-mono font-bold text-slate-300 px-1">
          {Math.round(zoomScale * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleResetZoom}
          title="Reset Zoom & Pan"
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-all border-l border-slate-700/60 pl-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-[11px] font-mono font-bold tracking-wider text-slate-400 uppercase">
          D3 Finite Automaton State Graph
        </span>
      </div>

      <svg
        ref={svgRef}
        className="w-full h-[280px] cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};
