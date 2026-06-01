import { useCallback, useEffect, useState } from 'react';
import * as adminApi from '../api/adminApi';
import { handleApiError } from '../utils/handleApiError';

export interface AdminDashboardStats {
  totalCustomers: number;
  totalPharmacies: number;
  pendingApprovals: number;
  /** null = métrica indisponível (API de pedidos admin ainda não existe). */
  totalOrdersToday: number | null;
}

export const useAdminDashboard = () => {
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalCustomers: 0,
    totalPharmacies: 0,
    pendingApprovals: 0,
    totalOrdersToday: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [customers, pharmacies, pending] = await Promise.all([
        adminApi.getCustomers({ page: 0, size: 1 }),
        adminApi.getPharmacies({ page: 0, size: 1 }),
        adminApi.getPharmacies({ page: 0, size: 1, status: 'PENDING' }),
      ]);

      setStats({
        totalCustomers: customers.totalElements,
        totalPharmacies: pharmacies.totalElements,
        pendingApprovals: pending.totalElements,
        totalOrdersToday: null,
      });
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { stats, isLoading, error, refetch };
};
