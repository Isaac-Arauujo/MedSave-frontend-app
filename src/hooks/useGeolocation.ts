import { useCallback, useState } from 'react';

export interface GeolocationCoords {
  lat: number;
  lng: number;
}

export const useGeolocation = () => {
  const [coords, setCoords] = useState<GeolocationCoords | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSupported =
    typeof navigator !== 'undefined' && typeof navigator.geolocation !== 'undefined';

  const requestLocation = useCallback(async (): Promise<GeolocationCoords | null> => {
    if (!isSupported) {
      setError('Geolocalização não disponível neste navegador.');
      return null;
    }

    setIsLoading(true);
    setError(null);

    return new Promise<GeolocationCoords | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextCoords: GeolocationCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCoords(nextCoords);
          setIsLoading(false);
          resolve(nextCoords);
        },
        (positionError) => {
          const message =
            positionError.code === positionError.PERMISSION_DENIED
              ? 'Permissão de localização negada. Informe latitude e longitude manualmente.'
              : 'Não foi possível obter sua localização. Informe latitude e longitude manualmente.';
          setError(message);
          setIsLoading(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }, [isSupported]);

  return {
    coords,
    isLoading,
    error,
    isSupported,
    requestLocation,
  };
};
