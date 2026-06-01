import type { OrderStatus } from '../types/OrderTypes';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral';

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; variant: BadgeVariant }
> = {
  PENDING_PAYMENT: { label: 'Aguardando pagamento', variant: 'warning' },
  PAID: { label: 'Pago', variant: 'success' },
  PREPARING: { label: 'Em preparação', variant: 'neutral' },
  READY_FOR_PICKUP: { label: 'Pronto para retirada', variant: 'success' },
  DISPATCHED: { label: 'Enviado', variant: 'neutral' },
  DELIVERED: { label: 'Entregue', variant: 'success' },
  CANCELLED: { label: 'Cancelado', variant: 'danger' },
  EXPIRED: { label: 'Expirado', variant: 'neutral' },
};

export const getOrderStatusLabel = (status: OrderStatus): string =>
  ORDER_STATUS_CONFIG[status]?.label ?? status;
