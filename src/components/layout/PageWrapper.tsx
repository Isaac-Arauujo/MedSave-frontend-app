import type { ReactNode } from 'react';

interface PageWrapperProps {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export const PageWrapper = ({ title, description, children, actions }: PageWrapperProps) => (
  <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">
    <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface md:text-3xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-on-surface-variant">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
    {children}
  </div>
);
