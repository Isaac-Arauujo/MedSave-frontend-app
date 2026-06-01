import type {
  AddressResponse,
  CreateAddressRequest,
  UpdateAddressRequest,
} from '../types/AddressTypes';
import { api } from './axiosInstance';

export const getAddresses = async (): Promise<AddressResponse[]> => {
  const response = await api.get<AddressResponse[]>('/me/addresses');
  return response.data;
};

export const createAddress = async (
  data: CreateAddressRequest
): Promise<AddressResponse> => {
  const response = await api.post<AddressResponse>('/me/addresses', data);
  return response.data;
};

export const updateAddress = async (
  id: number,
  data: UpdateAddressRequest
): Promise<AddressResponse> => {
  const response = await api.put<AddressResponse>(`/me/addresses/${id}`, data);
  return response.data;
};

export const deleteAddress = async (id: number): Promise<void> => {
  await api.delete(`/me/addresses/${id}`);
};

export const setDefaultAddress = async (id: number): Promise<AddressResponse> => {
  const response = await api.patch<AddressResponse>(`/me/addresses/${id}/default`);
  return response.data;
};
