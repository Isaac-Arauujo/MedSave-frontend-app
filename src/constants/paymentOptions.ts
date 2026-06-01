import type { PaymentStatus } from '../types/PaymentTypes';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral';

export const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; variant: BadgeVariant }
> = {
  PENDING: { label: 'Aguardando pagamento', variant: 'warning' },
  APPROVED: { label: 'Aprovado', variant: 'success' },
  REJECTED: { label: 'Rejeitado', variant: 'danger' },
  CANCELLED: { label: 'Cancelado', variant: 'danger' },
  REFUNDED: { label: 'Reembolsado', variant: 'neutral' },
};

export const PAYMENT_POLL_INTERVAL_MS = 5000;

export const getPaymentStatusLabel = (status: PaymentStatus): string =>
  PAYMENT_STATUS_CONFIG[status]?.label ?? status;
