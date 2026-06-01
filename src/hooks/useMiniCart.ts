import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import * as cartApi from '../api/cartApi';
import { ROLES } from '../constants/roles';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import type { CartSummaryResponse } from '../types/CartTypes';
import { handleApiError } from '../utils/handleApiError';

export const useMiniCart = (isOpen: boolean) => {
  const { isAuthenticated, role } = useAuthStore();
  const isCustomer = isAuthenticated && role === ROLES.CUSTOMER;
  const itemCount = useCartStore((state) => state.itemCount);

  const [summary, setSummary] = useState<CartSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!isCustomer) {
      setSummary(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await cartApi.getCartSummary();
      setSummary(data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setSummary(null);
        return;
      }
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [isCustomer]);

  useEffect(() => {
    if (!isOpen || !isCustomer) {
      return;
    }

    void fetchSummary();
  }, [isOpen, isCustomer, itemCount, fetchSummary]);

  return {
    summary,
    isLoading,
    error,
    itemCount,
    refetch: fetchSummary,
  };
};
