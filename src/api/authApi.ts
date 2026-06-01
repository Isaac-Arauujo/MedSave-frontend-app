import type {
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  MessageResponse,
  RegisterCustomerRequest,
} from '../types/AuthTypes';
import { api } from './axiosInstance';

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export const registerCustomer = async (
  data: RegisterCustomerRequest
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', data);
  return response.data;
};

export const forgotPassword = async (email: string): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>('/auth/reset-password', {
    token,
    newPassword,
  });
  return response.data;
};

export const changePassword = async (data: ChangePasswordRequest): Promise<MessageResponse> => {
  const response = await api.put<MessageResponse>('/me/password', data);
  return response.data;
};