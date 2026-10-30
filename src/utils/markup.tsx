import React from 'react';

// Helper function to highlight regex matches in a string.
// Full matches are wrapped in <mark>, and capture groups get colored badges.
export function markup(text: string, pattern: string, flags = ''): { nodes: React.ReactNode[]; count: number; error: string } {
  if (!text || !pattern) {
    return { nodes: [text], count: 0, error: '' };
  }

  try {
    // Make sure 'g' and 'd' (indices) flags are enabled so we can get match positions
    let cleanFlags = flags.replace(/[yd]/g, '') + 'gd';
    // Remove duplicate flag characters
    let uniqueFlags = '';
    for (let char of cleanFlags) {
      if (!uniqueFlags.includes(char)) {
        uniqueFlags += char;
      }
    }

    const regex = new RegExp(pattern, uniqueFlags);
    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;
    let matchCount = 0;

    for (const match of text.matchAll(regex)) {
      const matchText = match[0];
      if (!matchText) {
        continue;
      }

      const matchStart = match.index ?? 0;
      const matchEnd = matchStart + matchText.length;
      matchCount++;

      // Append text that came before this match
      if (matchStart > lastIndex) {
        nodes.push(text.slice(lastIndex, matchStart));
      }

      // Check for capture group indices
      const matchIndices = (match as any).indices as ([number, number] | undefined)[] | undefined;
      const groupNodes: React.ReactNode[] = [];
      let currentPos = matchStart;

      if (matchIndices && matchIndices.length > 1) {
        for (let g = 1; g < matchIndices.length; g++) {
          const groupRange = matchIndices[g];
          if (!groupRange) continue;

          const groupStart = groupRange[0];
          const groupEnd = groupRange[1];

          if (groupEnd <= groupStart || groupStart < currentPos) {
            continue;
          }

          // Text inside the match before this group
          if (groupStart > currentPos) {
            groupNodes.push(text.slice(currentPos, groupStart));
          }

          // The capture group itself
          const groupSlice = text.slice(groupStart, groupEnd);
          const colorClass = `rx-g g${g % 8}`;
          groupNodes.push(
            <mark key={`group-${g}-${groupStart}`} className={colorClass}>
              {groupSlice}
            </mark>
          );

          currentPos = groupEnd;
        }
      }

      // Remaining text in match after the last capture group
      if (currentPos < matchEnd) {
        groupNodes.push(text.slice(currentPos, matchEnd));
      }

      // Wrap whole match
      nodes.push(
        <mark key={`match-${matchStart}`}>
          {groupNodes.length > 0 ? groupNodes : matchText}
        </mark>
      );

      lastIndex = matchEnd;
    }

    // Append any trailing text after the last match
    if (lastIndex < text.length) {
      nodes.push(text.slice(lastIndex));
    }

    return {
      nodes: nodes,
      count: matchCount,
      error: '',
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      nodes: [text],
      count: 0,
      error: message,
    };
  }
}
