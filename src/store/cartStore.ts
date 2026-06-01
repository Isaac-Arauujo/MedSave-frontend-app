import { create } from 'zustand';
import type { CartResponse } from '../types/CartTypes';

interface CartState {
  cart: CartResponse | null;
  itemCount: number;
  setCart: (cart: CartResponse) => void;
  clearCart: () => void;
}

const computeItemCount = (cart: CartResponse | null): number =>
  cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  itemCount: 0,
  setCart: (cart) => set({ cart, itemCount: computeItemCount(cart) }),
  clearCart: () => set({ cart: null, itemCount: 0 }),
}));
