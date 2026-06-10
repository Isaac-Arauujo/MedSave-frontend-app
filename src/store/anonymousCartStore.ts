import { create } from 'zustand';
import { getAnonymousItemCount, loadAnonymousCart } from '../utils/anonymousCartStorage';

interface AnonymousCartState {
  itemCount: number;
  refresh: () => void;
}

export const useAnonymousCartStore = create<AnonymousCartState>((set) => ({
  itemCount: getAnonymousItemCount(),
  refresh: () => {
    loadAnonymousCart();
    set({ itemCount: getAnonymousItemCount() });
  },
}));
