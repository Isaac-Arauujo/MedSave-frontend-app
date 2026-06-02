import axios from 'axios';
import { getApiBaseUrl } from '../config/apiBaseUrl';
import { useAuthStore } from '../store/authStore';

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const isAuthenticationFailure = (status: number | undefined, requestUrl: string | undefined) => {
  if (status !== 401) {
    return false;
  }

  const url = requestUrl ?? '';

  if (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh')
  ) {
    return false;
  }

  // Sessão de checkout concluída/expirada pode retornar 401 legado; não deslogar o cliente.
  if (url.includes('/checkout/session/')) {
    return false;
  }

  return true;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status as number | undefined;
    const requestUrl = error.config?.url as string | undefined;

    if (isAuthenticationFailure(status, requestUrl)) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
