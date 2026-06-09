import type { ExtractedGooglePlaceAddress } from './extractGooglePlaceAddress';
import type { AddressResponse } from '../types/AddressTypes';
import { hasValidPlaceCoordinates } from './extractGooglePlaceAddress';

export const formatShortAddressLine = (
  address: AddressResponse | ExtractedGooglePlaceAddress
): string => {
  const street = address.street?.trim();
  const number = address.number?.trim();
  const city = address.city?.trim();
  const state = address.state?.trim();

  if (street && number && city && state) {
    return `${street}, ${number} - ${city}/${state}`;
  }

  if ('formattedAddress' in address && address.formattedAddress) {
    return address.formattedAddress;
  }

  return [street, number, city, state].filter(Boolean).join(', ');
};

export const hasValidSavedAddressCoordinates = (
  address: AddressResponse
): boolean => hasValidPlaceCoordinates(address.latitude, address.longitude);

export const pickDefaultDeliverableAddress = (
  addresses: AddressResponse[]
): AddressResponse | null => {
  const withCoords = addresses.filter(hasValidSavedAddressCoordinates);
  if (withCoords.length === 0) {
    return null;
  }

  return withCoords.find((address) => address.isDefault) ?? withCoords[0];
};

export const buildGuestFreightRequestFields = (place: ExtractedGooglePlaceAddress) => ({
  destinationLatitude: place.latitude,
  destinationLongitude: place.longitude,
  destinationZipCode: place.zipCode,
  destinationNumber: place.number,
  formattedAddress: place.formattedAddress,
  googlePlaceId: place.placeId,
  destinationStreet: place.street,
  destinationNeighborhood: place.neighborhood,
  destinationCity: place.city,
  destinationState: place.state,
});
