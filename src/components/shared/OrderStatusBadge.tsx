import clsx from 'clsx';
import { getOrderStatusBadgeClass } from '../../constants/orderStatus';
import { getOrderStatusLabel } from '../../constants/orderOptions';
import type { OrderStatus } from '../../types/OrderTypes';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export const OrderStatusBadge = ({ status, className }: OrderStatusBadgeProps) => (
  <span
    className={clsx(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
      getOrderStatusBadgeClass(status),
      className
    )}
  >
    {getOrderStatusLabel(status)}
  </span>
);
