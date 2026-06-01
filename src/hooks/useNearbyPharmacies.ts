import { useCallback, useState } from 'react';
import * as pharmacyApi from '../api/pharmacyApi';
import type { PharmacyNearbyResponse } from '../types/PharmacyTypes';
import { handleApiError } from '../utils/handleApiError';

export const useNearbyPharmacies = () => {
  const [pharmacies, setPharmacies] = useState<PharmacyNearbyResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (lat: number, lng: number, radiusKm?: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const results = await pharmacyApi.getNearbyPharmacies(lat, lng, radiusKm);
      const sorted = [...results].sort((a, b) => a.distanceKm - b.distanceKm);
      setPharmacies(sorted);
      return sorted;
    } catch (err) {
      const message = handleApiError(err);
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    pharmacies,
    isLoading,
    error,
    search,
  };
};
