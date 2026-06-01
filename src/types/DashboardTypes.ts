import type { AddressResponse } from './AddressTypes';

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface RecentOrderSummary {
  orderNumber: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  pharmacyName: string;
}

export interface CustomerDashboardResponse {
  firstName: string;
  lastName: string;
  email: string;
  mainAddress?: AddressResponse;
  favoritesCount: number;
  recentOrders: RecentOrderSummary[];
}

export const INACTIVE_ORDER_STATUSES: OrderStatus[] = ['DELIVERED', 'CANCELLED', 'EXPIRED'];

export const isActiveOrderStatus = (status: OrderStatus): boolean =>
  !INACTIVE_ORDER_STATUSES.includes(status);
