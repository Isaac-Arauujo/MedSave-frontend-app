import type { DeliveryType } from '../types/CheckoutTypes';
import type { OrderStatus } from '../types/OrderTypes';
import type { AdminOrderActionOption, AdminOrderStatusAction } from '../types/AdminOrderTypes';

const NON_CANCELLABLE: OrderStatus[] = ['DELIVERED', 'CANCELLED', 'EXPIRED'];

export const canAdminCancelOrder = (status: OrderStatus): boolean =>
  !NON_CANCELLABLE.includes(status);

export const getAvailableAdminOrderActions = (
  status: OrderStatus,
  deliveryType: DeliveryType
): AdminOrderActionOption[] => {
  switch (status) {
    case 'PAID':
      return [{ action: 'MARK_PREPARING', label: 'Marcar em preparação' }];
    case 'PREPARING':
      return [
        {
          action: 'MARK_READY_FOR_PICKUP',
          label: deliveryType === 'PICKUP' ? 'Marcar pronto para retirada' : 'Marcar enviado',
        },
      ];
    case 'READY_FOR_PICKUP':
    case 'DISPATCHED':
      return [{ action: 'MARK_DELIVERED', label: 'Marcar como entregue' }];
    default:
      return [];
  }
};

export const getAdminActionDescription = (action: AdminOrderStatusAction): string => {
  switch (action) {
    case 'MARK_PREPARING':
      return 'O pedido será marcado como em preparação.';
    case 'MARK_READY_FOR_PICKUP':
      return 'O pedido será marcado como pronto para retirada ou enviado, conforme o tipo de entrega.';
    case 'MARK_DELIVERED':
      return 'O pedido será marcado como entregue.';
    default:
      return 'Essa alteração será registrada no histórico e na auditoria.';
  }
};

export const canAdminResendEmail = (_status: OrderStatus): boolean => true;

export const canAdminAddNote = (_status: OrderStatus): boolean => true;
