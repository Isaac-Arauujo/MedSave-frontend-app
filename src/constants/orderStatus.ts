import type { OrderStatus } from '../types/OrderTypes';

export type OrderStatusColor =
  | 'yellow'
  | 'blue'
  | 'orange'
  | 'purple'
  | 'indigo'
  | 'green'
  | 'red'
  | 'gray';

export const ORDER_STATUS_COLORS: Record<OrderStatus, OrderStatusColor> = {
  PENDING_PAYMENT: 'yellow',
  PAID: 'blue',
  PREPARING: 'orange',
  READY_FOR_PICKUP: 'purple',
  DISPATCHED: 'indigo',
  DELIVERED: 'green',
  CANCELLED: 'red',
  EXPIRED: 'gray',
};

export const ORDER_STATUS_COLOR_CLASSES: Record<OrderStatusColor, string> = {
  yellow: 'bg-amber-100 text-amber-800',
  blue: 'bg-blue-100 text-blue-800',
  orange: 'bg-orange-100 text-orange-800',
  purple: 'bg-purple-100 text-purple-800',
  indigo: 'bg-indigo-100 text-indigo-800',
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-gray-100 text-gray-700',
};

export const getOrderStatusBadgeClass = (status: OrderStatus): string =>
  ORDER_STATUS_COLOR_CLASSES[ORDER_STATUS_COLORS[status]];

export const ORDER_STATUS_TIMELINE_DOT_CLASSES: Record<OrderStatusColor, string> = {
  yellow: 'bg-amber-500',
  blue: 'bg-blue-500',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
  indigo: 'bg-indigo-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  gray: 'bg-gray-500',
};

export const getOrderStatusTimelineDotClass = (status: OrderStatus): string =>
  ORDER_STATUS_TIMELINE_DOT_CLASSES[ORDER_STATUS_COLORS[status]];
