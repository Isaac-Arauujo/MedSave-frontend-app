import type { DeliveryType } from './CheckoutTypes';
import type { OrderStatus } from './OrderTypes';

export interface PickupOrderResponse {
  id: number;
  orderNumber: string;
  pickupCode?: string;
  customerName: string;
  pickupPersonName?: string;
  status: OrderStatus;
  createdAt: string;
}

export interface OrderStatusTransitionRequest {
  newStatus: OrderStatus;
  reason?: string;
}

export interface CancelPharmacyOrderRequest {
  reason: string;
}

export interface GetPharmacyOrdersParams {
  page?: number;
  size?: number;
  status?: OrderStatus;
}

export interface GetPickupOrdersParams {
  page?: number;
  size?: number;
}

export interface UpdatePharmacyDeliveryRequest {
  trackingCode?: string;
  provider?: string;
  deliveryStatus?: string;
  estimatedDelivery?: string;
}

export type PharmacyOrdersTab = 'all' | 'pickups' | 'deliveries';

export const isDeliveryOrder = (deliveryType: DeliveryType): boolean => deliveryType !== 'PICKUP';
