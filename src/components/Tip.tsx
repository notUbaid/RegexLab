// A small dark label that appears under an element when you hover it (or reach it with the Tab key).
// It is plain CSS: the label is always in the page, just invisible until its wrapper is hovered.
import type { ReactNode } from 'react';

interface TipProps {
  text: string;
  children: ReactNode;
  /** Line the label up with the element's right edge, for things near the right side of the screen. */
  alignRight?: boolean;
}

export function Tip({ text, children, alignRight }: TipProps) {
  return (
    <span className="group/tip relative inline-flex">
      {children}
      <span
        role="tooltip"
        // group-has-[:focus-visible] shows the label for keyboard users, but not after a mouse click.
        className={`pointer-events-none absolute top-full z-50 mt-1.5 w-max max-w-[14rem] rounded-md bg-foreground px-2.5 py-1.5 text-left text-xs font-normal leading-snug text-background opacity-0 shadow-lg transition-opacity group-hover/tip:opacity-100 group-hover/tip:delay-200 group-has-[:focus-visible]/tip:opacity-100 ${
          alignRight ? 'right-0' : 'left-0'
        }`}
      >
        {text}
      </span>
    </span>
  );
}
