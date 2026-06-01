import { useCallback, useEffect, useState } from 'react';
import * as orderApi from '../api/orderApi';
import type { OrderDetailResponse } from '../types/OrderTypes';
import { handleApiError } from '../utils/handleApiError';

export const useOrderDetail = (orderId: number | null) => {
  const [order, setOrder] = useState<OrderDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await orderApi.getOrderDetail(orderId);
      setOrder(data);
      return data;
    } catch (err) {
      const message = handleApiError(err);
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId) {
      return;
    }

    void fetchOrder();
  }, [orderId, fetchOrder]);

  return {
    order,
    isLoading,
    error,
    refetch: fetchOrder,
  };
};
