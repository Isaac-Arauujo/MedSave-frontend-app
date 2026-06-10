import { create } from 'zustand';
import toast from 'react-hot-toast';
import * as listingApi from '../api/listingApi';
import type { AnonymousCartDisplay } from '../types/CartTypes';
import {
  getAnonymousItemCount,
  getAnonymousCartItemsForMerge,
  loadAnonymousCart,
  removeAnonymousCartItem,
} from '../utils/anonymousCartStorage';
import { handleApiError } from '../utils/handleApiError';

interface AnonymousCartState {
  itemCount: number;
  display: AnonymousCartDisplay | null;
  displayLoading: boolean;
  displayError: string | null;
  refresh: () => void;
  loadDisplay: () => Promise<void>;
  clearDisplay: () => void;
}

export const useAnonymousCartStore = create<AnonymousCartState>((set, get) => ({
  itemCount: getAnonymousItemCount(),
  display: null,
  displayLoading: false,
  displayError: null,

  refresh: () => {
    loadAnonymousCart();
    set({ itemCount: getAnonymousItemCount() });
  },

  clearDisplay: () => {
    set({ display: null, displayError: null, displayLoading: false });
  },

  loadDisplay: async () => {
    const localItems = getAnonymousCartItemsForMerge();
    if (localItems.length === 0) {
      set({ display: null, displayLoading: false, displayError: null, itemCount: 0 });
      return;
    }

    try {
      set({ displayLoading: true, displayError: null });
      const listingIds = localItems.map((item) => item.listingId);
      const listings = await listingApi.getPublicListingsBatch(listingIds);
      const listingMap = new Map(listings.map((listing) => [listing.id, listing]));

      const invalidIds = localItems
        .filter((item) => !listingMap.has(item.listingId))
        .map((item) => item.listingId);

      if (invalidIds.length > 0) {
        invalidIds.forEach((listingId) => removeAnonymousCartItem(listingId));
        get().refresh();
        if (invalidIds.length === localItems.length) {
          set({ display: null, displayLoading: false });
          toast('Alguns itens não estão mais disponíveis e foram removidos do carrinho.', {
            icon: '⚠️',
          });
          return;
        }
        toast('Alguns itens não estão mais disponíveis e foram removidos do carrinho.', {
          icon: '⚠️',
        });
      }

      const refreshedItems = getAnonymousCartItemsForMerge();
      const items = refreshedItems
        .map((item) => {
          const listing = listingMap.get(item.listingId);
          if (!listing) {
            return null;
          }
          const unitPrice = listing.discountPrice;
          return {
            listingId: item.listingId,
            productName: listing.product.name,
            firstImage: listing.product.images?.[0],
            quantity: item.quantity,
            unitPrice,
            itemSubtotal: unitPrice * item.quantity,
            maxQuantity: Math.max(1, listing.availableStock),
            pharmacyName: listing.pharmacy.name,
            pharmacyCity: listing.pharmacy.city,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      const subtotal = items.reduce((sum, item) => sum + item.itemSubtotal, 0);

      set({
        display: {
          items,
          pharmacyName: items[0]?.pharmacyName,
          pharmacyCity: items[0]?.pharmacyCity,
          subtotal,
          total: subtotal,
          itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        },
        displayLoading: false,
        itemCount: getAnonymousItemCount(),
      });
    } catch (err) {
      set({
        displayLoading: false,
        displayError: handleApiError(err),
      });
    }
  },
}));
