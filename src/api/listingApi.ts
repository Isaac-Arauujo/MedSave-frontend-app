import type { PageResponse, PaginationParams } from '../types/CommonTypes';
import type { ListingRecommendationsResponse } from '../types/ListingRecommendationsTypes';
import type {
  CreateListingRequest,
  ListingResponse,
  UpdateListingRequest,
} from '../types/ListingTypes';
import type { ProductCategory } from '../types/ProductTypes';
import { api } from './axiosInstance';

export interface PublicListingParams extends PaginationParams {
  category?: ProductCategory;
  city?: string;
  name?: string;
}

export const getPublicListings = async (
  params: PublicListingParams = {}
): Promise<PageResponse<ListingResponse>> => {
  const response = await api.get<PageResponse<ListingResponse>>('/listings', { params });
  return response.data;
};

export const getPublicListing = async (id: number): Promise<ListingResponse> => {
  const response = await api.get<ListingResponse>(`/listings/${id}`);
  return response.data;
};

export const getListingRecommendations = async (
  id: number
): Promise<ListingRecommendationsResponse> => {
  const response = await api.get<ListingRecommendationsResponse>(
    `/listings/${id}/recommendations`
  );
  return response.data;
};

export const getMyPharmacyListings = async (
  params: PaginationParams = {}
): Promise<PageResponse<ListingResponse>> => {
  const response = await api.get<PageResponse<ListingResponse>>('/pharmacy/listings', {
    params,
  });
  return response.data;
};

export const createListing = async (data: CreateListingRequest): Promise<ListingResponse> => {
  const response = await api.post<ListingResponse>('/pharmacy/listings', data);
  return response.data;
};

export const updateListing = async (
  id: number,
  data: UpdateListingRequest
): Promise<ListingResponse> => {
  const response = await api.put<ListingResponse>(`/pharmacy/listings/${id}`, data);
  return response.data;
};

export const deleteListing = async (id: number): Promise<void> => {
  await api.delete(`/pharmacy/listings/${id}`);
};
