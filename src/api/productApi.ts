import type { PageResponse, PaginationParams } from '../types/CommonTypes';
import type { ProductResponse } from '../types/ProductTypes';
import { api } from './axiosInstance';

export const getCatalogProducts = async (
  params: PaginationParams = { page: 0, size: 200 }
): Promise<PageResponse<ProductResponse>> => {
  const response = await api.get<PageResponse<ProductResponse>>('/products', {
    params: { ...params, active: true },
  });
  return response.data;
};
