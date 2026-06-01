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

export const calculateFreight = async (
  originZip: string,
  destinationZip: string,
  deliveryType: DeliveryType
): Promise<FreightResult> => {
  const response = await api.get<FreightResult>('/checkout/freight', {
    params: { originZip, destinationZip, deliveryType },
  });
  return response.data;
};

// Backward-compatible alias used by useCart
export const createCheckoutSession = createSession;