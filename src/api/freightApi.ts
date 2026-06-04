import type { DeliveryType } from '../types/CheckoutTypes';
import type { FreightResult } from '../types/FreightTypes';
import { api } from './axiosInstance';

export interface FreightEstimateRequest {
  listingId: number;
  deliveryType: DeliveryType;
  destinationZipCode?: string;
  destinationNumber?: string;
  destinationComplement?: string;
  addressId?: number;
}

export const estimateFreight = async (
  request: FreightEstimateRequest
): Promise<FreightResult> => {
  const response = await api.post<FreightResult>('/freight/estimate', request);
  return response.data;
};
