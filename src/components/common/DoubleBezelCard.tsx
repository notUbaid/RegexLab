import React from 'react';
import { clsx } from 'clsx';

interface DoubleBezelCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode; className?: string; innerClassName?: string; glow?: boolean;
}

/** A section divided by a hairline, not a box. Name kept so existing imports keep working. */
export const DoubleBezelCard: React.FC<DoubleBezelCardProps> = ({ children, className, innerClassName, glow = false, ...props }) => (
  <div className={clsx('relative flex flex-col border-t border-border pt-6 first:border-t-0 first:pt-0 [&>div]:!p-0', glow && 'border-foreground/40', className)} {...props}>
    <div className={clsx('relative w-full flex-1 min-h-0', innerClassName)}>{children}</div>
  </div>
);
