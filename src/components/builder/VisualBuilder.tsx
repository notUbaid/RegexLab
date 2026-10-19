import React, { useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  Check, 
  Sparkles, 
  Play, 
  Layers, 
  Type, 
  Hash, 
  Sliders,
  CornerDownRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useRegexStore } from '../../store/useRegexStore';
import { BuilderBlockItem } from '../../types/regex';
import { translateRegex, ExplanationBlock } from '../../parser/translator';
import { DoubleBezelCard } from '../common/DoubleBezelCard';

const BLOCK_PRESETS: { type: BuilderBlockItem['type']; label: string; icon: string; description: string; defaultValue?: string }[] = [
  { type: 'start_of_line', label: 'Start of String', icon: '^', description: 'Matches start of line or string (^)' },
  { type: 'end_of_line', label: 'End of String', icon: '$', description: 'Matches end of line or string ($)' },
  { type: 'letters', label: 'Letters (a-z, A-Z)', icon: 'Az', description: 'Alphabetical characters [a-zA-Z]' },
  { type: 'numbers', label: 'Numbers (0-9)', icon: '0-9', description: 'Digits 0 through 9 (\\d)' },
  { type: 'whitespace', label: 'Whitespace', icon: '\\s', description: 'Space, tab, or newline (\\s)' },
  { type: 'any_character', label: 'Any Character', icon: '.', description: 'Any character except newline (.)' },
  { type: 'custom_text', label: 'Exact Text', icon: '""', description: 'Literal sequence of characters', defaultValue: 'sample' },
  { type: 'custom_set', label: 'Character Set', icon: '[ ]', description: 'Any one of specific characters', defaultValue: '._+-' },
  { type: 'not_in_set', label: 'Exclude Set', icon: '[^]', description: 'Any character NOT in this set', defaultValue: '0-9' },
  { type: 'word_boundary', label: 'Word Boundary', icon: '\\b', description: 'Position between word and non-word (\\b)' },
];

export function compileBlocksToRegex(blocks: BuilderBlockItem[]): string {
  let result = '';

  for (const block of blocks) {
    let core = '';
    switch (block.type) {
      case 'start_of_line':
        core = '^';
        break;
      case 'end_of_line':
        core = '$';
        break;
      case 'word_boundary':
        core = '\\b';
        break;
      case 'letters':
        core = '[a-zA-Z]';
        break;
      case 'numbers':
        core = '\\d';
        break;
      case 'whitespace':
        core = '\\s';
        break;
      case 'any_character':
        core = '.';
        break;
      case 'custom_text':
        // Escape special regex characters in literal string
        const escaped = (block.value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        core = escaped.length > 1 ? `(?:${escaped})` : escaped;
        break;
      case 'custom_set':
        core = `[${block.value || 'a-z'}]`;
        break;
      case 'not_in_set':
        core = `[^${block.value || '0-9'}]`;
        break;
      default:
        core = block.value || '';
        break;
    }

    // Apply Quantifier (anchors and boundaries don't take quantifiers)
    const canQuantify = !['start_of_line', 'end_of_line', 'word_boundary'].includes(block.type);
    let quant = '';
    if (canQuantify) {
      switch (block.quantifier) {
        case 'optional':
          quant = '?';
          break;
        case 'zero_or_more':
          quant = '*';
          break;
        case 'one_or_more':
          quant = '+';
          break;
        case 'exact':
          quant = `{${block.min || 1}}`;
          break;
        case 'range':
          quant = `{${block.min || 1},${block.max || ''}}`;
          break;
        case 'one':
        default:
          quant = '';
          break;
      }

      if (!block.greedy && quant) {
        quant += '?';
      }
    }

    let piece = core + quant;

    // Apply capture group wrapper if configured
    if (block.captured && canQuantify) {
      if (block.groupName && block.groupName.trim()) {
        piece = `(?<${block.groupName.trim()}>${piece})`;
      } else {
        piece = `(${piece})`;
      }
    }

    result += piece;
  }

  return result;
}

export const VisualBuilder: React.FC = () => {
  const { 
    builderBlocks, 
    addBuilderBlock, 
    removeBuilderBlock, 
    updateBuilderBlock, 
    reorderBuilderBlocks, 
    setPattern, 
    setActiveView 
  } = useRegexStore();

  const [copied, setCopied] = React.useState(false);

  // Compile pattern from blocks
  const compiledRegex = useMemo(() => {
    return compileBlocksToRegex(builderBlocks);
  }, [builderBlocks]);

  // Live human translation of compiled regex
  const translation = useMemo(() => {
    return translateRegex(compiledRegex);
  }, [compiledRegex]);

  const handleCopy = () => {
    navigator.clipboard.writeText(compiledRegex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyToPlayground = () => {
    setPattern(compiledRegex);
    setActiveView('playground');
  };

  const handleAddPreset = (preset: typeof BLOCK_PRESETS[0]) => {
    const newBlock: BuilderBlockItem = {
      id: `b-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: preset.type,
      value: preset.defaultValue || '',
      quantifier: 'one',
      greedy: true,
      captured: false,
    };
    addBuilderBlock(newBlock);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header Card */}
      <DoubleBezelCard innerClassName="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
              No-Code Builder
            </span>
            <span className="text-xs text-foreground/60 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Easy Block Builder
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Build Regex with Blocks
          </h1>
          <p className="text-xs text-foreground/70 mt-0.5">
            Click blocks to build your regex piece by piece without needing to memorize tricky symbols.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <button
            onClick={handleCopy}
            className="flex-1 md:flex-initial px-4 py-2 rounded-xl bg-card hover:bg-muted text-foreground border border-border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Pattern'}
          </button>

          <button
            onClick={handleApplyToPlayground}
            className="flex-1 md:flex-initial px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 transition-all shadow-md shadow-primary/20"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Open in Playground
          </button>
        </div>
      </DoubleBezelCard>

      {/* Compiled Pattern Live Preview Banner */}
      <DoubleBezelCard innerClassName="p-4 bg-primary/5 border-primary/20 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Your Resulting Regex Pattern
          </span>
          <span className="text-xs font-mono text-foreground/60">
            {builderBlocks.length} Blocks
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-background border border-border font-mono text-base text-foreground font-bold tracking-wide select-all overflow-x-auto">
          {compiledRegex ? `/${compiledRegex}/` : <span className="text-foreground/40 font-normal italic">Click on presets on the right to start building...</span>}
        </div>
      </DoubleBezelCard>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Blocks Canvas */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Your Blocks in Order
            </h2>
            <span className="text-xs text-foreground/60">
              Matched in order from top to bottom
            </span>
          </div>

          {builderBlocks.length === 0 ? (
            <DoubleBezelCard innerClassName="p-12 text-center space-y-3">
              <Layers className="w-10 h-10 text-foreground/40 mx-auto" />
              <h3 className="text-base font-semibold text-foreground">Canvas is Empty</h3>
              <p className="text-xs text-foreground/60 max-w-sm mx-auto">
                Select an element from the Block Palette on the right to start assembling your regular expression.
              </p>
            </DoubleBezelCard>
          ) : (
            <div className="space-y-3">
              {builderBlocks.map((block, index) => {
                const canQuantify = !['start_of_line', 'end_of_line', 'word_boundary'].includes(block.type);
                const hasValue = ['custom_text', 'custom_set', 'not_in_set'].includes(block.type);

                return (
                  <DoubleBezelCard key={block.id} innerClassName="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      {/* Left: Index & Type */}
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-muted text-foreground/70 font-mono text-xs flex items-center justify-center font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-foreground capitalize">
                            {block.type.replace(/_/g, ' ')}
                          </h4>
                          <span className="text-[11px] text-foreground/60 font-mono">
                            {BLOCK_PRESETS.find(p => p.type === block.type)?.description}
                          </span>
                        </div>
                      </div>

                      {/* Right: Reorder & Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => index > 0 && reorderBuilderBlocks(index, index - 1)}
                          disabled={index === 0}
                          title="Move Up"
                          className="p-1.5 rounded-lg hover:bg-muted text-foreground/60 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => index < builderBlocks.length - 1 && reorderBuilderBlocks(index, index + 1)}
                          disabled={index === builderBlocks.length - 1}
                          title="Move Down"
                          className="p-1.5 rounded-lg hover:bg-muted text-foreground/60 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeBuilderBlock(block.id)}
                          title="Delete Block"
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-foreground/60 hover:text-red-400 transition-all ml-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Block Configuration Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t border-border/60">
                      {/* Custom Value Input */}
                      {hasValue && (
                        <div>
                          <label className="text-[11px] font-semibold text-foreground/70 block mb-1">
                            Matching Characters / Text
                          </label>
                          <input
                            type="text"
                            value={block.value || ''}
                            onChange={(e) => updateBuilderBlock(block.id, { value: e.target.value })}
                            placeholder="e.g. sample text"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      )}

                      {/* Quantifier Selector */}
                      {canQuantify && (
                        <div>
                          <label className="text-[11px] font-semibold text-foreground/70 block mb-1">
                            Frequency / Repetition
                          </label>
                          <select
                            value={block.quantifier}
                            onChange={(e) => updateBuilderBlock(block.id, { quantifier: e.target.value as any })}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="one">Exactly once (1)</option>
                            <option value="optional">Optional (0 or 1) [?]</option>
                            <option value="one_or_more">One or more (1+) [+]</option>
                            <option value="zero_or_more">Zero or more (0+) [*]</option>
                            <option value="exact">Exact count</option>
                            <option value="range">Range (min to max)</option>
                          </select>
                        </div>
                      )}

                      {/* Exact count / Range inputs */}
                      {canQuantify && (block.quantifier === 'exact' || block.quantifier === 'range') && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <label className="text-[11px] font-semibold text-foreground/70 block mb-1">
                              Min Count
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={block.min || 1}
                              onChange={(e) => updateBuilderBlock(block.id, { min: parseInt(e.target.value, 10) || 1 })}
                              className="w-full px-2 py-1.5 rounded-lg bg-background border border-border text-xs font-mono text-foreground"
                            />
                          </div>
                          {block.quantifier === 'range' && (
                            <div className="flex-1">
                              <label className="text-[11px] font-semibold text-foreground/70 block mb-1">
                                Max Count
                              </label>
                              <input
                                type="number"
                                min={block.min || 1}
                                value={block.max || ''}
                                onChange={(e) => updateBuilderBlock(block.id, { max: parseInt(e.target.value, 10) || undefined })}
                                placeholder="max"
                                className="w-full px-2 py-1.5 rounded-lg bg-background border border-border text-xs font-mono text-foreground"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Capture Group Toggle */}
                      {canQuantify && (
                        <div className="flex flex-col justify-end">
                          <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer py-1.5">
                            <input
                              type="checkbox"
                              checked={block.captured || false}
                              onChange={(e) => updateBuilderBlock(block.id, { captured: e.target.checked })}
                              className="rounded border-border text-primary focus:ring-primary"
                            />
                            <span>Capture in Group</span>
                          </label>
                          {block.captured && (
                            <input
                              type="text"
                              value={block.groupName || ''}
                              onChange={(e) => updateBuilderBlock(block.id, { groupName: e.target.value })}
                              placeholder="Group name (optional)"
                              className="mt-1 px-2 py-1 rounded bg-background border border-border text-[11px] font-mono text-foreground"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </DoubleBezelCard>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Palette & Live Explanation */}
        <div className="lg:col-span-4 space-y-6">
          {/* Block Palette */}
          <DoubleBezelCard innerClassName="p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                Add Pattern Block
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {BLOCK_PRESETS.map((preset) => (
                <button
                  key={preset.type}
                  onClick={() => handleAddPreset(preset)}
                  className="w-full p-2.5 rounded-xl border border-border/70 bg-card hover:bg-muted/70 text-left transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 text-primary font-mono text-xs flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                      {preset.icon}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                        {preset.label}
                      </div>
                      <div className="text-[10px] text-foreground/60 truncate max-w-[170px]">
                        {preset.description}
                      </div>
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </DoubleBezelCard>

          {/* Live Explanation of Built Regex */}
          <DoubleBezelCard innerClassName="p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2 pb-2 border-b border-border">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Live English Explanation
            </h3>

            {translation.length === 0 ? (
              <p className="text-xs text-foreground/60 italic">No explanation available yet.</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {translation.map((block: ExplanationBlock, idx: number) => (
                  <div
                    key={block.id}
                    className="p-2 rounded-lg bg-card border border-border/60 text-xs flex items-start gap-2"
                  >
                    <span className="w-4 h-4 rounded bg-primary/10 text-primary font-mono text-[10px] flex items-center justify-center font-bold mt-0.5 shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-semibold text-foreground">{block.title}: </span>
                      <span className="text-foreground/70">{block.summary}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DoubleBezelCard>
        </div>
      </div>
    </div>
  );
};
