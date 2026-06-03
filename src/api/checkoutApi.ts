import type { CheckoutSessionResponse, DeliveryType, UpdateDeliveryRequest, UpdatePaymentRequest, UpdatePickupPersonRequest } from '../types/CheckoutTypes';
import type { FreightResult } from '../types/FreightTypes';
import { api } from './axiosInstance';
export const createSession = async (): Promise<CheckoutSessionResponse> => {
  const response = await api.post<CheckoutSessionResponse>('/checkout/session');
  return response.data;
};

export const getSession = async (token: string): Promise<CheckoutSessionResponse> => {
  const response = await api.get<CheckoutSessionResponse>(`/checkout/session/${token}`);
  return response.data;
};

export const updateDelivery = async (
  token: string,
  data: UpdateDeliveryRequest
): Promise<CheckoutSessionResponse> => {
  const response = await api.patch<CheckoutSessionResponse>(
    `/checkout/session/${token}/delivery`,
    data
  );
  return response.data;
};

export const updatePayment = async (
  token: string,
  data: UpdatePaymentRequest
): Promise<CheckoutSessionResponse> => {
  const response = await api.patch<CheckoutSessionResponse>(
    `/checkout/session/${token}/payment`,
    data
  );
  return response.data;
};

export const updatePickupPerson = async (
  token: string,
  data: UpdatePickupPersonRequest
): Promise<CheckoutSessionResponse> => {
  const response = await api.patch<CheckoutSessionResponse>(
    `/checkout/session/${token}/pickup-person`,
    data
  );
  return response.data;
};

export interface CalculateFreightParams {
  originZip: string;
  destinationZip: string;
  deliveryType: DeliveryType;
  originLatitude?: number;
  originLongitude?: number;
  originAddress?: string;
  originContactName?: string;
  originPhone?: string;
  destinationLatitude?: number;
  destinationLongitude?: number;
  destinationAddress?: string;
  recipientName?: string;
  recipientPhone?: string;
}

export const calculateFreight = async (
  params: CalculateFreightParams
): Promise<FreightResult> => {
  const response = await api.get<FreightResult>('/checkout/freight', {
    params,
  });
  return response.data;
};

// Backward-compatible alias used by useCart
export const createCheckoutSession = createSession;