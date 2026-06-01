import { Button } from './Button';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState = ({ message, onRetry }: ErrorStateProps) => (
  <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
    <span className="material-symbols-outlined text-5xl text-[var(--color-danger)]" aria-hidden="true">
      error
    </span>
    <div className="max-w-md space-y-2">
      <h3 className="font-headline text-xl font-bold text-on-surface">Algo deu errado</h3>
      <p className="text-on-surface-variant">{message}</p>
    </div>
    {onRetry && (
      <Button variant="secondary" onClick={onRetry}>
        Tentar novamente
      </Button>
    )}
  </div>
);
