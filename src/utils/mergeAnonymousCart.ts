import axios from 'axios';
import toast from 'react-hot-toast';
import * as cartApi from '../api/cartApi';
import { useCartStore } from '../store/cartStore';
import type { OnePharmacyCartConflictResponse } from '../types/CartTypes';
import {
  clearAnonymousCart,
  getAnonymousCartItemsForMerge,
  loadAnonymousCart,
} from './anonymousCartStorage';
import { handleApiError } from './handleApiError';

export type MergeAnonymousCartResult =
  | { status: 'empty' }
  | { status: 'success' }
  | { status: 'partial' }
  | { status: 'conflict'; conflict: OnePharmacyCartConflictResponse }
  | { status: 'error' };

export const mergeAnonymousCartAfterAuth = async (): Promise<MergeAnonymousCartResult> => {
  const items = getAnonymousCartItemsForMerge();
  if (items.length === 0) {
    return { status: 'empty' };
  }

  try {
    const response = await cartApi.mergeCart({ items });
    useCartStore.getState().setCart(response.cart);

    const hasRejected = response.rejectedItems.length > 0;
    const hasMerged = response.mergedItems.length > 0;

    if (hasMerged || !hasRejected) {
      clearAnonymousCart();
    }

    if (hasRejected && hasMerged) {
      toast('Alguns itens não estão mais disponíveis e foram removidos do carrinho.', {
        icon: '⚠️',
      });
      return { status: 'partial' };
    }

    if (hasRejected && !hasMerged) {
      clearAnonymousCart();
      toast('Seu carrinho está vazio ou os itens não estão mais disponíveis.', { icon: '⚠️' });
      return { status: 'partial' };
    }

    toast.success('Entramos na sua conta e mantivemos os itens do seu carrinho.');
    return { status: 'success' };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 409) {
      const conflict = err.response.data as OnePharmacyCartConflictResponse;
      if (conflict?.code === 'ONE_PHARMACY_CONFLICT') {
        return { status: 'conflict', conflict };
      }
    }

    toast.error(handleApiError(err));
    return { status: 'error' };
  }
};

export const getAnonymousCartConflictContext = () => {
  const cart = loadAnonymousCart();
  return {
    items: getAnonymousCartItemsForMerge(),
    pharmacyName: cart.pharmacyName ?? 'outra farmácia',
  };
};
