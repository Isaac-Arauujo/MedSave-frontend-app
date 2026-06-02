import { useCallback, useEffect, useState } from 'react';
import * as listingApi from '../api/listingApi';
import type { ListingResponse } from '../types/ListingTypes';
import type { ProductCategory } from '../types/ProductTypes';
import { handleApiError } from '../utils/handleApiError';

const PAGE_SIZE = 12;

export interface ListingFilters {
  name: string;
  category: ProductCategory | '';
  city: string;
}

export const usePublicListings = () => {
  const [listings, setListings] = useState<ListingResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState<ListingFilters>({
    name: '',
    category: '',
    city: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applyFilters = useCallback((nextFilters: ListingFilters) => {
    setFilters(nextFilters);
    setCurrentPage(0);
  }, []);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await listingApi.getPublicListings({
        page: currentPage,
        size: PAGE_SIZE,
        name: filters.name.trim() || undefined,
        category: filters.category || undefined,
        city: filters.city.trim() || undefined,
      });
      setListings(response.content ?? []);
      setTotalPages(response.totalPages ?? 0);
      setTotalElements(response.totalElements ?? 0);
    } catch (err) {
      setError(handleApiError(err));
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    let isMounted = true;

    const loadListings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await listingApi.getPublicListings({
          page: currentPage,
          size: PAGE_SIZE,
          name: filters.name.trim() || undefined,
          category: filters.category || undefined,
          city: filters.city.trim() || undefined,
        });

        if (isMounted) {
          setListings(response.content ?? []);
          setTotalPages(response.totalPages ?? 0);
          setTotalElements(response.totalElements ?? 0);
        }
      } catch (err) {
        if (isMounted) {
          setError(handleApiError(err));
          setListings([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadListings();

    return () => {
      isMounted = false;
    };
  }, [currentPage, filters]);

  return {
    listings,
    currentPage,
    totalPages,
    totalElements,
    filters,
    isLoading,
    error,
    setCurrentPage,
    applyFilters,
    refetch,
  };
};
