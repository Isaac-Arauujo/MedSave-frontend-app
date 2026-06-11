import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as adminApi from '../api/adminApi';
import type {
  CreateProductRequest,
  ProductResponse,
  UpdateProductRequest,
} from '../types/ProductTypes';
import { handleApiError } from '../utils/handleApiError';

const PAGE_SIZE = 10;

export const useAdminProducts = () => {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
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
      const response = await adminApi.getProducts({
        page: currentPage,
        size: PAGE_SIZE,
        search: debouncedSearch || undefined,
      });
      setProducts(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await adminApi.getProducts({
          page: currentPage,
          size: PAGE_SIZE,
          search: debouncedSearch || undefined,
        });

        if (isMounted) {
          setProducts(response.content);
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

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, [currentPage, debouncedSearch]);

  const createProduct = useCallback(
    async (data: CreateProductRequest) => {
      try {
        setIsSubmitting(true);
        setError(null);
        await adminApi.createProduct(data);
        toast.success('Produto criado com sucesso.');
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

  const updateProduct = useCallback(
    async (id: number, data: UpdateProductRequest) => {
      try {
        setIsSubmitting(true);
        setError(null);
        await adminApi.updateProduct(id, data);
        toast.success('Produto atualizado com sucesso.');
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

  const deleteProduct = useCallback(
    async (id: number) => {
      try {
        setIsSubmitting(true);
        setError(null);
        await adminApi.deleteProduct(id);
        toast.success('Produto excluído com sucesso.');
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
    products,
    currentPage,
    totalPages,
    search,
    isLoading,
    isSubmitting,
    error,
    setCurrentPage,
    setSearch,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch,
  };
};
