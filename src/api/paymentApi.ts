import type { PaymentPublicConfig } from '../types/MercadoPagoTypes';
import type {
  InitiatePaymentRequest,
  PaymentInitiateResponse,
  PaymentResponse,
} from '../types/PaymentTypes';
import { api } from './axiosInstance';

export const getPaymentPublicConfig = async (): Promise<PaymentPublicConfig> => {
  const response = await api.get<PaymentPublicConfig>('/payments/config');
  return response.data;
};

export const initiatePayment = async (
  data: InitiatePaymentRequest
): Promise<PaymentInitiateResponse> => {
  const response = await api.post<PaymentInitiateResponse>('/payments/initiate', data);
  return response.data;
};

export const getPaymentStatus = async (orderId: number): Promise<PaymentResponse> => {
  const response = await api.get<PaymentResponse>(`/payments/orders/${orderId}`);
  return response.data;
};
