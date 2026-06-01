import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { create } from 'zustand';
import * as savedProductsApi from '../api/savedProductsApi';
import { ROLES } from '../constants/roles';
import { useAuthStore } from '../store/authStore';
import type { SavedProductResponse } from '../types/SavedProductTypes';
import { handleApiError } from '../utils/handleApiError';

const PAGE_SIZE = 12;
const IDS_PAGE_SIZE = 500;

interface SavedListingIdsState {
  savedListingIds: number[];
  setSavedListingIds: (ids: number[]) => void;
  addListingId: (listingId: number) => void;
  removeListingId: (listingId: number) => void;
  clearListingIds: () => void;
}

const useSavedListingIdsStore = create<SavedListingIdsState>((set) => ({
  savedListingIds: [],
  setSavedListingIds: (ids) => set({ savedListingIds: ids }),
  addListingId: (listingId) =>
    set((state) => ({
      savedListingIds: state.savedListingIds.includes(listingId)
        ? state.savedListingIds
        : [...state.savedListingIds, listingId],
    })),
  removeListingId: (listingId) =>
    set((state) => ({
      savedListingIds: state.savedListingIds.filter((id) => id !== listingId),
    })),
  clearListingIds: () => set({ savedListingIds: [] }),
}));

export const useSavedProducts = () => {
  const { isAuthenticated, role } = useAuthStore();
  const isCustomer = isAuthenticated && role === ROLES.CUSTOMER;

  const savedListingIds = useSavedListingIdsStore((state) => state.savedListingIds);
  const setSavedListingIds = useSavedListingIdsStore((state) => state.setSavedListingIds);
  const addListingId = useSavedListingIdsStore((state) => state.addListingId);
  const removeListingId = useSavedListingIdsStore((state) => state.removeListingId);
  const clearListingIds = useSavedListingIdsStore((state) => state.clearListingIds);

  const [savedProducts, setSavedProducts] = useState<SavedProductResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idsLoaded, setIdsLoaded] = useState(false);

  const loadSavedListingIds = useCallback(async () => {
    if (!isCustomer) {
      clearListingIds();
      setIdsLoaded(false);
      return;
    }

    try {
      const response = await savedProductsApi.getSavedProducts({
        page: 0,
        size: IDS_PAGE_SIZE,
      });
      setSavedListingIds(response.content.map((item) => item.listingId));
      setIdsLoaded(true);
    } catch {
      setIdsLoaded(true);
    }
  }, [isCustomer, clearListingIds, setSavedListingIds]);

  const refetch = useCallback(async () => {
    if (!isCustomer) {
      setSavedProducts([]);
      setTotalPages(0);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await savedProductsApi.getSavedProducts({
        page: currentPage,
        size: PAGE_SIZE,
      });
      setSavedProducts(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, isCustomer]);

  useEffect(() => {
    if (!isCustomer) {
      clearListingIds();
      setSavedProducts([]);
      setIdsLoaded(false);
      return;
    }

    void loadSavedListingIds();
  }, [isCustomer, clearListingIds, loadSavedListingIds]);

  useEffect(() => {
    if (!isCustomer) {
      return;
    }

    let isMounted = true;

    const loadPage = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await savedProductsApi.getSavedProducts({
          page: currentPage,
          size: PAGE_SIZE,
        });

        if (isMounted) {
          setSavedProducts(response.content);
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

    void loadPage();

    return () => {
      isMounted = false;
    };
  }, [currentPage, isCustomer]);

  const isSaved = useCallback(
    (listingId: number) => savedListingIds.includes(listingId),
    [savedListingIds]
  );

  const save = useCallback(
    async (listingId: number) => {
      if (!isCustomer) {
        return;
      }

      if (isSaved(listingId)) {
        return;
      }

      addListingId(listingId);

      try {
        setIsSubmitting(true);
        setError(null);
        const created = await savedProductsApi.saveProduct(listingId);
        setSavedProducts((prev) => {
          if (prev.some((item) => item.listingId === listingId)) {
            return prev;
          }
          return [created, ...prev];
        });
        toast.success('Produto salvo nos favoritos.');
      } catch (err) {
        removeListingId(listingId);
        const message = handleApiError(err);
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isCustomer, isSaved, addListingId, removeListingId]
  );

  const unsave = useCallback(
    async (listingId: number) => {
      if (!isCustomer) {
        return;
      }

      if (!isSaved(listingId)) {
        return;
      }

      removeListingId(listingId);
      const previousProducts = savedProducts;
      setSavedProducts((prev) => prev.filter((item) => item.listingId !== listingId));

      try {
        setIsSubmitting(true);
        setError(null);
        await savedProductsApi.unsaveProduct(listingId);
        toast.success('Produto removido dos favoritos.');
      } catch (err) {
        addListingId(listingId);
        setSavedProducts(previousProducts);
        const message = handleApiError(err);
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isCustomer, isSaved, removeListingId, addListingId, savedProducts]
  );

  const toggleSave = useCallback(
    async (listingId: number) => {
      if (isSaved(listingId)) {
        await unsave(listingId);
      } else {
        await save(listingId);
      }
    },
    [isSaved, save, unsave]
  );

  return {
    savedProducts,
    isLoading,
    isSubmitting,
    error,
    totalPages,
    currentPage,
    idsLoaded,
    setCurrentPage,
    save,
    unsave,
    toggleSave,
    isSaved,
    refetch,
    loadSavedListingIds,
  };
};
