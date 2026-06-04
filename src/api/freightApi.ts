import type { DeliveryType } from '../types/CheckoutTypes';
import type {
  FreightEstimateOptionsRequest,
  FreightEstimateOptionsResponse,
  FreightEstimateOption,
} from '../types/ListingFreightTypes';
import { api } from './axiosInstance';

export interface FreightEstimateRequest {
  listingId: number;
  deliveryType: DeliveryType;
  destinationZipCode?: string;
  destinationNumber?: string;
  destinationComplement?: string;
  addressId?: number;
}

export const estimateFreightOptions = async (
  request: FreightEstimateOptionsRequest
): Promise<FreightEstimateOptionsResponse> => {
  const response = await api.post<FreightEstimateOptionsResponse>(
    '/freight/estimate/options',
    request
  );
  return response.data;
};

export type { FreightEstimateOption };
