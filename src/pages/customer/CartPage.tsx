import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Modal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/PageLoader';
import { ROUTES } from '../../constants/routes';
import { ROLES } from '../../constants/roles';
import { useCart } from '../../hooks/useCart';
import { useAuthStore } from '../../store/authStore';
import { getDashboardPath } from '../../utils/getDashboardPath';
import { formatCurrency } from '../../utils/formatCurrency';
import { getImageUrl } from '../../utils/getImageUrl';

export const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuthStore();
  const isCustomer = isAuthenticated && role === ROLES.CUSTOMER;
  const isGuest = !isAuthenticated;

  const {
    cart,
    anonymousDisplay,
    isLoading,
    isSubmitting,
    error,
    fetchCart,
    updateItem,
    updateAnonymousItem,
    removeItem,
    removeAnonymousItem,
    clearCart,
    proceedToCheckout,
  } = useCart();

  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  if (isAuthenticated && role !== ROLES.CUSTOMER) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  const handleQuantityChange = async (itemId: number, nextQuantity: number) => {
    const quantity = Math.max(1, nextQuantity);
    await updateItem(itemId, quantity);
  };

  const handleAnonymousQuantityChange = async (listingId: number, nextQuantity: number, max: number) => {
    const quantity = Math.min(Math.max(1, nextQuantity), max);
    await updateAnonymousItem(listingId, quantity);
  };

  const handleConfirmClear = async () => {
    await clearCart();
    setClearConfirmOpen(false);
  };

  const handleProceedToCheckout = async () => {
    if (isGuest) {
      navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.CHECKOUT)}`);
      return;
    }

    await proceedToCheckout();
    navigate(ROUTES.CHECKOUT);
  };

  if (isLoading) {
    return <PageLoader message="Carregando carrinho..." />;
  }

  if (error && !cart && !anonymousDisplay) {
    return <ErrorState message={error} onRetry={() => void fetchCart()} />;
  }

  const isEmpty = isGuest
    ? !anonymousDisplay || anonymousDisplay.items.length === 0
    : !cart || cart.items.length === 0;

  if (isEmpty) {
    return (
      <PageWrapper title="Carrinho" description="Revise os itens antes de finalizar a compra.">
        <EmptyState
          title="Seu carrinho está vazio"
          description="Explore os anúncios e adicione produtos ao carrinho."
          action={
            <Link to={ROUTES.LISTINGS}>
              <Button variant="primary">Ver anúncios</Button>
            </Link>
          }
        />
      </PageWrapper>
    );
  }

  if (isGuest && anonymousDisplay) {
    return (
      <PageWrapper title="Carrinho" description="Revise os itens antes de finalizar a compra.">
        <div className="grid gap-8 lg:grid-cols-3">
          <section className="flex flex-col gap-4 lg:col-span-2">
            {anonymousDisplay.items.map((item) => {
              const imageUrl = getImageUrl(item.firstImage);
              return (
                <article
                  key={item.listingId}
                  className="flex flex-col gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 sm:flex-row sm:items-center"
                >
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-container">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                        width={96}
                        height={96}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-3xl" aria-hidden="true">
                          medication
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-2">
                    <h3 className="font-headline font-semibold text-on-surface">{item.productName}</h3>
                    {item.pharmacyName && (
                      <p className="text-sm text-on-surface-variant">
                        {item.pharmacyName}
                        {item.pharmacyCity ? ` · ${item.pharmacyCity}` : ''}
                      </p>
                    )}
                    <p className="text-sm text-on-surface-variant">
                      Unitário: {formatCurrency(item.unitPrice)}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-3 sm:items-end">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        aria-label="Diminuir quantidade"
                        onClick={() =>
                          void handleAnonymousQuantityChange(
                            item.listingId,
                            item.quantity - 1,
                            item.maxQuantity
                          )
                        }
                        disabled={isSubmitting || item.quantity <= 1}
                      >
                        -
                      </Button>
                      <input
                        type="number"
                        min={1}
                        max={item.maxQuantity}
                        value={item.quantity}
                        onChange={(event) =>
                          void handleAnonymousQuantityChange(
                            item.listingId,
                            Number(event.target.value),
                            item.maxQuantity
                          )
                        }
                        className="w-16 rounded-xl border border-outline-variant bg-surface-container-lowest px-2 py-1.5 text-center text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        aria-label={`Quantidade de ${item.productName}`}
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        aria-label="Aumentar quantidade"
                        onClick={() =>
                          void handleAnonymousQuantityChange(
                            item.listingId,
                            item.quantity + 1,
                            item.maxQuantity
                          )
                        }
                        disabled={isSubmitting || item.quantity >= item.maxQuantity}
                      >
                        +
                      </Button>
                    </div>

                    <p className="font-headline font-bold text-primary">
                      {formatCurrency(item.itemSubtotal)}
                    </p>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void removeAnonymousItem(item.listingId)}
                      isLoading={isSubmitting}
                    >
                      Remover
                    </Button>
                  </div>
                </article>
              );
            })}
          </section>

          <aside className="h-fit rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
            <h2 className="mb-4 font-headline text-xl font-bold text-on-surface">Resumo do pedido</h2>
            {anonymousDisplay.pharmacyName && (
              <p className="mb-4 text-sm text-on-surface-variant">
                {anonymousDisplay.pharmacyName}
                {anonymousDisplay.pharmacyCity ? ` · ${anonymousDisplay.pharmacyCity}` : ''}
              </p>
            )}
            <dl className="mb-4 space-y-2 text-sm">
              <div className="flex justify-between border-t border-outline-variant pt-2 text-base">
                <dt className="font-semibold text-on-surface">Total</dt>
                <dd className="font-headline font-bold text-primary">
                  {formatCurrency(anonymousDisplay.total)}
                </dd>
              </div>
            </dl>
            <div className="flex flex-col gap-3">
              <Button variant="primary" className="w-full" onClick={() => void handleProceedToCheckout()}>
                Entrar para finalizar compra
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setClearConfirmOpen(true)}
                disabled={isSubmitting}
              >
                Esvaziar carrinho
              </Button>
            </div>
          </aside>
        </div>

        <Modal
          isOpen={clearConfirmOpen}
          onClose={() => setClearConfirmOpen(false)}
          title="Esvaziar carrinho"
          footer={
            <>
              <Button variant="secondary" onClick={() => setClearConfirmOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={() => void handleConfirmClear()} isLoading={isSubmitting}>
                Confirmar
              </Button>
            </>
          }
        >
          <p className="text-on-surface-variant">
            Confirma a remoção de todos os itens do carrinho?
          </p>
        </Modal>
      </PageWrapper>
    );
  }

  if (!cart) {
    return null;
  }

  return (
    <PageWrapper title="Carrinho" description="Revise os itens antes de finalizar a compra.">
      <div className="grid gap-8 lg:grid-cols-3">
        <section className="flex flex-col gap-4 lg:col-span-2">
          {cart.items.map((item) => {
            const imageUrl = getImageUrl(item.firstImage);

            return (
              <article
                key={item.itemId}
                className="flex flex-col gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 sm:flex-row sm:items-center"
              >
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-container">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                      width={96}
                      height={96}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-3xl" aria-hidden="true">
                        medication
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-2">
                  <h3 className="font-headline font-semibold text-on-surface">{item.productName}</h3>
                  {cart.pharmacyName && (
                    <p className="text-sm text-on-surface-variant">
                      {cart.pharmacyName}
                      {cart.pharmacyCity ? ` · ${cart.pharmacyCity}` : ''}
                    </p>
                  )}
                  <p className="text-sm text-on-surface-variant">
                    Unitário: {formatCurrency(item.unitPrice)}
                  </p>
                </div>

                <div className="flex flex-col items-start gap-3 sm:items-end">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      aria-label="Diminuir quantidade"
                      onClick={() => void handleQuantityChange(item.itemId, item.quantity - 1)}
                      disabled={isSubmitting || item.quantity <= 1}
                    >
                      -
                    </Button>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(event) =>
                        void handleQuantityChange(item.itemId, Number(event.target.value))
                      }
                      className="w-16 rounded-xl border border-outline-variant bg-surface-container-lowest px-2 py-1.5 text-center text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      aria-label={`Quantidade de ${item.productName}`}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      aria-label="Aumentar quantidade"
                      onClick={() => void handleQuantityChange(item.itemId, item.quantity + 1)}
                      disabled={isSubmitting}
                    >
                      +
                    </Button>
                  </div>

                  <p className="font-headline font-bold text-primary">
                    {formatCurrency(item.itemSubtotal)}
                  </p>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void removeItem(item.itemId)}
                    isLoading={isSubmitting}
                  >
                    Remover
                  </Button>
                </div>
              </article>
            );
          })}
        </section>

        <aside className="h-fit rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
          <h2 className="mb-4 font-headline text-xl font-bold text-on-surface">Resumo do pedido</h2>

          {cart.pharmacyName && (
            <p className="mb-4 text-sm text-on-surface-variant">
              {cart.pharmacyName}
              {cart.pharmacyCity ? ` · ${cart.pharmacyCity}` : ''}
            </p>
          )}

          <dl className="mb-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-on-surface-variant">Subtotal</dt>
              <dd className="font-medium text-on-surface">{formatCurrency(cart.subtotal)}</dd>
            </div>
            {cart.discount > 0 && (
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Desconto</dt>
                <dd className="font-medium text-[var(--color-success)]">
                  -{formatCurrency(cart.discount)}
                </dd>
              </div>
            )}
            <div className="flex justify-between border-t border-outline-variant pt-2 text-base">
              <dt className="font-semibold text-on-surface">Total</dt>
              <dd className="font-headline font-bold text-primary">{formatCurrency(cart.total)}</dd>
            </div>
          </dl>

          <p
            className="mb-4 rounded-2xl border border-outline-variant bg-surface-container px-4 py-3 text-sm text-on-surface-variant"
            role="status"
          >
            Cupons ainda não estão disponíveis nesta versão.
          </p>

          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => void handleProceedToCheckout()}
              isLoading={isSubmitting}
            >
              Ir para checkout
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setClearConfirmOpen(true)}
              disabled={isSubmitting}
            >
              Esvaziar carrinho
            </Button>
          </div>
        </aside>
      </div>

      {error && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}

      <Modal
        isOpen={clearConfirmOpen}
        onClose={() => setClearConfirmOpen(false)}
        title="Esvaziar carrinho"
        footer={
          <>
            <Button variant="secondary" onClick={() => setClearConfirmOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={() => void handleConfirmClear()} isLoading={isSubmitting}>
              Confirmar
            </Button>
          </>
        }
      >
        <p className="text-on-surface-variant">
          Confirma a remoção de todos os itens do carrinho?
        </p>
      </Modal>
    </PageWrapper>
  );
};
