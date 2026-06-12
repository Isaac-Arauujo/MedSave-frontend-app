import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as adminApi from '../api/adminApi';
import type {
  ProductCatalogRequestResponse,
  ProductCatalogRequestStatus,
  RejectProductCatalogRequestPayload,
  ResolveProductCatalogRequestPayload,
} from '../types/ProductCatalogRequestTypes';
import { handleApiError } from '../utils/handleApiError';

const PAGE_SIZE = 10;

export const useAdminProductCatalogRequests = () => {
  const [requests, setRequests] = useState<ProductCatalogRequestResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState<ProductCatalogRequestStatus | ''>('PENDING');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(0);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminApi.getProductCatalogRequests({
        page: currentPage,
        size: PAGE_SIZE,
        status: statusFilter || undefined,
        search: debouncedSearch || undefined,
      });
      setRequests(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const resolveRequest = useCallback(
    async (id: number, data: ResolveProductCatalogRequestPayload) => {
      try {
        setIsSubmitting(true);
        setError(null);
        await adminApi.resolveProductCatalogRequest(id, data);
        toast.success('Solicitação resolvida com sucesso.');
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

  const rejectRequest = useCallback(
    async (id: number, data: RejectProductCatalogRequestPayload) => {
      try {
        setIsSubmitting(true);
        setError(null);
        await adminApi.rejectProductCatalogRequest(id, data);
        toast.success('Solicitação recusada.');
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
    requests,
    currentPage,
    totalPages,
    statusFilter,
    search,
    isLoading,
    isSubmitting,
    error,
    setCurrentPage,
    setStatusFilter,
    setSearch,
    resolveRequest,
    rejectRequest,
    refetch,
  };
};
