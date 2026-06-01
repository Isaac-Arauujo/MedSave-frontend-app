import axios from 'axios';
import type { ApiError } from '../types/CommonTypes';

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | ApiError
      | { message?: string; error?: string; fieldErrors?: Record<string, string> }
      | undefined;

    if (data && typeof data === 'object') {
      if ('error' in data && data.error) {
        return String(data.error);
      }

      if ('message' in data && data.message) {
        return String(data.message);
      }

      if ('fieldErrors' in data && data.fieldErrors) {
        const firstFieldError = Object.values(data.fieldErrors).find(Boolean);
        if (firstFieldError) {
          return String(firstFieldError);
        }
      }
    }

    if (error.response?.status === 403) {
      return 'Você não tem permissão para realizar esta ação.';
    }

    if (error.response?.status === 404) {
      return 'O recurso solicitado não foi encontrado.';
    }

    if (error.response?.status === 500) {
      return 'Erro no servidor. Tente novamente mais tarde.';
    }

    if (!error.response) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Ocorreu um erro inesperado. Tente novamente.';
};
