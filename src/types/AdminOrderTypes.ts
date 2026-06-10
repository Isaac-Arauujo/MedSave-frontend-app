import type { DeliveryType } from './CheckoutTypes';
import type { OrderStatus, RefundStatus } from './OrderTypes';
import type { PaymentStatus } from './PaymentTypes';

export type AdminOrderStatusAction = 'MARK_PREPARING' | 'MARK_READY_FOR_PICKUP' | 'MARK_DELIVERED';

export interface AdminOrderSummaryResponse {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  statusLabel: string;
  customerName: string;
  customerEmail: string;
  pharmacyName: string;
  deliveryType: DeliveryType;
  deliveryTypeLabel: string;
  paymentStatus?: PaymentStatus;
  paymentStatusLabel: string;
  refundStatus: RefundStatus;
  refundStatusLabel: string;
  total: number;
  createdAt: string;
}

export interface AdminOrderCustomerResponse {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

export interface AdminOrderPharmacyResponse {
  id: number;
  name: string;
  email: string;
}

export interface AdminOrderPaymentResponse {
  provider: string;
  status: PaymentStatus;
  statusLabel: string;
  amount: number;
  externalId?: string;
  paidAt?: string;
}

export interface AdminOrderRefundResponse {
  status: RefundStatus;
  statusLabel: string;
  amount?: number;
  requestedAt?: string;
  processedAt?: string;
  failureReason?: string;
}

export interface AdminOrderDeliverySummaryResponse {
  type: DeliveryType;
  typeLabel: string;
  freightPrice: number;
  estimate: string;
  pickupCode?: string;
}

export interface AdminOrderInternalNoteResponse {
  id: number;
  note: string;
  createdByEmail: string;
  createdAt: string;
}

export interface AdminOrderDetailResponse {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  statusLabel: string;
  deliveryType: DeliveryType;
  deliveryTypeLabel: string;
  subtotal: number;
  discount: number;
  freightPrice: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  customer: AdminOrderCustomerResponse;
  pharmacy: AdminOrderPharmacyResponse;
  items: {
    id: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  payment?: AdminOrderPaymentResponse;
  refund: AdminOrderRefundResponse;
  delivery: AdminOrderDeliverySummaryResponse;
  statusHistory: {
    previousStatus?: OrderStatus;
    newStatus: OrderStatus;
    changedBy: string;
    reason?: string;
    changedAt: string;
  }[];
  internalNotes: AdminOrderInternalNoteResponse[];
  cancellationReason?: string;
  canceledAt?: string;
  canceledByRole?: string;
  refundNotice?: string;
  pickupCode?: string;
}

export interface AdminOrderListParams {
  page?: number;
  size?: number;
  search?: string;
  status?: OrderStatus;
  pharmacyId?: number;
  customerId?: number;
  deliveryType?: DeliveryType;
  paymentStatus?: PaymentStatus;
  refundStatus?: RefundStatus;
  dateFrom?: string;
  dateTo?: string;
}

export interface AdminOrderCancelRequest {
  reason: string;
}

export interface AdminOrderStatusRequest {
  action: AdminOrderStatusAction;
  reason: string;
}

export interface AdminOrderNoteRequest {
  note: string;
}

export interface AdminOrderCancelResponse {
  orderId: number;
  status: OrderStatus;
  refundStatus: RefundStatus;
  refundMessage?: string;
}

export interface AdminOrderActionOption {
  action: AdminOrderStatusAction;
  label: string;
}
