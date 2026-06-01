import type { DeliveryResponse } from '../types/OrderTypes';
import { api } from './axiosInstance';

export const getDeliveryById = async (id: number): Promise<DeliveryResponse> => {
  const response = await api.get<DeliveryResponse>(`/deliveries/${id}`);
  return response.data;
};
