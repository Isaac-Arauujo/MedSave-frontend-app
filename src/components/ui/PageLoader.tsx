import { Spinner } from './Spinner';

interface PageLoaderProps {
  message?: string;
}

export const PageLoader = ({ message = 'Carregando...' }: PageLoaderProps) => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
    <Spinner size="lg" />
    <p className="font-headline text-lg font-semibold text-on-surface-variant">{message}</p>
  </div>
);
