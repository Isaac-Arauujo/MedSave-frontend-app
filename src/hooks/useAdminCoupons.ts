import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as adminApi from '../api/adminApi';
import type {
  CouponResponse,
  CreateCouponRequest,
  UpdateCouponRequest,
} from '../types/CouponTypes';
import { handleApiError } from '../utils/handleApiError';

const PAGE_SIZE = 10;

export const useAdminCoupons = () => {
  const [coupons, setCoupons] = useState<CouponResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminApi.getCoupons({
        page: currentPage,
        size: PAGE_SIZE,
      });
      setCoupons(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    let isMounted = true;

    const loadCoupons = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await adminApi.getCoupons({
          page: currentPage,
          size: PAGE_SIZE,
        });

        if (isMounted) {
          setCoupons(response.content);
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

    void loadCoupons();

    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  const createCoupon = useCallback(
    async (data: CreateCouponRequest) => {
      try {
        setIsSubmitting(true);
        setError(null);
        await adminApi.createCoupon(data);
        toast.success('Cupom criado com sucesso.');
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

  const updateCoupon = useCallback(
    async (id: number, data: UpdateCouponRequest) => {
      try {
        setIsSubmitting(true);
        setError(null);
        await adminApi.updateCoupon(id, data);
        toast.success('Cupom atualizado com sucesso.');
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

  const deleteCoupon = useCallback(
    async (id: number) => {
      try {
        setIsSubmitting(true);
        setError(null);
        await adminApi.deleteCoupon(id);
        toast.success('Cupom excluído com sucesso.');
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
    coupons,
    currentPage,
    totalPages,
    isLoading,
    isSubmitting,
    error,
    setCurrentPage,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    refetch,
  };
};
