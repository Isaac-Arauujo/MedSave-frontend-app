import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as adminApi from '../api/adminApi';
import type { UserProfileResponse } from '../types/UserTypes';
import { handleApiError } from '../utils/handleApiError';

const PAGE_SIZE = 10;

export const useAdminCustomers = () => {
  const [customers, setCustomers] = useState<UserProfileResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<UserProfileResponse | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminApi.getCustomers({
        page: currentPage,
        size: PAGE_SIZE,
        search: appliedSearch.trim() || undefined,
      });
      setCustomers(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, appliedSearch]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const applySearch = useCallback((value: string) => {
    setSearch(value);
    setAppliedSearch(value);
    setCurrentPage(0);
  }, []);

  const loadCustomer = useCallback(async (id: number) => {
    try {
      setIsDetailLoading(true);
      const customer = await adminApi.getCustomer(id);
      setSelectedCustomer(customer);
      return customer;
    } catch (err) {
      const message = handleApiError(err);
      toast.error(message);
      throw err;
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  const deactivateCustomer = useCallback(
    async (id: number) => {
      try {
        setIsSubmitting(true);
        await adminApi.deactivateCustomer(id);
        toast.success('Cliente desativado com sucesso.');
        setSelectedCustomer(null);
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
    customers,
    currentPage,
    totalPages,
    search,
    isLoading,
    isSubmitting,
    isDetailLoading,
    error,
    selectedCustomer,
    setCurrentPage,
    applySearch,
    loadCustomer,
    setSelectedCustomer,
    deactivateCustomer,
    refetch,
  };
};
