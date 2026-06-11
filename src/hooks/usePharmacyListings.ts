import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as listingApi from '../api/listingApi';
import type {
  CreateListingRequest,
  ListingResponse,
  UpdateListingRequest,
} from '../types/ListingTypes';
import { handleApiError } from '../utils/handleApiError';

const PAGE_SIZE = 10;

export const usePharmacyListings = () => {
  const [listings, setListings] = useState<ListingResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await listingApi.getMyPharmacyListings({
        page: currentPage,
        size: PAGE_SIZE,
      });
      setListings(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    let isMounted = true;

    const loadListings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await listingApi.getMyPharmacyListings({
          page: currentPage,
          size: PAGE_SIZE,
        });

        if (isMounted) {
          setListings(response.content);
          setTotalPages(response.totalPages);
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

    void loadListings();

    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  const createListing = useCallback(
    async (data: CreateListingRequest) => {
      try {
        setIsSubmitting(true);
        setError(null);
        await listingApi.createListing(data);
        toast.success('Anúncio criado com sucesso.');
        await refetch();
      } catch (err) {
        const message = handleApiError(err);
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [refetch]
  );

  const updateListing = useCallback(
    async (id: number, data: UpdateListingRequest) => {
      try {
        setIsSubmitting(true);
        setError(null);
        await listingApi.updateListing(id, data);
        toast.success('Anúncio atualizado com sucesso.');
        await refetch();
      } catch (err) {
        const message = handleApiError(err);
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [refetch]
  );

  const deleteListing = useCallback(
    async (id: number) => {
      try {
        setIsSubmitting(true);
        setError(null);
        await listingApi.deleteListing(id);
        toast.success('Anúncio excluído com sucesso.');
        await refetch();
      } catch (err) {
        const message = handleApiError(err);
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [refetch]
  );

  return {
    listings,
    currentPage,
    totalPages,
    isLoading,
    isSubmitting,
    error,
    setCurrentPage,
    createListing,
    updateListing,
    deleteListing,
    refetch,
  };
};
