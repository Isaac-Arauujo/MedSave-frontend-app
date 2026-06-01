import { isToday, parseISO } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import * as pharmacyApi from '../api/pharmacyApi';
import type { OrderSummaryResponse } from '../types/OrderTypes';
import { handleApiError } from '../utils/handleApiError';

const STATS_PAGE_SIZE = 100;
const RECENT_ORDERS_SIZE = 10;

export interface PharmacyDashboardStats {
  newOrdersToday: number;
  ordersToPrepare: number;
  readyForPickup: number;
}

export const usePharmacyDashboard = () => {
  const [stats, setStats] = useState<PharmacyDashboardStats>({
    newOrdersToday: 0,
    ordersToPrepare: 0,
    readyForPickup: 0,
  });
  const [recentOrders, setRecentOrders] = useState<OrderSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [statsResponse, recentResponse] = await Promise.all([
        pharmacyApi.getPharmacyOrders({ page: 0, size: STATS_PAGE_SIZE }),
        pharmacyApi.getPharmacyOrders({ page: 0, size: RECENT_ORDERS_SIZE }),
      ]);

      const newOrdersToday = statsResponse.content.filter((order) =>
        isToday(parseISO(order.createdAt))
      ).length;
      const ordersToPrepare = statsResponse.content.filter((order) => order.status === 'PAID').length;
      const readyForPickup = statsResponse.content.filter(
        (order) => order.status === 'READY_FOR_PICKUP'
      ).length;

      setStats({ newOrdersToday, ordersToPrepare, readyForPickup });
      setRecentOrders(recentResponse.content);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  return {
    stats,
    recentOrders,
    isLoading,
    error,
    refetch: fetchDashboard,
  };
};
