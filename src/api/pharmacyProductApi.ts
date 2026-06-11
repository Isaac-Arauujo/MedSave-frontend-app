import type { PageResponse, PaginationParams } from '../types/CommonTypes';
import type { PharmacyProductSummary } from '../types/ProductTypes';
import { api } from './axiosInstance';

export interface PharmacyProductSearchParams extends PaginationParams {
  search?: string;
}

export const searchPharmacyProducts = async (
  params: PharmacyProductSearchParams = {}
): Promise<PageResponse<PharmacyProductSummary>> => {
  const response = await api.get<PageResponse<PharmacyProductSummary>>('/pharmacy/products/search', {
    params,
  });
  return response.data;
};

export const getPharmacyProduct = async (id: number): Promise<PharmacyProductSummary> => {
  const response = await api.get<PharmacyProductSummary>(`/pharmacy/products/${id}`);
  return response.data;
};
