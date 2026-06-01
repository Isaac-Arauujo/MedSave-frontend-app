import type { DeliveryType } from '../types/CheckoutTypes';
import type { OrderStatus } from '../types/OrderTypes';

export interface PharmacyOrderTransition {
  label: string;
  newStatus: OrderStatus;
}

export const getAvailableOrderTransitions = (
  status: OrderStatus,
  deliveryType: DeliveryType
): PharmacyOrderTransition[] => {
  switch (status) {
    case 'PAID':
      return [{ label: 'Iniciar preparo', newStatus: 'PREPARING' }];
    case 'PREPARING':
      if (deliveryType === 'PICKUP') {
        return [{ label: 'Marcar pronto', newStatus: 'READY_FOR_PICKUP' }];
      }
      return [{ label: 'Marcar enviado', newStatus: 'DISPATCHED' }];
    case 'READY_FOR_PICKUP':
      return [{ label: 'Marcar entregue', newStatus: 'DELIVERED' }];
    case 'DISPATCHED':
      return [{ label: 'Marcar entregue', newStatus: 'DELIVERED' }];
    default:
      return [];
  }
};
