import { Link } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { OrderSummaryCard } from '../../components/shared/OrderSummaryCard';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { PageLoader } from '../../components/ui/PageLoader';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { ORDER_LIST_FILTERS } from '../../constants/orderListOptions';
import {
  getPendingCheckoutActionLabel,
  getPendingCheckoutStatusLabel,
  getPendingCheckoutTitle,
} from '../../constants/prescriptionOptions';
import { ROUTES } from '../../constants/routes';
import { useCustomerOrders } from '../../hooks/useCustomerOrders';
import { usePendingPrescriptionCheckouts } from '../../hooks/usePendingPrescriptionCheckouts';

export const CustomerOrdersPage = () => {
  const {
    orders,
    currentPage,
    totalPages,
    totalElements,
    filter,
    isLoading,
    error,
    setCurrentPage,
    applyFilter,
    refetch,
  } = useCustomerOrders();
  const {
    items: pendingCheckouts,
    isLoading: isPendingLoading,
    error: pendingError,
  } = usePendingPrescriptionCheckouts();

  if (isLoading && orders.length === 0 && isPendingLoading) {
    return <PageLoader message="Carregando pedidos..." />;
  }

  if (error && orders.length === 0 && pendingCheckouts.length === 0) {
    return <ErrorState message={error} onRetry={() => void refetch()} />;
  }

  return (
    <PageWrapper title="Meus pedidos" description="Acompanhe todos os seus pedidos em um só lugar.">
      {(pendingCheckouts.length > 0 || isPendingLoading) && (
        <section className="mb-8 space-y-4">
          <div>
            <h2 className="font-headline text-lg font-bold text-on-surface">Compras em andamento</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Compras com receita ou pagamento pendente que você pode retomar a qualquer momento.
            </p>
          </div>

          {isPendingLoading && pendingCheckouts.length === 0 && (
            <div className="flex justify-center py-4">
              <Spinner size="sm" label="Carregando compras em andamento" />
            </div>
          )}

          {pendingError && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-[var(--color-danger)]" role="alert">
              {pendingError}
            </p>
          )}

          <div className="space-y-3">
            {pendingCheckouts.map((item) => (
              <article
                key={`${item.listingId}-${item.reviewId}`}
                className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      Compra em andamento
                    </p>
                    <h3 className="mt-1 font-headline text-base font-semibold text-on-surface">
                      {getPendingCheckoutTitle(item.prescriptionStatus)}
                    </h3>
                    <p className="mt-1 text-sm text-on-surface">{item.productName}</p>
                    <p className="text-sm text-on-surface-variant">{item.pharmacyName}</p>
                    <p className="mt-2 text-sm font-medium text-on-surface">
                      Status: {getPendingCheckoutStatusLabel(item.prescriptionStatus)}
                    </p>
                    {item.rejectionReason && (
                      <p className="mt-2 text-sm text-on-surface-variant">
                        Motivo: {item.rejectionReason}
                      </p>
                    )}
                  </div>
                  <Link to={item.actionUrl} className="shrink-0">
                    <Button variant="primary" size="sm" className="w-full sm:w-auto">
                      {getPendingCheckoutActionLabel(item.prescriptionStatus)}
                    </Button>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-on-surface-variant">
          {totalElements} {totalElements === 1 ? 'pedido encontrado' : 'pedidos encontrados'}
        </p>

        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filtrar pedidos por status"
        >
          {ORDER_LIST_FILTERS.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={filter === option.value ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => applyFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading && orders.length > 0 && (
        <div className="mb-4 flex justify-center">
          <Spinner size="sm" label="Atualizando pedidos" />
        </div>
      )}

      {error && orders.length > 0 && (
        <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}

      {orders.length === 0 ? (
        <EmptyState
          title="Você ainda não fez pedidos"
          description="Comece a comprar e seus pedidos aparecerão aqui."
          action={
            <Link to={ROUTES.LISTINGS}>
              <Button variant="primary">Ver anúncios</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderSummaryCard key={order.id} order={order} />
            ))}
          </div>

          <Pagination
            className="mt-8"
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </PageWrapper>
  );
};
