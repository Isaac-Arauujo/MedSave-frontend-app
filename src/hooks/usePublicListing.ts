import { useCallback, useEffect, useState } from 'react';
import * as listingApi from '../api/listingApi';
import type { ListingResponse } from '../types/ListingTypes';
import { handleApiError } from '../utils/handleApiError';

export const usePublicListing = (id: number | null) => {
  const [listing, setListing] = useState<ListingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await listingApi.getPublicListing(id);
      setListing(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      setListing(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadListing = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await listingApi.getPublicListing(id);

        if (isMounted) {
          setListing(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(handleApiError(err));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadListing();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return {
    listing,
    isLoading,
    error,
    refetch,
  };
};
