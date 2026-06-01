import type { OrderListFilter } from '../types/OrderTypes';

export const ORDER_LIST_FILTERS: { value: OrderListFilter; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'ACTIVE', label: 'Ativos' },
  { value: 'DELIVERED', label: 'Entregues' },
  { value: 'CANCELLED', label: 'Cancelados' },
];

export const CUSTOMER_ORDERS_PAGE_SIZE = 10;
