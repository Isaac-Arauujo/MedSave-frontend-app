export interface ExtractedGooglePlaceAddress {
  placeId: string;
  formattedAddress: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude: number;
  longitude: number;
  numberFromGoogle: boolean;
}

const BRAZIL_COUNTRY_VALUES = new Set(['br', 'brazil', 'brasil']);

const findComponent = (
  components: google.maps.places.PlaceResult['address_components'],
  ...types: string[]
): { longName: string; shortName: string } | null => {
  if (!components) {
    return null;
  }
  for (const type of types) {
    const match = components.find((component) => component.types.includes(type));
    if (match) {
      return { longName: match.long_name, shortName: match.short_name };
    }
  }
  return null;
};

const normalizeZipCode = (value: string | undefined): string => {
  if (!value) {
    return '';
  }
  return value.replace(/\D/g, '').slice(0, 8);
};

const normalizeState = (value: string | undefined): string => {
  if (!value) {
    return '';
  }
  const trimmed = value.trim();
  return trimmed.length === 2 ? trimmed.toUpperCase() : trimmed.slice(0, 2).toUpperCase();
};

const trimField = (value: string | undefined): string => (value ?? '').trim();

export const isBrazilCountry = (country: string | undefined): boolean => {
  if (!country) {
    return false;
  }
  return BRAZIL_COUNTRY_VALUES.has(country.trim().toLowerCase());
};

export const hasValidPlaceCoordinates = (
  latitude: number | undefined,
  longitude: number | undefined
): boolean => {
  if (latitude == null || longitude == null) {
    return false;
  }
  if (latitude === 0 && longitude === 0) {
    return false;
  }
  return latitude >= -33.75 && latitude <= 5.27 && longitude >= -73.99 && longitude <= -28.84;
};

export const extractGooglePlaceAddress = (
  place: google.maps.places.PlaceResult
): ExtractedGooglePlaceAddress | null => {
  const placeId = trimField(place.place_id);
  const formattedAddress = trimField(place.formatted_address);
  const latitude = place.geometry?.location?.lat();
  const longitude = place.geometry?.location?.lng();

  if (!placeId || !formattedAddress || !hasValidPlaceCoordinates(latitude, longitude)) {
    return null;
  }

  const components = place.address_components;
  const streetNumber = findComponent(components, 'street_number');
  const route = findComponent(components, 'route');
  const neighborhood =
    findComponent(components, 'sublocality_level_1', 'sublocality', 'neighborhood')
    ?? findComponent(components, 'administrative_area_level_3');
  const city =
    findComponent(components, 'locality', 'administrative_area_level_2');
  const state = findComponent(components, 'administrative_area_level_1');
  const postalCode = findComponent(components, 'postal_code');
  const country = findComponent(components, 'country');

  const countryValue = country?.shortName ?? country?.longName ?? '';
  if (!isBrazilCountry(countryValue)) {
    return null;
  }

  const street = trimField(route?.longName);
  const number = trimField(streetNumber?.shortName ?? streetNumber?.longName);

  if (!street || !city?.longName || !state?.shortName) {
    return null;
  }

  return {
    placeId,
    formattedAddress,
    street,
    number,
    neighborhood: trimField(neighborhood?.longName),
    city: trimField(city.longName),
    state: normalizeState(state.shortName),
    zipCode: normalizeZipCode(postalCode?.longName),
    country: countryValue.toUpperCase() === 'BR' ? 'BR' : countryValue,
    latitude: latitude as number,
    longitude: longitude as number,
    numberFromGoogle: number.length > 0,
  };
};

export const isCepOnlySearchInput = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length !== 8) {
    return false;
  }
  return /^[\d.\-\s]+$/.test(trimmed);
};

export const looksLikeStreetWithoutNumber = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed || isCepOnlySearchInput(trimmed)) {
    return false;
  }
  const hasLetter = /[A-Za-zÀ-ÿ]/.test(trimmed);
  const hasNumber = /\d/.test(trimmed);
  return hasLetter && !hasNumber;
};

export const isValidAddressPayload = (
  place: ExtractedGooglePlaceAddress | null,
  number: string,
  zipCode: string
): { valid: boolean; zipWarning: boolean; missingGoogleNumber: boolean } => {
  if (!place) {
    return { valid: false, zipWarning: false, missingGoogleNumber: false };
  }

  const normalizedNumber = number.trim();
  const normalizedZip = normalizeZipCode(zipCode);
  const zipWarning = normalizedZip.length > 0 && normalizedZip.length !== 8;
  const missingGoogleNumber = !place.numberFromGoogle || place.number.trim().length === 0;

  const valid =
    place.placeId.length > 0
    && place.formattedAddress.length > 0
    && hasValidPlaceCoordinates(place.latitude, place.longitude)
    && isBrazilCountry(place.country)
    && place.street.length > 0
    && !missingGoogleNumber
    && normalizedNumber.length > 0
    && place.city.length > 0
    && place.state.length === 2
    && normalizedZip.length === 8;

  return { valid, zipWarning, missingGoogleNumber };
};
