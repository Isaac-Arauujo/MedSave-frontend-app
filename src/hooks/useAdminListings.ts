import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as adminApi from '../api/adminApi';
import type { ListingResponse, UpdateListingRequest } from '../types/ListingTypes';
import type { ProductCategory } from '../types/ProductTypes';
import { handleApiError } from '../utils/handleApiError';

const PAGE_SIZE = 10;

export const useAdminListings = () => {
  const [listings, setListings] = useState<ListingResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pharmacyIdFilter, setPharmacyIdFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'true' | 'false'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | ''>('');
  const [appliedPharmacyIdFilter, setAppliedPharmacyIdFilter] = useState('');
  const [appliedActiveFilter, setAppliedActiveFilter] = useState<'all' | 'true' | 'false'>('all');
  const [appliedCategoryFilter, setAppliedCategoryFilter] = useState<ProductCategory | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const parsedPharmacyId = appliedPharmacyIdFilter.trim()
        ? Number(appliedPharmacyIdFilter)
        : undefined;

      const response = await adminApi.getAllListings({
        page: currentPage,
        size: PAGE_SIZE,
        pharmacyId:
          parsedPharmacyId && Number.isFinite(parsedPharmacyId) ? parsedPharmacyId : undefined,
        active: appliedActiveFilter === 'all' ? undefined : appliedActiveFilter === 'true',
        category: appliedCategoryFilter || undefined,
      });

      setListings(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, appliedPharmacyIdFilter, appliedActiveFilter, appliedCategoryFilter]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const applyFilters = useCallback(() => {
    setAppliedPharmacyIdFilter(pharmacyIdFilter);
    setAppliedActiveFilter(activeFilter);
    setAppliedCategoryFilter(categoryFilter);
    setCurrentPage(0);
  }, [pharmacyIdFilter, activeFilter, categoryFilter]);

  const updateListing = useCallback(
    async (id: number, data: UpdateListingRequest) => {
      try {
        setIsSubmitting(true);
        await adminApi.updateListing(id, data);
        toast.success('Anúncio atualizado com sucesso.');
        await refetch();
      } catch (err) {
        const message = handleApiError(err);
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
        await adminApi.deleteListing(id);
        toast.success('Anúncio removido com sucesso.');
        await refetch();
      } catch (err) {
        const message = handleApiError(err);
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
    pharmacyIdFilter,
    activeFilter,
    categoryFilter,
    isLoading,
    isSubmitting,
    error,
    setCurrentPage,
    setPharmacyIdFilter,
    setActiveFilter,
    setCategoryFilter,
    applyFilters,
    updateListing,
    deleteListing,
    refetch,
  };
};
