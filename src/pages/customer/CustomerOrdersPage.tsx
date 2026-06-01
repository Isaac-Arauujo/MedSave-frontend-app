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
import { ROUTES } from '../../constants/routes';
import { useCustomerOrders } from '../../hooks/useCustomerOrders';

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

  if (isLoading && orders.length === 0) {
    return <PageLoader message="Carregando pedidos..." />;
  }

  if (error && orders.length === 0) {
    return <ErrorState message={error} onRetry={() => void refetch()} />;
  }

  return (
    <PageWrapper title="Meus pedidos" description="Acompanhe todos os seus pedidos em um só lugar.">
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
