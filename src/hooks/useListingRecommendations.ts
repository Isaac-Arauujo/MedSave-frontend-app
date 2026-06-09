import { useCallback, useEffect, useState } from 'react';
import * as listingApi from '../api/listingApi';
import type { ListingRecommendationsResponse } from '../types/ListingRecommendationsTypes';

const emptyRecommendations: ListingRecommendationsResponse = {
  similarProducts: [],
  samePharmacyProducts: [],
};

export const useListingRecommendations = (listingId: number | null) => {
  const [data, setData] = useState<ListingRecommendationsResponse>(emptyRecommendations);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecommendations = useCallback(async () => {
    if (!listingId || Number.isNaN(listingId)) {
      setData(emptyRecommendations);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await listingApi.getListingRecommendations(listingId);
      setData(response);
    } catch {
      setData(emptyRecommendations);
      setError('Não foi possível carregar recomendações.');
    } finally {
      setIsLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    void loadRecommendations();
  }, [loadRecommendations]);

  return {
    similarProducts: data.similarProducts,
    samePharmacyProducts: data.samePharmacyProducts,
    isLoading,
    error,
    refetch: loadRecommendations,
  };
};
