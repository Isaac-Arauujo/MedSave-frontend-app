const PLACE_DETAIL_FIELDS = [
  'place_id',
  'formatted_address',
  'address_components',
  'geometry',
] as const;

let placesServiceHost: HTMLDivElement | null = null;

const getPlacesService = (): google.maps.places.PlacesService => {
  if (!placesServiceHost) {
    placesServiceHost = document.createElement('div');
  }
  return new google.maps.places.PlacesService(placesServiceHost);
};

export const fetchGooglePlaceDetails = (
  placeId: string
): Promise<google.maps.places.PlaceResult> => {
  return new Promise((resolve, reject) => {
    getPlacesService().getDetails(
      {
        placeId,
        fields: [...PLACE_DETAIL_FIELDS],
      },
      (place, status) => {
        if (status === 'OK' && place) {
          resolve(place);
        } else {
          reject(new Error(status));
        }
      }
    );
  });
};

export const resolveGooglePlaceResult = async (
  place: google.maps.places.PlaceResult | null | undefined
): Promise<google.maps.places.PlaceResult | null> => {
  if (!place?.place_id) {
    return null;
  }

  const hasGeometry = Boolean(place.geometry?.location);
  const componentsCount = place.address_components?.length ?? 0;

  if (hasGeometry && componentsCount > 0) {
    return place;
  }

  return fetchGooglePlaceDetails(place.place_id);
};
