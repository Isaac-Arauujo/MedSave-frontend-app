import { useState } from 'react';
import { AdminOrderNoteModal } from '../../components/shared/AdminOrderNoteModal';
import { OrderCancelModal } from '../../components/shared/OrderCancelModal';
import { OrderStatusBadge } from '../../components/shared/OrderStatusBadge';
import { OrderStatusTimeline } from '../../components/shared/OrderStatusTimeline';
import { OrderStatusUpdateModal } from '../../components/shared/OrderStatusUpdateModal';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/PageLoader';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import {
  canAdminAddNote,
  canAdminCancelOrder,
  canAdminResendEmail,
  getAdminActionDescription,
  getAvailableAdminOrderActions,
} from '../../constants/adminOrderTransitions';
import { getOrderStatusLabel } from '../../constants/orderOptions';
import { useAdminOrders } from '../../hooks/useAdminOrders';
import type { AdminOrderActionOption, AdminOrderSummaryResponse } from '../../types/AdminOrderTypes';
import type { OrderStatus } from '../../types/OrderTypes';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';

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

export const AdminOrdersPage = () => {
  const {
    orders,
    selectedOrder,
    currentPage,
    totalPages,
    statusFilter,
    isLoading,
    isDetailLoading,
    isSubmitting,
    error,
    setCurrentPage,
    applySearch,
    applyStatusFilter,
    loadOrderDetail,
    setSelectedOrder,
    cancelOrder,
    applyStatusAction,
    addInternalNote,
    resendEmail,
    refetch,
  } = useAdminOrders();

  const [searchInput, setSearchInput] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<number | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    orderId: number;
    action: AdminOrderActionOption;
  } | null>(null);
  const [noteOrderId, setNoteOrderId] = useState<number | null>(null);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    applySearch(searchInput);
  };

  const handleOpenDetail = async (order: AdminOrderSummaryResponse) => {
    setDetailOpen(true);
    await loadOrderDetail(order.id);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedOrder(null);
  };

  const handleConfirmCancel = async (reason: string) => {
    if (cancelOrderId == null) {
      return;
    }
    await cancelOrder(cancelOrderId, { reason });
    setCancelOrderId(null);
  };

  const handleConfirmAction = async (reason?: string) => {
    if (!pendingAction || !reason) {
      return;
    }
    await applyStatusAction(pendingAction.orderId, pendingAction.action.action, reason);
    setPendingAction(null);
  };

  const handleConfirmNote = async (note: string) => {
    if (noteOrderId == null) {
      return;
    }
    await addInternalNote(noteOrderId, { note });
    setNoteOrderId(null);
  };

  if (error && orders.length === 0 && !isLoading) {
    return <ErrorState message={error} onRetry={() => void refetch()} />;
  }

  const detailActions = selectedOrder
    ? getAvailableAdminOrderActions(selectedOrder.status, selectedOrder.deliveryType)
    : [];

  return (
    <PageWrapper title="Pedidos" description="Acompanhe e intervenha em pedidos com segurança.">
      <form
        className="mb-6 grid gap-3 md:grid-cols-[1fr_auto_auto]"
        onSubmit={handleSearchSubmit}
      >
        <Input
          label="Buscar por pedido, cliente ou farmácia"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Ex.: MS2026000123 ou maria@email.com"
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-on-surface" htmlFor="status-filter">
            Status
          </label>
          <select
            id="status-filter"
            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-sm text-on-surface"
            value={statusFilter}
            onChange={(event) => applyStatusFilter(event.target.value as OrderStatus | '')}
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <Button type="submit" variant="primary" className="w-full">
            Buscar
          </Button>
        </div>
      </form>

      {isLoading ? (
        <PageLoader message="Carregando pedidos..." />
      ) : orders.length === 0 ? (
        <EmptyState
          title="Nenhum pedido encontrado"
          description="Ajuste os filtros ou aguarde novos pedidos."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-outline-variant">
          <table className="min-w-full divide-y divide-outline-variant">
            <thead className="bg-surface-container">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">Pedido</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">Farmácia</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">Pagamento</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">Estorno</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">Entrega</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">Data</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-surface-container">
                  <td className="px-4 py-3 text-sm font-medium text-on-surface">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-sm text-on-surface-variant">
                    <div>{order.customerName}</div>
                    <div className="text-xs">{order.customerEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-on-surface-variant">{order.pharmacyName}</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-on-surface-variant">{order.paymentStatusLabel}</td>
                  <td className="px-4 py-3 text-sm text-on-surface-variant">{order.refundStatusLabel}</td>
                  <td className="px-4 py-3 text-sm text-on-surface-variant">{order.deliveryTypeLabel}</td>
                  <td className="px-4 py-3 text-sm font-medium text-on-surface">{formatCurrency(order.total)}</td>
                  <td className="px-4 py-3 text-sm text-on-surface-variant">{formatDateTime(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Button type="button" variant="secondary" size="sm" onClick={() => void handleOpenDetail(order)}>
                      Ver detalhes
                    </Button>
                  </td>
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

      <Modal
        isOpen={detailOpen}
        onClose={handleCloseDetail}
        title={selectedOrder ? `Pedido ${selectedOrder.orderNumber}` : 'Detalhe do pedido'}
        size="lg"
        footer={
          selectedOrder && (
            <div className="flex flex-wrap justify-end gap-2">
              {canAdminCancelOrder(selectedOrder.status) && (
                <Button variant="danger" onClick={() => setCancelOrderId(selectedOrder.id)}>
                  Cancelar pedido
                </Button>
              )}
              {detailActions.map((action) => (
                <Button
                  key={action.action}
                  variant="primary"
                  onClick={() => setPendingAction({ orderId: selectedOrder.id, action })}
                >
                  {action.label}
                </Button>
              ))}
              {canAdminResendEmail(selectedOrder.status) && (
                <Button variant="secondary" onClick={() => void resendEmail(selectedOrder.id)} isLoading={isSubmitting}>
                  Reenviar e-mail
                </Button>
              )}
              {canAdminAddNote(selectedOrder.status) && (
                <Button variant="secondary" onClick={() => setNoteOrderId(selectedOrder.id)}>
                  Adicionar observação
                </Button>
              )}
              <Button variant="secondary" onClick={handleCloseDetail}>
                Fechar
              </Button>
            </div>
          )
        }
      >
        {isDetailLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : selectedOrder ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <OrderStatusBadge status={selectedOrder.status} />
              <Badge variant="neutral">{selectedOrder.deliveryTypeLabel}</Badge>
            </div>

            <section>
              <h3 className="mb-2 text-sm font-semibold uppercase text-on-surface-variant">Cliente</h3>
              <p className="text-on-surface">{selectedOrder.customer.name}</p>
              <p className="text-sm text-on-surface-variant">{selectedOrder.customer.email}</p>
              {selectedOrder.customer.phone && (
                <p className="text-sm text-on-surface-variant">{selectedOrder.customer.phone}</p>
              )}
            </section>

            <section>
              <h3 className="mb-2 text-sm font-semibold uppercase text-on-surface-variant">Farmácia</h3>
              <p className="text-on-surface">{selectedOrder.pharmacy.name}</p>
              <p className="text-sm text-on-surface-variant">{selectedOrder.pharmacy.email}</p>
            </section>

            <section>
              <h3 className="mb-2 text-sm font-semibold uppercase text-on-surface-variant">Itens</h3>
              <ul className="space-y-2">
                {selectedOrder.items.map((item) => (
                  <li key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.productName}
                    </span>
                    <span>{formatCurrency(item.subtotal)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-right font-semibold text-on-surface">
                Total: {formatCurrency(selectedOrder.total)}
              </p>
            </section>

            {selectedOrder.payment && (
              <section>
                <h3 className="mb-2 text-sm font-semibold uppercase text-on-surface-variant">Pagamento</h3>
                <p className="text-sm text-on-surface">{selectedOrder.payment.statusLabel}</p>
                <p className="text-sm text-on-surface-variant">
                  Valor: {formatCurrency(selectedOrder.payment.amount)}
                </p>
                {selectedOrder.payment.externalId && (
                  <p className="text-sm text-on-surface-variant">ID: {selectedOrder.payment.externalId}</p>
                )}
              </section>
            )}

            <section>
              <h3 className="mb-2 text-sm font-semibold uppercase text-on-surface-variant">Estorno</h3>
              <p className="text-sm text-on-surface">{selectedOrder.refund.statusLabel}</p>
              {selectedOrder.refundNotice && (
                <p className="mt-1 text-sm text-on-surface-variant">{selectedOrder.refundNotice}</p>
              )}
            </section>

            <section>
              <h3 className="mb-2 text-sm font-semibold uppercase text-on-surface-variant">Entrega / Retirada</h3>
              <p className="text-sm text-on-surface">{selectedOrder.delivery.estimate}</p>
              {selectedOrder.delivery.pickupCode && (
                <p className="text-sm text-on-surface-variant">Código: {selectedOrder.delivery.pickupCode}</p>
              )}
            </section>

            {selectedOrder.cancellationReason && (
              <section>
                <h3 className="mb-2 text-sm font-semibold uppercase text-on-surface-variant">Cancelamento</h3>
                <p className="text-sm text-on-surface">{selectedOrder.cancellationReason}</p>
              </section>
            )}

            <section>
              <h3 className="mb-2 text-sm font-semibold uppercase text-on-surface-variant">Histórico</h3>
              <OrderStatusTimeline
                timeline={selectedOrder.statusHistory}
                currentStatus={selectedOrder.status}
              />
            </section>

            {selectedOrder.internalNotes.length > 0 && (
              <section>
                <h3 className="mb-2 text-sm font-semibold uppercase text-on-surface-variant">
                  Observações internas
                </h3>
                <ul className="space-y-3">
                  {selectedOrder.internalNotes.map((note) => (
                    <li key={note.id} className="rounded-xl border border-outline-variant bg-surface-container px-4 py-3 text-sm">
                      <p className="text-on-surface">{note.note}</p>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        {note.createdByEmail} · {formatDateTime(note.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        ) : null}
      </Modal>

      <OrderCancelModal
        isOpen={cancelOrderId != null}
        onClose={() => setCancelOrderId(null)}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirmCancel}
        description="Essa ação pode gerar estorno automático se o pedido estiver pago. Informe o motivo do cancelamento."
      />

      <OrderStatusUpdateModal
        isOpen={pendingAction != null}
        onClose={() => setPendingAction(null)}
        title="Alterar status"
        description={
          pendingAction
            ? `${getAdminActionDescription(pendingAction.action.action)} Essa alteração será registrada no histórico e na auditoria.`
            : ''
        }
        confirmLabel="Confirmar alteração"
        isSubmitting={isSubmitting}
        requireReason
        onConfirm={handleConfirmAction}
      />

      <AdminOrderNoteModal
        isOpen={noteOrderId != null}
        onClose={() => setNoteOrderId(null)}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirmNote}
      />
    </PageWrapper>
  );
};
