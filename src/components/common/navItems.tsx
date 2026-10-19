import React from 'react';
import { Play, Workflow, Blocks, Network, Bug, Gauge, Globe2, Library, GitCompare, Trophy } from 'lucide-react';
import { AppView } from '../../types/regex';

export interface NavItem { view: AppView; label: string; hint: string; icon: React.ReactNode }
const i = 'w-4 h-4';
export const NAV_GROUPS: { title?: string; items: NavItem[] }[] = [
  { items: [{ view: 'playground', label: 'Playground', hint: 'Write a pattern and see matches live', icon: <Play className={i} /> }] },
  { title: 'Understand', items: [
    { view: 'visualizer', label: 'Step by step', hint: 'Watch the engine match one character at a time', icon: <Workflow className={i} /> },
    { view: 'ast', label: 'Pattern tree', hint: 'See how a pattern is structured', icon: <Network className={i} /> },
    { view: 'compatibility', label: 'Languages', hint: 'Check support across languages and engines', icon: <Globe2 className={i} /> } ] },
  { title: 'Build and fix', items: [
    { view: 'builder', label: 'Builder', hint: 'Assemble a pattern from blocks, no syntax needed', icon: <Blocks className={i} /> },
    { view: 'debugger', label: 'Fix errors', hint: 'Find out why a pattern fails to match', icon: <Bug className={i} /> },
    { view: 'performance', label: 'Speed check', hint: 'Detect slow or unsafe backtracking', icon: <Gauge className={i} /> },
    { view: 'compare', label: 'Compare', hint: 'Run two patterns on the same text', icon: <GitCompare className={i} /> } ] },
  { title: 'Learn', items: [
    { view: 'library', label: 'Examples', hint: 'Ready-made patterns to start from', icon: <Library className={i} /> },
    { view: 'challenges', label: 'Practice', hint: 'Solve problems and check your answer', icon: <Trophy className={i} /> } ] },
];
export const ALL_NAV = NAV_GROUPS.flatMap((g) => g.items);
