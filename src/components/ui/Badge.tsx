import clsx from 'clsx';
import type { ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-[var(--color-success)]',
  warning: 'bg-amber-100 text-[var(--color-warning)]',
  danger: 'bg-red-100 text-[var(--color-danger)]',
  neutral: 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)]',
};

export const Badge = ({ variant = 'neutral', children, className }: BadgeProps) => (
  <span
    className={clsx(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
      variantClasses[variant],
      className
    )}
  >
    {children}
  </span>
);
