import { useCallback, useRef, useState } from 'react';
import axios from 'axios';
import * as paymentApi from '../api/paymentApi';
import type { PaymentMethod } from '../types/CheckoutTypes';
import type { CardPaymentPayload } from '../types/MercadoPagoTypes';
import type { PaymentInitiateResponse, PaymentResponse } from '../types/PaymentTypes';
import { handleApiError } from '../utils/handleApiError';

const PAYMENT_NOT_FOUND_MESSAGE =
  'Pagamento ainda não foi criado ou não foi encontrado.';

export const usePayment = (orderId: number | null) => {
  const [initiation, setInitiation] = useState<PaymentInitiateResponse | null>(null);
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [isInitiating, setIsInitiating] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [pollingStopped, setPollingStopped] = useState(false);
  const initiationSucceededRef = useRef(false);

  const canPoll =
    Boolean(orderId) &&
    initiationSucceededRef.current &&
    Boolean(initiation) &&
    !pollingStopped;

  const initiate = useCallback(
    async (method: PaymentMethod, card?: CardPaymentPayload) => {
      if (!orderId) {
        return null;
      }

      if (method === 'CREDIT_CARD' && !card) {
        const message = 'Preencha os dados do cartão para continuar.';
        setError(message);
        initiationSucceededRef.current = false;
        setPollingStopped(true);
        return null;
      }

      try {
        setIsInitiating(true);
        setError(null);
        setIsExpired(false);
        setPollingStopped(false);
        initiationSucceededRef.current = false;

        const result = await paymentApi.initiatePayment({ orderId, method, card });

        if (
          method === 'PIX' &&
          !result.pixPayload &&
          !result.pixQrCodeBase64
        ) {
          const message =
            'Não foi possível gerar o PIX. Verifique as credenciais do Mercado Pago no servidor.';
          setError(message);
          setInitiation(null);
          setPayment(null);
          return null;
        }

        initiationSucceededRef.current = true;
        setInitiation(result);
        setPayment({
          id: result.paymentId,
          method: result.method,
          status: result.status,
          amount: 0,
          pixPayload: result.pixPayload,
          paymentUrl: result.paymentUrl,
        });
        return result;
      } catch (err) {
        const message = handleApiError(err);
        setError(message);
        setInitiation(null);
        setPayment(null);
        initiationSucceededRef.current = false;
        setPollingStopped(true);
        return null;
      } finally {
        setIsInitiating(false);
      }
    },
    [orderId]
  );

  const refreshStatus = useCallback(async () => {
    if (!orderId || !initiationSucceededRef.current) {
      return null;
    }

    try {
      setIsPolling(true);
      const result = await paymentApi.getPaymentStatus(orderId);
      setPayment(result);
      setError(null);
      return result;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        const message = PAYMENT_NOT_FOUND_MESSAGE;
        setError(message);
        setPollingStopped(true);
        return null;
      }

      const message = handleApiError(err);
      setError(message);
      setPollingStopped(true);
      return null;
    } finally {
      setIsPolling(false);
    }
  }, [orderId]);

  const retry = useCallback(
    async (method: PaymentMethod, card?: CardPaymentPayload) => {
      setPollingStopped(false);
      setInitiation(null);
      setPayment(null);
      initiationSucceededRef.current = false;
      return initiate(method, card);
    },
    [initiate]
  );

  return {
    initiation,
    payment,
    isInitiating,
    isPolling,
    error,
    isExpired,
    pollingStopped,
    canPoll,
    setIsExpired,
    setError,
    initiate,
    refreshStatus,
    retry,
  };
};
