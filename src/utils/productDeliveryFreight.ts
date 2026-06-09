import type {
  FreightEstimateOption,
  FreightEstimateOptionsRequest,
} from '../types/ListingFreightTypes';
import type { AddressResponse } from '../types/AddressTypes';
import type { ExtractedGooglePlaceAddress } from './extractGooglePlaceAddress';
import { buildGuestFreightRequestFields } from './addressDisplay';

export type ProductDeliverySource =
  | { type: 'saved'; address: AddressResponse }
  | { type: 'guest'; place: ExtractedGooglePlaceAddress };

export const buildFreightEstimateRequest = (
  listingId: number,
  source: ProductDeliverySource
): FreightEstimateOptionsRequest => {
  if (source.type === 'saved') {
    return {
      listingId,
      addressId: source.address.id,
    };
  }

  return {
    listingId,
    ...buildGuestFreightRequestFields(source.place),
  };
};

export const deliveryTypeLabel: Record<FreightEstimateOption['deliveryType'], string> = {
  PICKUP: 'Retirar na farmácia',
  RAPID: 'Entrega rápida',
  NORMAL: 'Entrega normal',
  SCHEDULED: 'Entrega agendada',
};

export const resolveDeliveryFailureMessage = (
  options: FreightEstimateOption[]
): string | null => {
  const deliveryTypes = options.filter((option) => option.deliveryType !== 'PICKUP');
  if (deliveryTypes.length === 0) {
    return null;
  }

  const allFailed = deliveryTypes.every((option) => !option.available);
  if (!allFailed) {
    return null;
  }

  const coordinateMessage = deliveryTypes.find(
    (option) =>
      (option.reason === 'CEP_ONLY_NO_COORDINATES'
        || option.reason === 'DESTINATION_COORDINATES_INVALID'
        || option.reason === 'DESTINATION_GEOCODING_FAILED'
        || option.reason === 'DESTINATION_GEOCODING_LOW_CONFIDENCE')
      && option.message
  )?.message;

  return coordinateMessage ?? 'Entrega indisponível para este endereço.';
};

export const freightCacheKey = (
  listingId: number,
  source: ProductDeliverySource | null
): string => {
  if (!source) {
    return `${listingId}:none`;
  }

  if (source.type === 'saved') {
    return `${listingId}:address:${source.address.id}`;
  }

  return `${listingId}:guest:${source.place.placeId}:${source.place.latitude}:${source.place.longitude}`;
};
