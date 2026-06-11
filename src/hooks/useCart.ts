import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { create } from 'zustand';
import * as cartApi from '../api/cartApi';
import * as checkoutApi from '../api/checkoutApi';
import { ROLES } from '../constants/roles';
import { useAnonymousCartStore } from '../store/anonymousCartStore';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useCheckoutStore } from '../store/checkoutStore';
import type {
  OnePharmacyCartConflictResponse,
  PharmacyConflictState,
} from '../types/CartTypes';
import {
  addAnonymousCartItem,
  clearAnonymousCart,
  getAnonymousCartItemsForMerge,
  removeAnonymousCartItem,
  updateAnonymousCartItemQuantity,
} from '../utils/anonymousCartStorage';
import { handleApiError } from '../utils/handleApiError';
import { parseCartError } from '../utils/parseCartError';

interface PharmacyConflictStore {
  conflict: PharmacyConflictState | null;
  setConflict: (conflict: PharmacyConflictState | null) => void;
}

interface MergeConflictStore {
  conflict: OnePharmacyCartConflictResponse | null;
  setConflict: (conflict: OnePharmacyCartConflictResponse | null) => void;
}

const usePharmacyConflictStore = create<PharmacyConflictStore>((set) => ({
  conflict: null,
  setConflict: (conflict) => set({ conflict }),
}));

export const useMergeConflictStore = create<MergeConflictStore>((set) => ({
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

export interface AddToCartInput {
  listingId: number;
  quantity: number;
  pharmacyId?: number;
  pharmacyName?: string;
}

export const useCart = () => {
  const { isAuthenticated, role } = useAuthStore();
  const isCustomer = isAuthenticated && role === ROLES.CUSTOMER;
  const isGuest = !isAuthenticated;

  const cart = useCartStore((state) => state.cart);
  const backendItemCount = useCartStore((state) => state.itemCount);
  const setCart = useCartStore((state) => state.setCart);
  const clearCartStore = useCartStore((state) => state.clearCart);

  const anonymousItemCount = useAnonymousCartStore((state) => state.itemCount);
  const anonymousDisplay = useAnonymousCartStore((state) => state.display);
  const anonymousDisplayLoading = useAnonymousCartStore((state) => state.displayLoading);
  const anonymousDisplayError = useAnonymousCartStore((state) => state.displayError);
  const refreshAnonymousCart = useAnonymousCartStore((state) => state.refresh);
  const loadAnonymousDisplay = useAnonymousCartStore((state) => state.loadDisplay);
  const clearAnonymousDisplay = useAnonymousCartStore((state) => state.clearDisplay);

  const conflict = usePharmacyConflictStore((state) => state.conflict);
  const setConflict = usePharmacyConflictStore((state) => state.setConflict);
  const mergeConflict = useMergeConflictStore((state) => state.conflict);
  const setMergeConflict = useMergeConflictStore((state) => state.setConflict);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const itemCount = isCustomer ? backendItemCount : anonymousItemCount;

  const fetchCart = useCallback(async () => {
    if (!isCustomer) {
      if (isGuest) {
        await loadAnonymousDisplay();
      } else {
        clearCartStore();
        clearAnonymousDisplay();
      }
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
  }, [isCustomer, isGuest, clearCartStore, setCart, loadAnonymousDisplay, clearAnonymousDisplay]);

  useEffect(() => {
    void fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(
    async ({ listingId, quantity, pharmacyId, pharmacyName }: AddToCartInput) => {
      if (isAuthenticated && !isCustomer) {
        toast.error('Apenas clientes podem adicionar produtos ao carrinho.');
        return;
      }

      if (isGuest) {
        if (!pharmacyId || !pharmacyName) {
          toast.error('Não foi possível adicionar este item ao carrinho.');
          return;
        }

        const pharmacyConflict = addAnonymousCartItem({
          listingId,
          quantity,
          pharmacyId,
          pharmacyName,
        });
        refreshAnonymousCart();

        if (pharmacyConflict) {
          setConflict({
            listingId,
            quantity,
            pharmacyId,
            pharmacyName,
            currentPharmacyName: pharmacyConflict.currentPharmacyName,
            incomingPharmacyName: pharmacyConflict.incomingPharmacyName,
            source: 'anonymous',
          });
          return;
        }

        toast.success('Produto adicionado ao carrinho.');
        await loadAnonymousDisplay();
        return;
      }

      try {
        setIsSubmitting(true);
        setError(null);
        const updatedCart = await cartApi.addItem({ listingId, quantity });
        setCart(updatedCart);
        toast.success('Produto adicionado ao carrinho.');
      } catch (err) {
        const parsed = parseCartError(err);

        if (parsed.pharmacyConflict) {
          setConflict({
            listingId,
            quantity,
            currentPharmacyName:
              parsed.pharmacyConflict.currentPharmacyName ?? cart?.pharmacyName ?? 'outra farmácia',
            incomingPharmacyName: parsed.pharmacyConflict.incomingPharmacyName,
            source: 'add',
          });
          return;
        }

        if (axios.isAxiosError(err) && [400, 422].includes(err.response?.status ?? 0)) {
          const message = parsed.message;
          if (isOnePharmacyError(message)) {
            setConflict({
              listingId,
              quantity,
              currentPharmacyName: cart?.pharmacyName ?? 'outra farmácia',
              source: 'add',
            });
            return;
          }
        }

        setError(parsed.message);
        toast.error(parsed.message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      isAuthenticated,
      isCustomer,
      isGuest,
      setCart,
      cart?.pharmacyName,
      setConflict,
      refreshAnonymousCart,
      loadAnonymousDisplay,
    ]
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

  const updateItem = useCallback(
    async (itemId: number, quantity: number) => {
      if (!isCustomer) {
        return;
      }

      if (quantity < 1) {
        await removeItem(itemId);
        return;
      }

      try {
        setIsSubmitting(true);
        setError(null);
        const updatedCart = await cartApi.updateItem(itemId, { quantity });
        setCart(updatedCart);
      } catch (err) {
        const message = handleApiError(err);
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isCustomer, setCart, removeItem]
  );

  const updateAnonymousItem = useCallback(
    async (listingId: number, quantity: number, maxQuantity?: number) => {
      if (maxQuantity !== undefined && quantity > maxQuantity) {
        toast('Quantidade máxima disponível atingida.');
        return;
      }

      if (quantity < 1) {
        removeAnonymousCartItem(listingId);
        refreshAnonymousCart();
        await loadAnonymousDisplay();
        toast.success('Item removido do carrinho.');
        return;
      }

      updateAnonymousCartItemQuantity(listingId, quantity);
      refreshAnonymousCart();
      await loadAnonymousDisplay();
    },
    [refreshAnonymousCart, loadAnonymousDisplay]
  );

  const removeAnonymousItem = useCallback(
    async (listingId: number) => {
      removeAnonymousCartItem(listingId);
      refreshAnonymousCart();
      await loadAnonymousDisplay();
      toast.success('Item removido do carrinho.');
    },
    [refreshAnonymousCart, loadAnonymousDisplay]
  );

  const clearCart = useCallback(async () => {
    if (isGuest) {
      clearAnonymousCart();
      refreshAnonymousCart();
      clearAnonymousDisplay();
      toast.success('Carrinho esvaziado.');
      return;
    }

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
  }, [isGuest, isCustomer, clearCartStore, refreshAnonymousCart, clearAnonymousDisplay]);

  const dismissPharmacyConflict = useCallback(() => {
    setConflict(null);
  }, [setConflict]);

  const resolvePharmacyConflict = useCallback(async () => {
    if (!conflict) {
      return;
    }

    const { listingId, quantity, source } = conflict;

    try {
      setIsSubmitting(true);
      setError(null);

      if (source === 'anonymous') {
        clearAnonymousCart();
        refreshAnonymousCart();
        if (conflict.pharmacyId && conflict.pharmacyName) {
          addAnonymousCartItem({
            listingId,
            quantity,
            pharmacyId: conflict.pharmacyId,
            pharmacyName: conflict.pharmacyName,
          });
          refreshAnonymousCart();
          await loadAnonymousDisplay();
          toast.success('Carrinho atualizado.');
        }
        setConflict(null);
        return;
      }

      await cartApi.clearCart();
      clearCartStore();
      const updatedCart = await cartApi.addItem({ listingId, quantity });
      setCart(updatedCart);
      setConflict(null);
      toast.success('Carrinho atualizado.');
    } catch (err) {
      const message = handleApiError(err);
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [conflict, clearCartStore, setCart, setConflict, refreshAnonymousCart, loadAnonymousDisplay]);

  const dismissMergeConflict = useCallback(() => {
    setMergeConflict(null);
  }, [setMergeConflict]);

  const keepAccountCartOnMergeConflict = useCallback(() => {
    clearAnonymousCart();
    refreshAnonymousCart();
    setMergeConflict(null);
    toast('Mantivemos o carrinho da sua conta.', { icon: 'ℹ️' });
  }, [refreshAnonymousCart, setMergeConflict]);

  const useAnonymousCartOnMergeConflict = useCallback(async () => {
    if (!mergeConflict) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await cartApi.clearCart();
      clearCartStore();
      const items = getAnonymousCartItemsForMerge();
      const response = await cartApi.mergeCart({ items });
      setCart(response.cart);
      clearAnonymousCart();
      refreshAnonymousCart();
      setMergeConflict(null);
      toast.success('Carrinho atualizado com os itens salvos.');
    } catch (err) {
      const message = handleApiError(err);
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [mergeConflict, clearCartStore, setCart, refreshAnonymousCart, setMergeConflict]);

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
    anonymousDisplay,
    isGuest,
    isCustomer,
    isLoading: isCustomer ? isLoading : anonymousDisplayLoading,
    isSubmitting,
    error: error ?? anonymousDisplayError,
    itemCount,
    pharmacyConflict: conflict,
    mergeConflict,
    fetchCart,
    addItem,
    updateItem,
    updateAnonymousItem,
    removeItem,
    removeAnonymousItem,
    clearCart,
    proceedToCheckout,
    dismissPharmacyConflict,
    resolvePharmacyConflict,
    dismissMergeConflict,
    keepAccountCartOnMergeConflict,
    useAnonymousCartOnMergeConflict,
  };
};
