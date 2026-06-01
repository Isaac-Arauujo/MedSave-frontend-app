import clsx from 'clsx';
import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index);

  return (
    <nav
      className={clsx('flex flex-wrap items-center justify-center gap-2', className)}
      aria-label="Paginação"
    >
      <Button
        variant="secondary"
        size="sm"
        disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Página anterior"
      >
        Anterior
      </Button>
      {pages.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onPageChange(page)}
          aria-label={`Página ${page + 1}`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page + 1}
        </Button>
      ))}
      <Button
        variant="secondary"
        size="sm"
        disabled={currentPage >= totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Próxima página"
      >
        Próxima
      </Button>
    </nav>
  );
};
