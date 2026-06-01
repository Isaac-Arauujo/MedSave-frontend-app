import type { AddressResponse } from './AddressTypes';

export type DeliveryType = 'PICKUP' | 'RAPID' | 'SCHEDULED' | 'NORMAL';

export type PaymentMethod = 'PIX' | 'CREDIT_CARD';

export type CheckoutStatus = 'ACTIVE' | 'COMPLETED' | 'EXPIRED';

export type CheckoutStep = 'delivery' | 'payment' | 'review';

export interface CheckoutSessionResponse {
  id: number;
  sessionToken: string;
  status: CheckoutStatus;
  expiresAt: string;
  deliveryType?: DeliveryType;
  paymentMethod?: PaymentMethod;
  selectedAddress?: AddressResponse;
  freightPrice?: number;
  freightEstimate?: string;
  pickupPersonName?: string;
  pickupPersonCpf?: string;
  pickupPersonPhone?: string;
}

export interface UpdateDeliveryRequest {
  deliveryType: DeliveryType;
  addressId?: number;
}

export interface UpdatePaymentRequest {
  paymentMethod: PaymentMethod;
}

export interface UpdatePickupPersonRequest {
  pickupPersonName: string;
  pickupPersonCpf: string;
  pickupPersonPhone?: string;
}
