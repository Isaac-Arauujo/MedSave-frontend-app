import type { PaymentMethod } from './CheckoutTypes';
import type { CardPaymentPayload } from './MercadoPagoTypes';
import type { OrderResponse } from './OrderTypes';

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'REFUNDED';

export interface PaymentInitiateResponse {
  paymentId: number;
  externalId?: string;
  method: PaymentMethod;
  status: PaymentStatus;
  pixPayload?: string;
  pixQrCodeBase64?: string;
  paymentUrl?: string;
  expiresAt?: string;
}

export interface PaymentResponse {
  id: number;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  paidAt?: string;
  pixPayload?: string;
  paymentUrl?: string;
}

export interface InitiatePaymentRequest {
  orderId: number;
  method: PaymentMethod;
  card?: CardPaymentPayload;
}

export interface PaymentLocationState {
  orderId: number;
  paymentMethod: PaymentMethod;
  order?: OrderResponse;
}
