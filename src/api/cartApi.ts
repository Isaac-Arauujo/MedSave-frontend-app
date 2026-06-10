import type {
  AddCartItemRequest,
  CartResponse,
  CartSummaryResponse,
  MergeCartRequest,
  MergeCartResponse,
  UpdateCartItemRequest,
} from '../types/CartTypes';
import type { ApplyCouponRequest } from '../types/CouponTypes';
import { api } from './axiosInstance';

export const getCart = async (): Promise<CartResponse> => {
  const response = await api.get<CartResponse>('/cart');
  return response.data;
};

export const getCartSummary = async (): Promise<CartSummaryResponse> => {
  const response = await api.get<CartSummaryResponse>('/cart/summary');
  return response.data;
};

export const addItem = async (data: AddCartItemRequest): Promise<CartResponse> => {
  const response = await api.post<CartResponse>('/cart/items', data);
  return response.data;
};

export const mergeCart = async (data: MergeCartRequest): Promise<MergeCartResponse> => {
  const response = await api.post<MergeCartResponse>('/cart/merge', data);
  return response.data;
};

export const updateItem = async (
  itemId: number,
  data: UpdateCartItemRequest
): Promise<CartResponse> => {
  const response = await api.put<CartResponse>(`/cart/items/${itemId}`, data);
  return response.data;
};

export const removeItem = async (itemId: number): Promise<CartResponse> => {
  const response = await api.delete<CartResponse>(`/cart/items/${itemId}`);
  return response.data;
};

export const clearCart = async (): Promise<void> => {
  await api.delete('/cart');
};

export const applyCoupon = async (code: string): Promise<CartSummaryResponse> => {
  const body: ApplyCouponRequest = { code };
  const response = await api.post<CartSummaryResponse>('/cart/apply-coupon', body);
  return response.data;
};

export const removeCoupon = async (): Promise<CartSummaryResponse> => {
  const response = await api.delete<CartSummaryResponse>('/cart/coupon');
  return response.data;
};
