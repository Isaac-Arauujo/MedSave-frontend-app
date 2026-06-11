import axios from 'axios';
import type { OnePharmacyCartConflictResponse } from '../types/CartTypes';
import { handleApiError } from './handleApiError';

interface CartErrorPayload {
  code?: string;
  message?: string;
  error?: string;
}

const CART_ERROR_MESSAGES: Record<string, string> = {
  PRODUCT_ONLINE_SALE_NOT_ALLOWED:
    'Este medicamento não está disponível para compra online no MediSave.',
  LISTING_NOT_AVAILABLE: 'Este anúncio não está disponível no momento.',
  INSUFFICIENT_STOCK: 'Quantidade indisponível em estoque.',
  INVALID_CART_ITEM: 'Item inválido para adicionar ao carrinho.',
};

export const parseCartError = (
  error: unknown
): { message: string; code?: string; pharmacyConflict?: OnePharmacyCartConflictResponse } => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | CartErrorPayload
      | OnePharmacyCartConflictResponse
      | undefined;
    const status = error.response?.status ?? 0;

    if (data && typeof data === 'object' && 'code' in data && data.code === 'ONE_PHARMACY_CONFLICT') {
      return {
        code: data.code,
        message: data.message ?? 'Seu carrinho já possui itens de outra farmácia.',
        pharmacyConflict: data as OnePharmacyCartConflictResponse,
      };
    }

    const cartCode = data && typeof data === 'object' && 'code' in data ? data.code : undefined;
    if (cartCode && CART_ERROR_MESSAGES[cartCode]) {
      return {
        code: cartCode,
        message: data?.message ?? CART_ERROR_MESSAGES[cartCode],
      };
    }

    if ([400, 409, 422].includes(status)) {
      return { message: handleApiError(error), code: cartCode };
    }
  }

  return { message: handleApiError(error) };
};
