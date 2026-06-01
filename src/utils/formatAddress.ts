import type { AddressResponse } from '../types/AddressTypes';

type AddressFields = Pick<
  AddressResponse,
  'street' | 'number' | 'complement' | 'neighborhood' | 'city' | 'state' | 'zipCode'
>;

export interface CartPharmacyAddressFields {
  pharmacyName?: string;
  pharmacyStreet?: string;
  pharmacyNumber?: string;
  pharmacyNeighborhood?: string;
  pharmacyCity?: string;
  pharmacyState?: string;
  pharmacyZipCode?: string;
}

export const formatCartPharmacyLine = (cart: CartPharmacyAddressFields): string => {
  const streetLine =
    cart.pharmacyStreet && cart.pharmacyNumber
      ? `${cart.pharmacyStreet}, ${cart.pharmacyNumber}`
      : cart.pharmacyStreet;

  const parts = [
    cart.pharmacyName,
    streetLine,
    cart.pharmacyNeighborhood,
    cart.pharmacyCity && cart.pharmacyState
      ? `${cart.pharmacyCity} - ${cart.pharmacyState}`
      : cart.pharmacyCity ?? cart.pharmacyState,
    cart.pharmacyZipCode,
  ].filter(Boolean);

  return parts.join(' · ') || 'Endereço da farmácia indisponível';
};

export const formatAddressLine = (address: AddressFields): string => {
  const parts = [
    `${address.street}, ${address.number}`,
    address.complement,
    address.neighborhood,
    `${address.city} - ${address.state}`,
    address.zipCode,
  ].filter(Boolean);

  return parts.join(' · ');
};
