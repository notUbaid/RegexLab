import React, { useMemo, useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Copy, 
  Check, 
  Play, 
  Tag, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  Sparkles,
  Filter
} from 'lucide-react';
import { useRegexStore } from '../../store/useRegexStore';
import { PATTERN_LIBRARY } from '../../data/patternLibrary';
import { PatternItem } from '../../types/regex';
import { DoubleBezelCard } from '../common/DoubleBezelCard';

const CATEGORIES = [
  'All',
  'Web & Network',
  'Security & Auth',
  'Data & Numbers',
  'Dates & Times',
  'Telephony & Location',
  'Programming',
] as const;

export const PatternLibraryView: React.FC = () => {
  const { loadPattern, setActiveView } = useRegexStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredPatterns = useMemo(() => {
    return PATTERN_LIBRARY.filter((pattern) => {
      const matchesCategory = selectedCategory === 'All' || pattern.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const inName = pattern.name.toLowerCase().includes(q);
      const inDesc = pattern.description.toLowerCase().includes(q);
      const inRegex = pattern.regex.toLowerCase().includes(q);
      const inTags = pattern.tags.some((t) => t.toLowerCase().includes(q));

      return inName || inDesc || inRegex || inTags;
    });
  }, [searchQuery, selectedCategory]);

  const handleCopy = (id: string, regex: string) => {
    navigator.clipboard.writeText(regex);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLoad = (item: PatternItem) => {
    // Collect sample test inputs into a sample text block
    const sampleText = item.testCases
      .map((tc) => `${tc.input} // ${tc.shouldMatch ? 'Should match' : 'Should NOT match'}`)
      .join('\n');
    loadPattern(item.regex, item.flags || 'g', sampleText);
    setActiveView('playground');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header Card */}
      <DoubleBezelCard innerClassName="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
              Battle-Tested Catalog
            </span>
            <span className="text-xs text-foreground/60 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              Production Pattern Library
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Curated Regex Patterns
          </h1>
          <p className="text-xs text-foreground/70 mt-0.5">
            Production-grade, secure regular expressions for validation, parsing, network, and security tasks.
          </p>
        </div>

        {/* Search Input in Header */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patterns, tags, or regex..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </DoubleBezelCard>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === category
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                : 'bg-card text-foreground/70 hover:bg-muted border border-border/60 hover:text-foreground'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Pattern Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatterns.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <DoubleBezelCard innerClassName="p-12 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-foreground/30 mx-auto" />
              <h3 className="text-base font-bold text-foreground">No matching patterns</h3>
              <p className="text-xs text-foreground/60 max-w-sm mx-auto">
                No patterns match your search query "{searchQuery}". Try searching for something else or clearing filters.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="px-4 py-2 rounded-xl bg-muted text-foreground text-xs font-semibold hover:bg-card border border-border"
              >
                Reset Filters
              </button>
            </DoubleBezelCard>
          </div>
        ) : (
          filteredPatterns.map((item) => {
            const isCopied = copiedId === item.id;
            return (
              <DoubleBezelCard
                key={item.id}
                innerClassName="p-5 flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors"
              >
                <div className="space-y-3">
                  {/* Category Pill & Actions */}
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-muted text-foreground/70 border border-border">
                      {item.category}
                    </span>
                    <button
                      onClick={() => handleCopy(item.id, item.regex)}
                      title="Copy Regex"
                      className="p-1.5 rounded-lg hover:bg-muted text-foreground/60 hover:text-foreground transition-all flex items-center gap-1 text-[11px]"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="font-medium">{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      {item.name}
                    </h3>
                    <p className="text-xs text-foreground/60 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Highlighted Pattern Box */}
                  <pre className="p-3 rounded-xl bg-background border border-border font-mono text-xs text-primary font-bold overflow-x-auto whitespace-pre select-all">
                    /{item.regex}/{item.flags}
                  </pre>

                  {/* Test Cases Pill Preview */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 block">
                      Sample Test Cases:
                    </span>
                    <div className="space-y-1">
                      {item.testCases.slice(0, 3).map((tc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs font-mono p-1.5 rounded bg-muted/40 border border-border/40"
                        >
                          <span className="truncate max-w-[200px] text-foreground/80">
                            {tc.input}
                          </span>
                          {tc.shouldMatch ? (
                            <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Match
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-red-400 flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> Reject
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted/60 text-foreground/60"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA */}
                <button
                  onClick={() => handleLoad(item)}
                  className="w-full py-2.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-primary/20 hover:border-transparent mt-2 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Test in Playground
                </button>
              </DoubleBezelCard>
            );
          })
        )}
      </div>
    </div>
  );
};
