import axios from 'axios';
import type { ApiError } from '../types/CommonTypes';
import type { ParsedOrderCreationError } from '../types/OrderTypes';
import { handleApiError } from './handleApiError';

interface OrderErrorPayload extends ApiError {
  productName?: string;
  itemName?: string;
}

export const parseOrderCreationError = (error: unknown): ParsedOrderCreationError => {
  const message = handleApiError(error);

  if (axios.isAxiosError(error)) {
    const data = error.response?.data as OrderErrorPayload | undefined;
    const errorCode = data?.error?.toUpperCase() ?? '';
    const lowerMessage = message.toLowerCase();

    if (
      errorCode === 'SESSION_EXPIRED' ||
      lowerMessage.includes('sessão expirada') ||
      lowerMessage.includes('session expired')
    ) {
      return { code: 'session_expired', message };
    }

    if (
      errorCode === 'INSUFFICIENT_STOCK' ||
      lowerMessage.includes('estoque insuficiente') ||
      lowerMessage.includes('insufficient stock')
    ) {
      return {
        code: 'insufficient_stock',
        message,
        itemName: data?.productName ?? data?.itemName,
      };
    }
  }

  return { code: 'generic', message };
};
