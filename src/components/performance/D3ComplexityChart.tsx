import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface D3ComplexityChartProps {
  riskScore: number;
  complexityCategory: string;
  className?: string;
}

export const D3ComplexityChart: React.FC<D3ComplexityChartProps> = ({
  riskScore,
  complexityCategory,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = (svgRef.current.clientWidth || 600) - margin.left - margin.right;
    const height = 240 - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Generate curve points (N from 1 to 20)
    const dataPoints = d3.range(1, 21);

    const linearData = dataPoints.map(n => ({ x: n, y: n * 2 }));
    const polyData = dataPoints.map(n => ({ x: n, y: Math.pow(n, 1.8) * 1.5 }));
    const expData = dataPoints.map(n => ({ x: n, y: Math.min(600, Math.pow(1.5, n) * 1.5) }));

    const isExp = complexityCategory.includes('Exponential') || riskScore > 60;
    const isPoly = complexityCategory.includes('Polynomial');

    const xScale = d3.scaleLinear().domain([1, 20]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 300]).range([height, 0]);

    // Gridlines
    g.append('g')
      .attr('class', 'grid')
      .attr('stroke', '#334155')
      .attr('stroke-opacity', 0.2)
      .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(() => ''));

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(10))
      .attr('color', '#64748b')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '10px');

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(6))
      .attr('color', '#64748b')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '10px');

    // Axis Labels
    svg.append('text')
      .attr('x', width / 2 + margin.left)
      .attr('y', height + margin.top + 34)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '11px')
      .text('Input String Length (N characters)');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2 - margin.top)
      .attr('y', 14)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '11px')
      .text('Execution Steps');

    const lineGenerator = d3.line<{ x: number; y: number }>()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveMonotoneX);

    // Linear Curve (Safe)
    g.append('path')
      .datum(linearData)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', isExp || isPoly ? '3,3' : 'none')
      .attr('opacity', isExp || isPoly ? 0.4 : 1)
      .attr('d', lineGenerator);

    // Polynomial Curve (Moderate)
    g.append('path')
      .datum(polyData)
      .attr('fill', 'none')
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', isPoly ? 'none' : '3,3')
      .attr('opacity', isPoly ? 1 : 0.4)
      .attr('d', lineGenerator);

    // Exponential Curve (Potential slow loop)
    const expPath = g.append('path')
      .datum(expData)
      .attr('fill', 'none')
      .attr('stroke', '#ef4444')
      .attr('stroke-width', isExp ? 3.5 : 2)
      .attr('stroke-dasharray', isExp ? 'none' : '3,3')
      .attr('opacity', isExp ? 1 : 0.4)
      .attr('d', lineGenerator);

    // If current pattern is exponential, add animated marker
    if (isExp) {
      g.append('circle')
        .attr('cx', xScale(15))
        .attr('cy', yScale(expData[14].y))
        .attr('r', 5)
        .attr('fill', '#ef4444');

      g.append('text')
        .attr('x', xScale(15) - 10)
        .attr('y', yScale(expData[14].y) - 12)
        .attr('fill', '#ef4444')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .text('Warning: Slow loop detected!');
    }
  }, [riskScore, complexityCategory]);

  return (
    <div className={`relative w-full rounded-xl bg-surface border border-border p-4 shadow-xl ${className}`}>
      <div className="flex items-center justify-between pb-2 border-b border-border mb-2">
        <span className="text-xs font-bold text-foreground-muted">
          Speed & Step Growth Chart
        </span>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-0.5 bg-emerald-400" /> Fast (linear)
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2 h-0.5 bg-amber-400" /> Normal
          </span>
          <span className="flex items-center gap-1 text-red-400 font-bold">
            <span className="w-2 h-0.5 bg-red-400" /> Slow Loop Warning
          </span>
        </div>
      </div>

      <svg
        ref={svgRef}
        className="w-full h-[240px]"
      />
    </div>
  );
};
