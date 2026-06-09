import type { DeliveryType } from './CheckoutTypes';

export interface FreightEstimateOption {
  deliveryType: DeliveryType;
  available: boolean;
  price?: number;
  estimateLabel?: string;
  estimateDays?: number;
  approximate?: boolean;
  addressPreview?: string;
  reason?: string;
  message?: string;
}

export interface FreightEstimateOptionsRequest {
  listingId: number;
  destinationZipCode?: string;
  destinationNumber?: string;
  destinationComplement?: string;
  addressId?: number;
  destinationLatitude?: number;
  destinationLongitude?: number;
  formattedAddress?: string;
  googlePlaceId?: string;
  destinationStreet?: string;
  destinationNeighborhood?: string;
  destinationCity?: string;
  destinationState?: string;
}

export interface FreightEstimateOptionsResponse {
  cepValid: boolean;
  addressPreview: string;
  approximate: boolean;
  options: FreightEstimateOption[];
}
