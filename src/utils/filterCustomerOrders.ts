import type { OrderListFilter, OrderSummaryResponse } from '../types/OrderTypes';

export const filterCustomerOrders = (
  orders: OrderSummaryResponse[],
  filter: OrderListFilter
): OrderSummaryResponse[] => {
  if (filter === 'ALL') {
    return orders;
  }

  if (filter === 'DELIVERED') {
    return orders.filter((order) => order.status === 'DELIVERED');
  }

  if (filter === 'CANCELLED') {
    return orders.filter((order) => order.status === 'CANCELLED');
  }

  if (filter === 'ACTIVE') {
    return orders.filter(
      (order) =>
        order.status !== 'DELIVERED' &&
        order.status !== 'CANCELLED' &&
        order.status !== 'EXPIRED'
    );
  }

  return orders;
};
