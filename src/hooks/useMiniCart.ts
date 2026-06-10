import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import * as cartApi from '../api/cartApi';
import { ROUTES } from '../constants/routes';
import { ROLES } from '../constants/roles';
import { useAuthStore } from '../store/authStore';
import { useAnonymousCartStore } from '../store/anonymousCartStore';
import type { CartSummaryResponse } from '../types/CartTypes';
import { handleApiError } from '../utils/handleApiError';
import { useCart } from './useCart';

export const useMiniCart = (isOpen: boolean) => {
  const { isAuthenticated, role } = useAuthStore();
  const isCustomer = isAuthenticated && role === ROLES.CUSTOMER;
  const isGuest = !isAuthenticated;
  const {
    itemCount,
    anonymousDisplay,
    isSubmitting,
    updateItem,
    updateAnonymousItem,
    removeItem,
    removeAnonymousItem,
  } = useCart();
  const anonymousItemCount = useAnonymousCartStore((state) => state.itemCount);
  const loadAnonymousDisplay = useAnonymousCartStore((state) => state.loadDisplay);
  const anonymousDisplayLoading = useAnonymousCartStore((state) => state.displayLoading);
  const anonymousDisplayError = useAnonymousCartStore((state) => state.displayError);

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
    if (!isOpen) {
      return;
    }

    if (isCustomer) {
      void fetchSummary();
    } else if (isGuest) {
      void loadAnonymousDisplay();
    }
  }, [isOpen, isCustomer, isGuest, itemCount, fetchSummary, loadAnonymousDisplay]);

  return {
    summary,
    anonymousDisplay: isGuest ? anonymousDisplay : null,
    isGuest,
    isLoading: isCustomer ? isLoading : anonymousDisplayLoading,
    error: isGuest ? anonymousDisplayError : error,
    itemCount: isCustomer ? itemCount : anonymousItemCount,
    isSubmitting,
    refetch: isCustomer ? fetchSummary : loadAnonymousDisplay,
    cartPath: ROUTES.CART,
    updateItem,
    updateAnonymousItem,
    removeItem,
    removeAnonymousItem,
  };
};
