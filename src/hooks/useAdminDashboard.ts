import { useCallback, useEffect, useState } from 'react';
import * as adminApi from '../api/adminApi';
import type { AdminDashboardStatsResponse } from '../api/adminApi';
import { handleApiError } from '../utils/handleApiError';

export type AdminDashboardStats = AdminDashboardStatsResponse;

export const useAdminDashboard = () => {
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalCustomers: 0,
    totalPharmacies: 0,
    pendingApprovals: 0,
    ordersToday: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminApi.getDashboardStats();
      setStats(data);
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
