import type { DeliveryType, PaymentMethod } from '../types/CheckoutTypes';

export const DELIVERY_TYPE_OPTIONS: { value: DeliveryType; label: string; description: string }[] =
  [
    { value: 'PICKUP', label: 'Retirada', description: 'Retire na farmácia' },
    { value: 'RAPID', label: 'Entrega rápida', description: 'Receba em até 2 horas' },
    { value: 'SCHEDULED', label: 'Agendada', description: 'Escolha o melhor horário' },
    { value: 'NORMAL', label: 'Normal', description: 'Entrega padrão' },
  ];

export const DELIVERY_OPTION_LABELS: Record<DeliveryType, string> = {
  PICKUP: 'Retirada na farmácia',
  RAPID: 'Hoje em até 2 horas',
  SCHEDULED: 'Entrega agendada',
  NORMAL: 'Entrega normal',
};

export const DELIVERY_OPTION_ICONS: Record<DeliveryType, string> = {
  PICKUP: 'store',
  RAPID: 'bolt',
  SCHEDULED: 'schedule',
  NORMAL: 'local_shipping',
};

export const getDeliveryOptionLabel = (type: DeliveryType): string =>
  DELIVERY_OPTION_LABELS[type] ?? type;

export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'PIX', label: 'PIX' },
  { value: 'CREDIT_CARD', label: 'Cartão de crédito' },
];

export const getDeliveryTypeLabel = (type: DeliveryType): string =>
  DELIVERY_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;

export const getPaymentMethodLabel = (method: PaymentMethod): string =>
  PAYMENT_METHOD_OPTIONS.find((option) => option.value === method)?.label ?? method;
