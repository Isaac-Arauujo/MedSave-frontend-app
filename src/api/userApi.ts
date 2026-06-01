import type { CustomerDashboardResponse } from '../types/DashboardTypes';
import type { UpdateProfileRequest, UserProfileResponse } from '../types/UserTypes';
import { api } from './axiosInstance';

export const getProfile = async (): Promise<UserProfileResponse> => {
  const response = await api.get<UserProfileResponse>('/me');
  return response.data;
};

export const updateProfile = async (
  data: UpdateProfileRequest
): Promise<UserProfileResponse> => {
  const response = await api.put<UserProfileResponse>('/me', data);
  return response.data;
};

export const getDashboard = async (): Promise<CustomerDashboardResponse> => {
  const response = await api.get<CustomerDashboardResponse>('/customer/dashboard-summary');
  return response.data;
};