import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { create } from 'zustand';
import * as cartApi from '../api/cartApi';
import * as checkoutApi from '../api/checkoutApi';
import { useCheckoutStore } from '../store/checkoutStore';
import { ROLES } from '../constants/roles';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import type { PharmacyConflictState, CartResponse } from '../types/CartTypes';
import { handleApiError } from '../utils/handleApiError';

interface PharmacyConflictStore {
  conflict: PharmacyConflictState | null;
  setConflict: (conflict: PharmacyConflictState | null) => void;
}

const usePharmacyConflictStore = create<PharmacyConflictStore>((set) => ({
  conflict: null,
  setConflict: (conflict) => set({ conflict }),
}));

const isOnePharmacyError = (message: string): boolean => {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('one pharmacy') ||
    normalized.includes('uma farmácia') ||
    normalized.includes('single pharmacy') ||
    normalized.includes('outra farmácia')
  );
};

export const useCart = () => {
  const { isAuthenticated, role } = useAuthStore();
  const isCustomer = isAuthenticated && role === ROLES.CUSTOMER;

  const cart = useCartStore((state) => state.cart);
  const itemCount = useCartStore((state) => state.itemCount);
  const setCart = useCartStore((state) => state.setCart);
  const clearCartStore = useCartStore((state) => state.clearCart);

  const conflict = usePharmacyConflictStore((state) => state.conflict);
  const setConflict = usePharmacyConflictStore((state) => state.setConflict);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchCart = useCallback(async () => {
    if (!isCustomer) {
      clearCartStore();
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await cartApi.getCart();
      setCart(data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        clearCartStore();
        return;
      }
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [isCustomer, clearCartStore, setCart]);

  useEffect(() => {
    void fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(
    async (listingId: number, quantity: number) => {
      if (!isCustomer) {
        return;
      }

      try {
        setIsSubmitting(true);
        setError(null);
        const updatedCart = await cartApi.addItem({ listingId, quantity });
        setCart(updatedCart);
        toast.success('Produto adicionado ao carrinho.');
      } catch (err) {
        if (axios.isAxiosError(err) && [400, 422].includes(err.response?.status ?? 0)) {
          const message = handleApiError(err);

          if (isOnePharmacyError(message)) {
            setConflict({
              listingId,
              quantity,
              currentPharmacyName: cart?.pharmacyName ?? 'outra farmácia',
            });
            return;
          }
        }

        const message = handleApiError(err);
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isCustomer, setCart, cart?.pharmacyName, setConflict]
  );

  const updateItem = useCallback(
    async (itemId: number, quantity: number) => {
      if (!isCustomer) {
        return;
      }

      try {
        setIsSubmitting(true);
        setError(null);
        const updatedCart = await cartApi.updateItem(itemId, { quantity });
        setCart(updatedCart);
        toast.success('Carrinho atualizado.');
      } catch (err) {
        const message = handleApiError(err);
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isCustomer, setCart]
  );

  const removeItem = useCallback(
    async (itemId: number) => {
      if (!isCustomer) {
        return;
      }

      try {
        setIsSubmitting(true);
        setError(null);
        const updatedCart = await cartApi.removeItem(itemId);
        setCart(updatedCart);
        toast.success('Item removido do carrinho.');
      } catch (err) {
        const message = handleApiError(err);
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isCustomer, setCart]
  );

  const clearCart = useCallback(async () => {
    if (!isCustomer) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await cartApi.clearCart();
      clearCartStore();
      toast.success('Carrinho esvaziado.');
    } catch (err) {
      const message = handleApiError(err);
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [isCustomer, clearCartStore]);

  const dismissPharmacyConflict = useCallback(() => {
    setConflict(null);
  }, [setConflict]);

  const resolvePharmacyConflict = useCallback(async () => {
    if (!conflict) {
      return;
    }

    const { listingId, quantity } = conflict;

    try {
      setIsSubmitting(true);
      setError(null);
      await cartApi.clearCart();
      clearCartStore();
      const updatedCart = await cartApi.addItem({ listingId, quantity });
      setCart(updatedCart);
      setConflict(null);
      toast.success('Carrinho atualizado com o novo item.');
    } catch (err) {
      const message = handleApiError(err);
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [conflict, clearCartStore, setCart, setConflict]);

  const proceedToCheckout = useCallback(async () => {
    if (!isCustomer || !cart || cart.items.length === 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const session = await checkoutApi.createSession();
      useCheckoutStore.getState().setSession(session);
      useCheckoutStore.getState().setStep('delivery');
    } catch (err) {
      const message = handleApiError(err);
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [isCustomer, cart]);

  return {
    cart,
    isLoading,
    isSubmitting,
    error,
    itemCount,
    pharmacyConflict: conflict,
    fetchCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    proceedToCheckout,
    dismissPharmacyConflict,
    resolvePharmacyConflict,
  };
};
