export interface AddressResponse {
  id: number;
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  googlePlaceId?: string;
  formattedAddress?: string;
  geocodingProvider?: string;
  coordinatesSource?: string;
  numberSource?: string;
  isDefault: boolean;
}

export interface CreateAddressRequest {
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  googlePlaceId: string;
  formattedAddress: string;
  geocodingProvider: 'GOOGLE_PLACES';
  coordinatesSource: 'GOOGLE_PLACES';
  numberSource: 'GOOGLE_PLACE' | 'USER';
}

export interface UpdateAddressRequest {
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  googlePlaceId?: string;
  formattedAddress?: string;
  geocodingProvider?: 'GOOGLE_PLACES';
  coordinatesSource?: 'GOOGLE_PLACES';
  numberSource?: 'GOOGLE_PLACE' | 'USER';
  isDefault?: boolean;
}
