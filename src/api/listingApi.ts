import type { PageResponse, PaginationParams } from '../types/CommonTypes';
import type { ListingRecommendationsResponse } from '../types/ListingRecommendationsTypes';
import type {
  CreateListingRequest,
  ListingImportResultResponse,
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

export const getPublicListingsBatch = async (ids: number[]): Promise<ListingResponse[]> => {
  if (ids.length === 0) {
    return [];
  }
  const response = await api.get<ListingResponse[]>('/listings/batch', {
    params: { ids: ids.join(',') },
  });
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

export const importListingsCsv = async (file: File): Promise<ListingImportResultResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<ListingImportResultResponse>(
    '/pharmacy/listings/import-csv',
    formData,
    {
      headers: { 'Content-Type': undefined },
    }
  );
  return response.data;
};

export const importListingsXlsx = async (file: File): Promise<ListingImportResultResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<ListingImportResultResponse>(
    '/pharmacy/listings/import-xlsx',
    formData,
    {
      headers: { 'Content-Type': undefined },
    }
  );
  return response.data;
};

export const importListingsFile = async (file: File): Promise<ListingImportResultResponse> => {
  const lowerName = file.name.toLowerCase();
  if (lowerName.endsWith('.csv')) {
    return importListingsCsv(file);
  }
  if (lowerName.endsWith('.xlsx')) {
    return importListingsXlsx(file);
  }
  throw new Error('Envie um arquivo CSV ou XLSX válido.');
};

export const downloadListingImportTemplate = async (): Promise<void> => {
  const response = await api.get<Blob>('/pharmacy/listings/import-template', {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'medisave-listings-template.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const downloadListingImportTemplateXlsx = async (): Promise<void> => {
  const response = await api.get<Blob>('/pharmacy/listings/import-template-xlsx', {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'medisave-modelo-importacao-anuncios.xlsx';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
