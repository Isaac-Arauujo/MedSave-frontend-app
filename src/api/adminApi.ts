import type { PageResponse, PaginationParams } from '../types/CommonTypes';
import type {
  AdminUserListParams,
  AdminUserResponse,
  CreateAdminUserRequest,
  CreateAdminUserResponse,
  UpdateAdminUserRequest,
} from '../types/AdminUserTypes';
import type {
  CouponResponse,
  CreateCouponRequest,
  UpdateCouponRequest,
} from '../types/CouponTypes';
import type { ListingResponse, UpdateListingRequest } from '../types/ListingTypes';
import type {
  AdminOrderCancelRequest,
  AdminOrderCancelResponse,
  AdminOrderDetailResponse,
  AdminOrderInternalNoteResponse,
  AdminOrderListParams,
  AdminOrderNoteRequest,
  AdminOrderStatusRequest,
  AdminOrderSummaryResponse,
} from '../types/AdminOrderTypes';
import type { PharmacyResponse, PharmacyStatus } from '../types/PharmacyTypes';
import type {
  CreateProductRequest,
  ProductCategory,
  ProductImageUploadResponse,
  ProductResponse,
  UpdateProductRequest,
} from '../types/ProductTypes';
import type { UserProfileResponse } from '../types/UserTypes';
import { api } from './axiosInstance';

export interface AdminPharmacyListParams extends PaginationParams {
  status?: PharmacyStatus;
}

export interface AdminCustomerListParams extends PaginationParams {
  search?: string;
}

export interface AdminListingListParams extends PaginationParams {
  pharmacyId?: number;
  active?: boolean;
  category?: ProductCategory;
}

export const getPharmacies = async (
  params: AdminPharmacyListParams = {}
): Promise<PageResponse<PharmacyResponse>> => {
  const response = await api.get<PageResponse<PharmacyResponse>>('/admin/pharmacies', {
    params,
  });
  return response.data;
};

export const getPharmacy = async (id: number): Promise<PharmacyResponse> => {
  const response = await api.get<PharmacyResponse>(`/admin/pharmacies/${id}`);
  return response.data;
};

export const approvePharmacy = async (id: number): Promise<PharmacyResponse> => {
  const response = await api.post<PharmacyResponse>(`/admin/pharmacies/${id}/approve`);
  return response.data;
};

export const suspendPharmacy = async (id: number): Promise<PharmacyResponse> => {
  const response = await api.post<PharmacyResponse>(`/admin/pharmacies/${id}/suspend`);
  return response.data;
};

export const getCustomers = async (
  params: AdminCustomerListParams = {}
): Promise<PageResponse<UserProfileResponse>> => {
  const response = await api.get<PageResponse<UserProfileResponse>>('/admin/customers', {
    params,
  });
  return response.data;
};

export const getUsers = async (
  params: AdminUserListParams = {}
): Promise<PageResponse<AdminUserResponse>> => {
  const response = await api.get<PageResponse<AdminUserResponse>>('/admin/users', {
    params,
  });
  return response.data;
};

export const createUser = async (
  data: CreateAdminUserRequest
): Promise<CreateAdminUserResponse> => {
  const response = await api.post<CreateAdminUserResponse>('/admin/users', data);
  return response.data;
};

export const updateUser = async (
  userId: number,
  data: UpdateAdminUserRequest
): Promise<AdminUserResponse> => {
  const response = await api.put<AdminUserResponse>(`/admin/users/${userId}`, data);
  return response.data;
};

export const disableUser = async (userId: number): Promise<AdminUserResponse> => {
  const response = await api.patch<AdminUserResponse>(`/admin/users/${userId}/disable`);
  return response.data;
};

export const enableUser = async (userId: number): Promise<AdminUserResponse> => {
  const response = await api.patch<AdminUserResponse>(`/admin/users/${userId}/enable`);
  return response.data;
};

export const getCustomer = async (id: number): Promise<UserProfileResponse> => {
  const response = await api.get<UserProfileResponse>(`/admin/customers/${id}`);
  return response.data;
};

export const deactivateCustomer = async (id: number): Promise<void> => {
  await api.delete(`/admin/customers/${id}`);
};

export const getAllListings = async (
  params: AdminListingListParams = {}
): Promise<PageResponse<ListingResponse>> => {
  const response = await api.get<PageResponse<ListingResponse>>('/admin/listings', {
    params,
  });
  return response.data;
};

export const updateListing = async (
  id: number,
  data: UpdateListingRequest
): Promise<ListingResponse> => {
  const response = await api.put<ListingResponse>(`/admin/listings/${id}`, data);
  return response.data;
};

export const deleteListing = async (id: number): Promise<void> => {
  await api.delete(`/admin/listings/${id}`);
};

export const getAdminOrders = async (
  params: AdminOrderListParams = {}
): Promise<PageResponse<AdminOrderSummaryResponse>> => {
  const response = await api.get<PageResponse<AdminOrderSummaryResponse>>('/admin/orders', {
    params,
  });
  return response.data;
};

export const getAdminOrder = async (orderId: number): Promise<AdminOrderDetailResponse> => {
  const response = await api.get<AdminOrderDetailResponse>(`/admin/orders/${orderId}`);
  return response.data;
};

export const cancelAdminOrder = async (
  orderId: number,
  data: AdminOrderCancelRequest
): Promise<AdminOrderCancelResponse> => {
  const response = await api.post<AdminOrderCancelResponse>(`/admin/orders/${orderId}/cancel`, data);
  return response.data;
};

export const updateAdminOrderStatus = async (
  orderId: number,
  data: AdminOrderStatusRequest
): Promise<AdminOrderDetailResponse> => {
  const response = await api.post<AdminOrderDetailResponse>(`/admin/orders/${orderId}/status`, data);
  return response.data;
};

export const addAdminOrderNote = async (
  orderId: number,
  data: AdminOrderNoteRequest
): Promise<AdminOrderInternalNoteResponse> => {
  const response = await api.post<AdminOrderInternalNoteResponse>(`/admin/orders/${orderId}/notes`, data);
  return response.data;
};

export const resendAdminOrderEmail = async (orderId: number): Promise<void> => {
  await api.post(`/admin/orders/${orderId}/resend-email`);
};

export const getProducts = async (
  params: PaginationParams = {}
): Promise<PageResponse<ProductResponse>> => {
  const response = await api.get<PageResponse<ProductResponse>>('/admin/products', { params });
  return response.data;
};

export const createProduct = async (data: CreateProductRequest): Promise<ProductResponse> => {
  const response = await api.post<ProductResponse>('/admin/products', data);
  return response.data;
};

export const updateProduct = async (
  id: number,
  data: UpdateProductRequest
): Promise<ProductResponse> => {
  const response = await api.put<ProductResponse>(`/admin/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`/admin/products/${id}`);
};

export const uploadProductImages = async (files: File[]): Promise<ProductImageUploadResponse> => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const response = await api.post<ProductImageUploadResponse>('/admin/products/images', formData, {
    headers: {
      'Content-Type': undefined,
    },
  });
  return response.data;
};

export const getCoupons = async (
  params: PaginationParams = {}
): Promise<PageResponse<CouponResponse>> => {
  const response = await api.get<PageResponse<CouponResponse>>('/admin/coupons', { params });
  return response.data;
};

export const createCoupon = async (data: CreateCouponRequest): Promise<CouponResponse> => {
  const response = await api.post<CouponResponse>('/admin/coupons', data);
  return response.data;
};

export const updateCoupon = async (
  id: number,
  data: UpdateCouponRequest
): Promise<CouponResponse> => {
  const response = await api.put<CouponResponse>(`/admin/coupons/${id}`, data);
  return response.data;
};

export const deleteCoupon = async (id: number): Promise<void> => {
  await api.delete(`/admin/coupons/${id}`);
};
