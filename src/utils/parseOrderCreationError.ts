import axios from 'axios';
import type { ApiError } from '../types/CommonTypes';
import type { ParsedOrderCreationError, PrescriptionBlockedItem } from '../types/OrderTypes';
import { handleApiError } from './handleApiError';

interface OrderErrorPayload extends ApiError {
  code?: string;
  message?: string;
  items?: PrescriptionBlockedItem[];
  productName?: string;
  itemName?: string;
}

const PRESCRIPTION_MESSAGES: Record<string, string> = {
  PRESCRIPTION_REQUIRED:
    'Este medicamento exige receita médica. Envie a receita para continuar.',
  PRESCRIPTION_PENDING: 'Sua receita ainda está em análise pela farmácia.',
  PRESCRIPTION_REJECTED:
    'Sua receita foi recusada. Verifique o motivo e envie uma nova receita ou remova o item.',
};

export const parseOrderCreationError = (error: unknown): ParsedOrderCreationError => {
  const message = handleApiError(error);

  if (axios.isAxiosError(error)) {
    const data = error.response?.data as OrderErrorPayload | undefined;
    const prescriptionCode = data?.code?.toUpperCase() ?? '';

    if (prescriptionCode === 'PRESCRIPTION_REQUIRED') {
      return {
        code: 'prescription_required',
        message: data?.message ?? PRESCRIPTION_MESSAGES.PRESCRIPTION_REQUIRED,
        prescriptionItems: data?.items,
      };
    }

    if (prescriptionCode === 'PRESCRIPTION_PENDING') {
      return {
        code: 'prescription_pending',
        message: data?.message ?? PRESCRIPTION_MESSAGES.PRESCRIPTION_PENDING,
        prescriptionItems: data?.items,
      };
    }

    if (prescriptionCode === 'PRESCRIPTION_REJECTED') {
      return {
        code: 'prescription_rejected',
        message: data?.message ?? PRESCRIPTION_MESSAGES.PRESCRIPTION_REJECTED,
        prescriptionItems: data?.items,
      };
    }

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
