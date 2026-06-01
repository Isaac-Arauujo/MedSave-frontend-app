import type { PageResponse, PaginationParams } from '../types/CommonTypes';
import type { SavedProductResponse } from '../types/SavedProductTypes';
import { api } from './axiosInstance';

export const getSavedProducts = async (
  params: PaginationParams = {}
): Promise<PageResponse<SavedProductResponse>> => {
  const response = await api.get<PageResponse<SavedProductResponse>>('/saved-products', {
    params,
  });
  return response.data;
};

export const saveProduct = async (listingId: number): Promise<SavedProductResponse> => {
  const response = await api.post<SavedProductResponse>(`/saved-products/${listingId}`);
  return response.data;
};

export const unsaveProduct = async (listingId: number): Promise<void> => {
  await api.delete(`/saved-products/${listingId}`);
};
