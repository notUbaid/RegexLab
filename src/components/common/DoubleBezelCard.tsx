import React from 'react';
import { clsx } from 'clsx';

interface DoubleBezelCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  glow?: boolean;
}

/**
 * High-End Double-Bezel (Doppelrand) hardware enclosure component.
 * Outer Shell: subtle ring, hardware bezel padding, and smooth squircle curve.
 * Inner Core: distinct background, inner highlight rim, and concentric radius.
 */
export const DoubleBezelCard: React.FC<DoubleBezelCardProps> = ({
  children,
  className,
  innerClassName,
  glow = false,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'group relative p-1.5 rounded-2xl bg-white/[0.03] dark:bg-white/[0.03] ring-1 ring-white/10 shadow-bezel transition-all duration-500 ease-spring',
        glow && 'ring-primary/40 shadow-glow-primary',
        className
      )}
      {...props}
    >
      <div
        className={clsx(
          'relative w-full h-full rounded-[calc(1rem-0.125rem)] bg-surface/90 backdrop-blur-xl shadow-inner-bezel transition-all duration-300',
          innerClassName
        )}
      >
        {children}
      </div>
    </div>
  );
};
