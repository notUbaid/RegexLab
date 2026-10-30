import React, { useState } from 'react';
import { EngineCompatibility } from '../engine/types';
import { Copy, Check } from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

interface CompatibilityPaneProps {
  compatibility: EngineCompatibility[];
}

export const CompatibilityPane: React.FC<CompatibilityPaneProps> = ({
  compatibility,
}) => {
  const [copiedEngine, setCopiedEngine] = useState<string | null>(null);

  const handleCopy = (engine: string, snippet: string) => {
    soundFX.playCopy();
    navigator.clipboard.writeText(snippet);
    setCopiedEngine(engine);
    setTimeout(() => setCopiedEngine(null), 1500);
  };

  return (
    <div className="h-full overflow-y-auto bg-surface p-3 select-none font-mono text-xs space-y-2">
      <div className="flex items-center justify-between pb-2 border-b border-border text-[11px] text-foreground-dim">
        <span>Other Languages & Engines (7 flavors)</span>
        <span>Click snippet to copy code</span>
      </div>

      <div className="border border-border rounded overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-surface-subtle text-[10px] uppercase text-foreground-dim">
              <th className="py-1.5 px-3 w-28">Engine</th>
              <th className="py-1.5 px-2 w-20">Support</th>
              <th className="py-1.5 px-2">Syntax Warnings</th>
              <th className="py-1.5 px-3 text-right w-24">Copy Code</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 font-mono text-[11px]">
            {compatibility.map((item) => {
              const isCopied = copiedEngine === item.engine;
              return (
                <tr
                  key={item.engine}
                  onMouseEnter={() => soundFX.playHoverPlink(1.1)}
                  className="hover:bg-surface-subtle/50 transition-colors"
                >
                  <td className="py-2 px-3 text-foreground font-semibold">
                    {item.name}
                    <span className="block text-[9px] text-foreground-dim font-normal">
                      v{item.version}
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    {item.supported ? (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] uppercase font-semibold">
                        Compatible
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] uppercase font-semibold">
                        Incompatible
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-foreground-muted text-[11px]">
                    {item.warnings.length === 0 ? (
                      <span className="text-foreground-dim">No syntax issues detected</span>
                    ) : (
                      <ul className="list-disc list-inside space-y-0.5 text-amber-300/90">
                        {item.warnings.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => handleCopy(item.engine, item.snippet)}
                      className="px-2 py-1 rounded bg-surface-elevated hover:bg-surface-elevated/80 border border-border text-foreground-muted hover:text-foreground text-[10px] inline-flex items-center gap-1 transition-colors"
                      title={item.snippet}
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? 'Copied' : 'Snippet'}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
