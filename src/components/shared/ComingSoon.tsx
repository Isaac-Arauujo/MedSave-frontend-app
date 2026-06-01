import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { EmptyState } from '../ui/EmptyState';

interface ComingSoonProps {
  pageName: string;
}

export const ComingSoon = ({ pageName }: ComingSoonProps) => (
  <EmptyState
    icon={
      <span className="material-symbols-outlined text-3xl" aria-hidden="true">
        construction
      </span>
    }
    title={`${pageName} — em breve`}
    description="Esta página será implementada em uma etapa futura."
    action={
      <Link
        to={ROUTES.LISTINGS}
        className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-on-primary transition-colors hover:bg-[var(--color-primary-dark)]"
      >
        Voltar aos anúncios
      </Link>
    }
  />
);
