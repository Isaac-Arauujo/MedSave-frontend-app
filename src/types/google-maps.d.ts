declare namespace google.maps.places {
  interface PlaceResult {
    place_id?: string;
    formatted_address?: string;
    address_components?: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    geometry?: {
      location?: {
        lat(): number;
        lng(): number;
      };
    };
  }

  class Autocomplete {
    constructor(
      input: HTMLInputElement,
      opts?: {
        componentRestrictions?: { country: string | string[] };
        fields?: string[];
        types?: string[];
      }
    );
    addListener(event: string, handler: () => void): void;
    getPlace(): PlaceResult;
  }
}

declare namespace google.maps {
  namespace event {
    function clearInstanceListeners(instance: object): void;
  }
}

declare const google: {
  maps: {
    places: typeof google.maps.places;
    event: typeof google.maps.event;
  };
};
