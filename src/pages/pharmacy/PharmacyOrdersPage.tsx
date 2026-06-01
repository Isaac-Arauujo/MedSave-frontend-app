import { useState } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { OrderStatusBadge } from '../../components/shared/OrderStatusBadge';
import { OrderStatusUpdateModal } from '../../components/shared/OrderStatusUpdateModal';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { PageLoader } from '../../components/ui/PageLoader';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { getDeliveryOptionLabel } from '../../constants/checkoutOptions';
import { getOrderStatusLabel } from '../../constants/orderOptions';
import { getAvailableOrderTransitions } from '../../constants/pharmacyOrderTransitions';
import { usePharmacyOrders } from '../../hooks/usePharmacyOrders';
import type { OrderStatus, OrderSummaryResponse } from '../../types/OrderTypes';
import type { PharmacyOrdersTab } from '../../types/PharmacyOrderTypes';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

const TABS: { key: PharmacyOrdersTab; label: string }[] = [
  { key: 'all', label: 'Todos os pedidos' },
  { key: 'pickups', label: 'Retiradas' },
  { key: 'deliveries', label: 'Entregas' },
];

const STATUS_FILTER_OPTIONS: { value: OrderStatus | ''; label: string }[] = [
  { value: '', label: 'Todos os status' },
  { value: 'PENDING_PAYMENT', label: getOrderStatusLabel('PENDING_PAYMENT') },
  { value: 'PAID', label: getOrderStatusLabel('PAID') },
  { value: 'PREPARING', label: getOrderStatusLabel('PREPARING') },
  { value: 'READY_FOR_PICKUP', label: getOrderStatusLabel('READY_FOR_PICKUP') },
  { value: 'DISPATCHED', label: getOrderStatusLabel('DISPATCHED') },
  { value: 'DELIVERED', label: getOrderStatusLabel('DELIVERED') },
  { value: 'CANCELLED', label: getOrderStatusLabel('CANCELLED') },
  { value: 'EXPIRED', label: getOrderStatusLabel('EXPIRED') },
];

interface PendingTransition {
  orderId: number;
  label: string;
  newStatus: OrderStatus;
}

export const PharmacyOrdersPage = () => {
  const {
    activeTab,
    statusFilter,
    currentPage,
    orders,
    pickupOrders,
    totalPages,
    totalElements,
    isLoading,
    isSubmitting,
    error,
    setCurrentPage,
    changeTab,
    applyStatusFilter,
    updateOrderStatus,
    refetch,
  } = usePharmacyOrders();

  const [pendingTransition, setPendingTransition] = useState<PendingTransition | null>(null);

  const handleConfirmTransition = async (reason?: string) => {
    if (!pendingTransition) {
      return;
    }

    await updateOrderStatus(pendingTransition.orderId, {
      newStatus: pendingTransition.newStatus,
      reason,
    });
    setPendingTransition(null);
  };

  const renderOrderActions = (orderId: number, status: OrderStatus, deliveryType: OrderSummaryResponse['deliveryType']) => {
    const transitions = getAvailableOrderTransitions(status, deliveryType);

    if (transitions.length === 0) {
      return <span className="text-sm text-on-surface-variant">—</span>;
    }

    return (
      <div className="flex flex-wrap gap-2">
        {transitions.map((transition) => (
          <Button
            key={transition.newStatus}
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              setPendingTransition({
                orderId,
                label: transition.label,
                newStatus: transition.newStatus,
              })
            }
          >
            {transition.label}
          </Button>
        ))}
      </div>
    );
  };

  if (isLoading && orders.length === 0 && pickupOrders.length === 0) {
    return <PageLoader message="Carregando pedidos..." />;
  }

  if (error && orders.length === 0 && pickupOrders.length === 0) {
    return <ErrorState message={error} onRetry={() => void refetch()} />;
  }

  return (
    <PageWrapper title="Pedidos da farmácia" description="Gerencie pedidos, retiradas e entregas.">
      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Abas de pedidos">
        {TABS.map((tab) => (
          <Button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            variant={activeTab === tab.key ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => changeTab(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === 'all' && (
        <div className="mb-6">
          <label htmlFor="status-filter" className="mb-1 block text-sm font-medium text-on-surface">
            Filtrar por status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(event) => applyStatusFilter(event.target.value as OrderStatus | '')}
            className="w-full max-w-xs rounded-xl border border-outline-variant bg-surface px-3 py-2.5 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <p className="mb-4 text-sm text-on-surface-variant">
        {totalElements} {totalElements === 1 ? 'pedido encontrado' : 'pedidos encontrados'}
      </p>

      {isLoading && (orders.length > 0 || pickupOrders.length > 0) && (
        <div className="mb-4 flex justify-center">
          <Spinner size="sm" label="Atualizando pedidos" />
        </div>
      )}

      {error && (orders.length > 0 || pickupOrders.length > 0) && (
        <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}

      {activeTab === 'pickups' ? (
        pickupOrders.length === 0 ? (
          <EmptyState title="Nenhuma retirada pendente" description="Pedidos para retirada aparecerão aqui." />
        ) : (
          <div className="space-y-4">
            {pickupOrders.map((order) => (
              <article
                key={order.id}
                className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4"
              >
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-headline font-bold text-on-surface">{order.orderNumber}</p>
                    <p className="text-sm text-on-surface-variant">
                      {formatDate(order.createdAt)} · {order.customerName}
                    </p>
                    {order.pickupPersonName && (
                      <p className="text-sm text-on-surface-variant">
                        Retirada por: {order.pickupPersonName}
                      </p>
                    )}
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>

                <div className="mb-4 rounded-2xl border border-primary bg-primary/5 p-4">
                  <p className="mb-1 text-sm font-medium text-on-surface-variant">Código de retirada</p>
                  <p className="font-headline text-2xl font-bold tracking-widest text-primary">
                    {order.pickupCode}
                  </p>
                </div>

                {renderOrderActions(order.id, order.status, 'PICKUP')}
              </article>
            ))}
          </div>
        )
      ) : orders.length === 0 ? (
        <EmptyState title="Nenhum pedido encontrado" description="Ajuste os filtros ou aguarde novos pedidos." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-outline-variant">
          <table className="min-w-full divide-y divide-outline-variant">
            <thead className="bg-surface-container">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                  Pedido
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                  Data
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                  Entrega
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 text-sm font-medium text-on-surface">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-sm text-on-surface-variant">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Badge variant="neutral">{getDeliveryOptionLabel(order.deliveryType)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-on-surface">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3">{renderOrderActions(order.id, order.status, order.deliveryType)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        className="mt-8"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <OrderStatusUpdateModal
        isOpen={Boolean(pendingTransition)}
        onClose={() => setPendingTransition(null)}
        title="Confirmar atualização de status"
        description={
          pendingTransition
            ? `Deseja confirmar a ação "${pendingTransition.label}" para este pedido?`
            : ''
        }
        confirmLabel={pendingTransition?.label ?? 'Confirmar'}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirmTransition}
      />
    </PageWrapper>
  );
};
