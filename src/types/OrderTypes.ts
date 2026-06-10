import type { AddressResponse } from './AddressTypes';
import type { DeliveryType, PaymentMethod } from './CheckoutTypes';
import type { PaymentStatus } from './PaymentTypes';

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface OrderItemResponse {
  id: number;
  listingId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  pickupCode?: string;
  status: OrderStatus;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  freightPrice: number;
  total: number;
  createdAt: string;
}

export interface OrderStatusHistoryResponse {
  previousStatus?: OrderStatus;
  newStatus: OrderStatus;
  changedBy: string;
  reason?: string;
  changedAt: string;
}

export interface DeliveryResponse {
  id: number;
  trackingCode?: string;
  provider?: string;
  deliveryStatus?: string;
  estimatedDelivery?: string;
  shippedAt?: string;
  deliveredAt?: string;
  lastUpdatedAt: string;
}

export interface PharmacyBasicResponse {
  id: number;
  name: string;
  phone?: string;
  city: string;
  state: string;
}

export type RefundStatus = 'NOT_REQUIRED' | 'PENDING' | 'REFUNDED' | 'FAILED';

export interface PaymentStatusResponse {
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt?: string;
  pixPayload?: string;
  paymentUrl?: string;
  refundStatus?: RefundStatus;
  refundStatusLabel?: string;
}

export interface PickupInfoResponse {
  pickupCode: string;
  pickupPersonName?: string;
  pickupPersonCpf?: string;
}

export interface OrderDetailResponse {
  id: number;
  orderNumber: string;
  pickupCode?: string;
  status: OrderStatus;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  freightPrice: number;
  total: number;
  createdAt: string;
  items: OrderItemResponse[];
  deliveryAddress?: AddressResponse;
  pharmacy: PharmacyBasicResponse;
  payment?: PaymentStatusResponse | null;
  delivery?: DeliveryResponse;
  timeline: OrderStatusHistoryResponse[];
  pickupInfo?: PickupInfoResponse;
  cancellationReason?: string;
  canceledAt?: string;
  refundNotice?: string;
}

export interface OrderSummaryResponse {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  pharmacyName: string;
  itemCount: number;
  firstItemImage?: string;
  deliveryType: DeliveryType;
  cancellationReason?: string;
  canceledAt?: string;
  refundStatus?: RefundStatus;
  refundStatusLabel?: string;
}

export type OrderListFilter = 'ALL' | 'ACTIVE' | 'DELIVERED' | 'CANCELLED';

export interface GetMyOrdersParams {
  page?: number;
  size?: number;
}

export interface CreateOrderRequest {
  checkoutSessionToken: string;
}

export type OrderCreationErrorCode =
  | 'session_expired'
  | 'insufficient_stock'
  | 'prescription_required'
  | 'prescription_pending'
  | 'prescription_rejected'
  | 'generic';

export interface PrescriptionBlockedItem {
  listingId: number;
  productId: number;
  productName: string;
  prescriptionStatus: string;
  rejectionReason?: string | null;
}

export interface ParsedOrderCreationError {
  code: OrderCreationErrorCode;
  message: string;
  itemName?: string;
  prescriptionItems?: PrescriptionBlockedItem[];
}

export const toOrderResponse = (detail: OrderDetailResponse): OrderResponse => ({
  id: detail.id,
  orderNumber: detail.orderNumber,
  pickupCode: detail.pickupCode ?? detail.pickupInfo?.pickupCode,
  status: detail.status,
  deliveryType: detail.deliveryType,
  paymentMethod: detail.paymentMethod,
  subtotal: detail.subtotal,
  discount: detail.discount,
  freightPrice: detail.freightPrice,
  total: detail.total,
  createdAt: detail.createdAt,
});
