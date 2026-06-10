import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { CartItemControls } from '../../components/shared/CartItemControls';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Modal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/PageLoader';
import { getPrescriptionRequirementStatusLabel } from '../../constants/prescriptionOptions';
import { ROUTES } from '../../constants/routes';
import { ROLES } from '../../constants/roles';
import { useCart } from '../../hooks/useCart';
import { useAuthStore } from '../../store/authStore';
import { getDashboardPath } from '../../utils/getDashboardPath';
import { formatCurrency } from '../../utils/formatCurrency';
import { getImageUrl } from '../../utils/getImageUrl';
import { itemRequiresPrescription } from '../../utils/prescriptionUtils';

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
    await updateItem(itemId, nextQuantity);
  };

  const handleAnonymousQuantityChange = async (
    listingId: number,
    nextQuantity: number,
    maxQuantity: number
  ) => {
    await updateAnonymousItem(listingId, nextQuantity, maxQuantity);
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
                  className="flex flex-col gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4"
                >
                  <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
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

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words font-headline font-semibold text-on-surface">
                        {item.productName}
                      </h3>
                      {item.pharmacyName && (
                        <p className="text-sm text-on-surface-variant">
                          {item.pharmacyName}
                          {item.pharmacyCity ? ` · ${item.pharmacyCity}` : ''}
                        </p>
                      )}
                      <p className="text-sm text-on-surface-variant">
                        Unitário: {formatCurrency(item.unitPrice)}
                      </p>
                      <p className="mt-2 font-headline font-bold text-primary">
                        Subtotal: {formatCurrency(item.itemSubtotal)}
                      </p>
                    </div>
                  </div>

                  <CartItemControls
                    quantity={item.quantity}
                    maxQuantity={item.maxQuantity}
                    disabled={isSubmitting}
                    onDecrease={() =>
                      void handleAnonymousQuantityChange(
                        item.listingId,
                        item.quantity - 1,
                        item.maxQuantity
                      )
                    }
                    onIncrease={() =>
                      void handleAnonymousQuantityChange(
                        item.listingId,
                        item.quantity + 1,
                        item.maxQuantity
                      )
                    }
                    onRemove={() => void removeAnonymousItem(item.listingId)}
                  />
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
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Subtotal</dt>
                <dd className="font-medium text-on-surface">
                  {formatCurrency(anonymousDisplay.subtotal)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-outline-variant pt-2 text-base">
                <dt className="font-semibold text-on-surface">Total</dt>
                <dd className="font-headline font-bold text-primary">
                  {formatCurrency(anonymousDisplay.total)}
                </dd>
              </div>
            </dl>
            <div className="flex flex-col gap-3">
              <Button variant="primary" className="w-full" onClick={() => void handleProceedToCheckout()}>
                Ir para pagamento
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
                className="flex flex-col gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4"
              >
                <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
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

                  <div className="min-w-0 flex-1">
                    <h3 className="break-words font-headline font-semibold text-on-surface">
                      {item.productName}
                    </h3>
                    {cart.pharmacyName && (
                      <p className="text-sm text-on-surface-variant">
                        {cart.pharmacyName}
                        {cart.pharmacyCity ? ` · ${cart.pharmacyCity}` : ''}
                      </p>
                    )}
                    <p className="text-sm text-on-surface-variant">
                      Unitário: {formatCurrency(item.unitPrice)}
                    </p>
                    <p className="mt-2 font-headline font-bold text-primary">
                      Subtotal: {formatCurrency(item.itemSubtotal)}
                    </p>
                    {itemRequiresPrescription(item) && (
                      <div className="mt-3 flex flex-col gap-2">
                        <Badge variant="warning">Exige receita médica</Badge>
                        <p className="text-sm text-on-surface-variant">
                          Este item exige receita médica. A receita será enviada no checkout.
                        </p>
                        {item.prescriptionStatus && item.prescriptionStatus !== 'NOT_REQUIRED' && (
                          <Badge variant="neutral">
                            {getPrescriptionRequirementStatusLabel(item.prescriptionStatus)}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <CartItemControls
                  quantity={item.quantity}
                  disabled={isSubmitting}
                  onDecrease={() => void handleQuantityChange(item.itemId, item.quantity - 1)}
                  onIncrease={() => void handleQuantityChange(item.itemId, item.quantity + 1)}
                  onRemove={() => void removeItem(item.itemId)}
                />
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
              Ir para pagamento
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
