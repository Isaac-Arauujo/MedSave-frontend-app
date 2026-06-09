import { useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { OrderConfirmationBanner } from '../../components/shared/OrderConfirmationBanner';
import { OrderStatusBadge } from '../../components/shared/OrderStatusBadge';
import { OrderStatusTimeline } from '../../components/shared/OrderStatusTimeline';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Input } from '../../components/ui/Input';
import { PageLoader } from '../../components/ui/PageLoader';
import {
  getPaymentMethodLabel,
} from '../../constants/checkoutOptions';
import { getPaymentStatusLabel } from '../../constants/paymentOptions';
import { ROUTES } from '../../constants/routes';
import { useOrderDetail } from '../../hooks/useOrderDetail';
import { toOrderResponse } from '../../types/OrderTypes';
import { formatAddressLine } from '../../utils/formatAddress';
import { formatCpf } from '../../utils/formatCpf';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, formatDateTime } from '../../utils/formatDate';

interface OrderDetailLocationState {
  justCreated?: boolean;
  paymentApproved?: boolean;
}

export const OrderDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const state = location.state as OrderDetailLocationState | null;
  const justCreated = state?.justCreated === true;
  const paymentApproved = state?.paymentApproved === true;

  const orderId = useMemo(() => {
    if (!id) {
      return null;
    }

    const parsed = Number(id);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [id]);

  const { order, isLoading, error, refetch } = useOrderDetail(orderId);

  const handleCopy = async (value: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(successMessage);
    } catch {
      toast.error('Não foi possível copiar.');
    }
  };

  if (!orderId) {
    return (
      <PageWrapper title="Detalhe do pedido">
        <EmptyState
          title="Pedido inválido"
          description="O identificador do pedido informado não é válido."
          action={
            <Link to={ROUTES.CUSTOMER_ORDERS}>
              <Button variant="primary">Ver meus pedidos</Button>
            </Link>
          }
        />
      </PageWrapper>
    );
  }

  if (isLoading && !order) {
    return <PageLoader message="Carregando pedido..." />;
  }

  if (error && !order) {
    return <ErrorState message={error} onRetry={() => void refetch()} />;
  }

  if (!order) {
    return (
      <PageWrapper title="Detalhe do pedido">
        <EmptyState
          title="Pedido não encontrado"
          description="Não foi possível carregar os detalhes deste pedido."
          action={
            <Link to={ROUTES.CUSTOMER_ORDERS}>
              <Button variant="primary">Ver meus pedidos</Button>
            </Link>
          }
        />
      </PageWrapper>
    );
  }

  const isPickup = order.deliveryType === 'PICKUP';
  const pickupCode = order.pickupInfo?.pickupCode ?? order.pickupCode;
  const payment = order.payment;
  const showPixPayload =
    order.status === 'PENDING_PAYMENT' &&
    payment?.method === 'PIX' &&
    Boolean(payment.pixPayload);

  return (
    <PageWrapper title="Detalhe do pedido" description={`Pedido ${order.orderNumber}`}>
      {paymentApproved && (
        <section
          className="mb-6 rounded-2xl border border-primary/30 bg-primary/5 p-6"
          role="status"
        >
          <div className="flex items-start gap-3">
            <span
              className="material-symbols-outlined rounded-full bg-primary/10 p-2 text-primary"
              aria-hidden="true"
            >
              check_circle
            </span>
            <div>
              <h2 className="font-headline text-xl font-bold text-on-surface">
                Pagamento confirmado com sucesso!
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Seu pagamento foi aprovado e o pedido seguirá para processamento.
              </p>
            </div>
          </div>
        </section>
      )}

      {justCreated && <OrderConfirmationBanner order={toOrderResponse(order)} />}

      <section className="mb-6 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <h2 className="font-headline text-2xl font-bold text-on-surface">
                {order.orderNumber}
              </h2>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => void handleCopy(order.orderNumber, 'Número do pedido copiado!')}
              >
                Copiar
              </Button>
            </div>
            <p className="text-sm text-on-surface-variant">
              Criado em {formatDate(order.createdAt)}
            </p>
            <p className="mt-2 text-on-surface">
              Farmácia: <span className="font-medium">{order.pharmacy.name}</span>
              {order.pharmacy.phone && (
                <span className="text-on-surface-variant"> · {order.pharmacy.phone}</span>
              )}
            </p>
            <p className="text-sm text-on-surface-variant">
              {order.pharmacy.city} - {order.pharmacy.state}
            </p>
          </div>
          <OrderStatusBadge status={order.status} className="self-start text-sm" />
        </div>
      </section>

      {order.status === 'CANCELLED' && (
        <section
          className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-6"
          role="status"
        >
          <h3 className="mb-2 font-headline text-lg font-bold text-on-surface">Pedido cancelado</h3>
          {order.cancellationReason && (
            <p className="text-sm text-on-surface">
              <span className="font-medium">Motivo:</span> {order.cancellationReason}
            </p>
          )}
          {order.canceledAt && (
            <p className="mt-2 text-sm text-on-surface-variant">
              Cancelado em {formatDateTime(order.canceledAt)}
            </p>
          )}
          {(payment?.refundStatusLabel || order.refundNotice) && (
            <p className="mt-3 text-sm text-on-surface-variant">
              <span className="font-medium">Estorno:</span>{' '}
              {payment?.refundStatusLabel ?? order.refundNotice}
            </p>
          )}
          {!payment?.refundStatusLabel && !order.refundNotice && payment && (
            <p className="mt-3 text-sm text-on-surface-variant">
              <span className="font-medium">Estorno:</span> Não necessário
            </p>
          )}
        </section>
      )}

      <section className="mb-6 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
        <h3 className="mb-4 font-headline text-lg font-bold text-on-surface">Itens do pedido</h3>
        {order.items.length === 0 ? (
          <p className="text-sm text-on-surface-variant">Nenhum item encontrado neste pedido.</p>
        ) : (
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 border-b border-outline-variant pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-on-surface">{item.productName}</p>
                  <p className="text-sm text-on-surface-variant">
                    {item.quantity} × {formatCurrency(item.unitPrice)}
                  </p>
                </div>
                <p className="font-semibold text-on-surface">{formatCurrency(item.subtotal)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-6 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
        <h3 className="mb-4 font-headline text-lg font-bold text-on-surface">Resumo de valores</h3>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-on-surface-variant">Subtotal</dt>
            <dd className="font-medium text-on-surface">{formatCurrency(order.subtotal)}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between">
              <dt className="text-on-surface-variant">Desconto</dt>
              <dd className="font-medium text-[var(--color-success)]">
                -{formatCurrency(order.discount)}
              </dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-on-surface-variant">Frete</dt>
            <dd className="font-medium text-on-surface">{formatCurrency(order.freightPrice)}</dd>
          </div>
          <div className="flex justify-between border-t border-outline-variant pt-3 text-base">
            <dt className="font-semibold text-on-surface">Total</dt>
            <dd className="font-headline font-bold text-primary">{formatCurrency(order.total)}</dd>
          </div>
        </dl>
      </section>

      <section className="mb-6 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
        <h3 className="mb-4 font-headline text-lg font-bold text-on-surface">
          {isPickup ? 'Retirada' : 'Entrega'}
        </h3>

        {isPickup ? (
          <div className="space-y-4">
            {pickupCode && (
              <div className="rounded-2xl border border-primary bg-primary/5 p-4">
                <p className="mb-2 text-sm font-medium text-on-surface-variant">
                  Código de retirada
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-headline text-3xl font-bold tracking-widest text-primary">
                    {pickupCode}
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => void handleCopy(pickupCode, 'Código de retirada copiado!')}
                  >
                    Copiar código
                  </Button>
                </div>
              </div>
            )}
            {order.pickupInfo?.pickupPersonName && (
              <p className="text-sm text-on-surface">
                Retirada por:{' '}
                <span className="font-medium">{order.pickupInfo.pickupPersonName}</span>
                {order.pickupInfo.pickupPersonCpf && (
                  <span className="block text-on-surface-variant">
                    CPF: {formatCpf(order.pickupInfo.pickupPersonCpf)}
                  </span>
                )}
              </p>
            )}
          </div>
        ) : (
          <dl className="space-y-3 text-sm">
            {order.deliveryAddress && (
              <div>
                <dt className="text-on-surface-variant">Endereço</dt>
                <dd className="font-medium text-on-surface">
                  {formatAddressLine(order.deliveryAddress)}
                </dd>
              </div>
            )}
            {order.delivery?.trackingCode && (
              <div>
                <dt className="text-on-surface-variant">Rastreamento</dt>
                <dd className="font-medium text-on-surface">{order.delivery.trackingCode}</dd>
              </div>
            )}
            {order.delivery?.provider && (
              <div>
                <dt className="text-on-surface-variant">Transportadora</dt>
                <dd className="font-medium text-on-surface">{order.delivery.provider}</dd>
              </div>
            )}
            {order.delivery?.deliveryStatus && (
              <div>
                <dt className="text-on-surface-variant">Status da entrega</dt>
                <dd className="font-medium text-on-surface">{order.delivery.deliveryStatus}</dd>
              </div>
            )}
            {order.delivery?.estimatedDelivery && (
              <div>
                <dt className="text-on-surface-variant">Previsão de entrega</dt>
                <dd className="font-medium text-on-surface">
                  {formatDateTime(order.delivery.estimatedDelivery)}
                </dd>
              </div>
            )}
          </dl>
        )}
      </section>

      <section className="mb-6 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
        <h3 className="mb-4 font-headline text-lg font-bold text-on-surface">Pagamento</h3>
        {!payment ? (
          <p className="text-sm text-on-surface-variant">
            {order.status === 'PENDING_PAYMENT'
              ? 'Aguardando pagamento. O pagamento ainda não foi iniciado.'
              : 'Pagamento ainda não iniciado.'}
          </p>
        ) : (
          <>
            <dl className="mb-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-on-surface-variant">Método</dt>
                <dd className="font-medium text-on-surface">
                  {getPaymentMethodLabel(payment.method)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-on-surface-variant">Status</dt>
                <dd className="font-medium text-on-surface">
                  {getPaymentStatusLabel(payment.status)}
                </dd>
              </div>
              {payment.paidAt && (
                <div className="flex justify-between gap-4">
                  <dt className="text-on-surface-variant">Pago em</dt>
                  <dd className="font-medium text-on-surface">{formatDateTime(payment.paidAt)}</dd>
                </div>
              )}
            </dl>

            {showPixPayload && payment.pixPayload && (
              <div>
                <Input
                  label="PIX Copia e Cola"
                  value={payment.pixPayload}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-3"
                  onClick={() => void handleCopy(payment.pixPayload!, 'Código PIX copiado!')}
                >
                  Copiar código PIX
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
        <h3 className="mb-6 font-headline text-lg font-bold text-on-surface">
          Histórico de status
        </h3>
        <OrderStatusTimeline timeline={order.timeline} currentStatus={order.status} />
      </section>
    </PageWrapper>
  );
};
