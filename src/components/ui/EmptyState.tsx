import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
    {icon && (
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-primary">
        {icon}
      </div>
    )}
    <div className="max-w-md space-y-2">
      <h3 className="font-headline text-xl font-bold text-on-surface">{title}</h3>
      {description && <p className="text-on-surface-variant">{description}</p>}
    </div>
    {action}
  </div>
);
