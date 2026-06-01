import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { ROUTES } from '../../constants/routes';
import { useMiniCart } from '../../hooks/useMiniCart';
import { formatCurrency } from '../../utils/formatCurrency';
import { getImageUrl } from '../../utils/getImageUrl';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
}

const MiniCartSkeleton = () => (
  <div className="flex flex-col gap-4 p-4">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="flex gap-3">
        <div className="h-12 w-12 shrink-0 animate-pulse rounded-lg bg-surface-container" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-surface-container" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-surface-container" />
        </div>
      </div>
    ))}
  </div>
);

export const MiniCart = ({ isOpen, onClose }: MiniCartProps) => {
  const { summary, isLoading, error, itemCount, refetch } = useMiniCart(isOpen);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const isEmpty = !isLoading && (!summary || summary.items.length === 0);

  return (
    <>
      <div
        className={clsx(
          'fixed inset-0 z-50 bg-[var(--color-neutral-900)]/50 transition-opacity',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        aria-hidden={!isOpen}
        onClick={onClose}
      />

      <aside
        className={clsx(
          'fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-surface-container-lowest shadow-xl transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mini carrinho"
        aria-hidden={!isOpen}
      >
        <header className="flex items-center justify-between border-b border-outline-variant px-4 py-4">
          <div>
            <h2 className="font-headline text-lg font-bold text-on-surface">Seu carrinho</h2>
            <p className="text-sm text-on-surface-variant">
              {itemCount} {itemCount === 1 ? 'item' : 'itens'}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fechar carrinho">
            <span className="material-symbols-outlined" aria-hidden="true">
              close
            </span>
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <MiniCartSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center gap-4 p-6 text-center">
              <p className="text-sm text-[var(--color-danger)]" role="alert">
                {error}
              </p>
              <Button variant="secondary" size="sm" onClick={() => void refetch()}>
                Tentar novamente
              </Button>
            </div>
          ) : isEmpty ? (
            <EmptyState
              title="Seu carrinho está vazio"
              description="Adicione produtos aos anúncios para vê-los aqui."
            />
          ) : (
            summary && (
              <ul className="divide-y divide-outline-variant">
                {summary.items.map((item) => {
                  const imageUrl = getImageUrl(item.firstImage);

                  return (
                    <li key={item.itemId} className="flex gap-3 p-4">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-container">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.productName}
                            className="h-full w-full object-cover"
                            width={48}
                            height={48}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-xl" aria-hidden="true">
                              medication
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-on-surface">{item.productName}</p>
                        <p className="text-sm text-on-surface-variant">
                          {item.quantity} × {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )
          )}
        </div>

        {!isLoading && !error && summary && summary.items.length > 0 && (
          <footer className="border-t border-outline-variant p-4">
            <dl className="mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Subtotal</dt>
                <dd className="font-medium text-on-surface">{formatCurrency(summary.subtotal)}</dd>
              </div>
              {summary.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-on-surface-variant">Desconto</dt>
                  <dd className="font-medium text-[var(--color-success)]">
                    -{formatCurrency(summary.discount)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between border-t border-outline-variant pt-2 text-base">
                <dt className="font-semibold text-on-surface">Total</dt>
                <dd className="font-headline font-bold text-primary">
                  {formatCurrency(summary.total)}
                </dd>
              </div>
            </dl>

            <div className="flex flex-col gap-2">
              <Link to={ROUTES.CART} onClick={onClose}>
                <Button variant="secondary" className="w-full">
                  Ver carrinho
                </Button>
              </Link>
              <Link to={ROUTES.CHECKOUT} onClick={onClose}>
                <Button variant="primary" className="w-full">
                  Ir para checkout
                </Button>
              </Link>
            </div>
          </footer>
        )}
      </aside>
    </>
  );
};
