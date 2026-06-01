import { useCallback, useEffect, useState } from 'react';
import * as userApi from '../api/userApi';
import type { CustomerDashboardResponse } from '../types/DashboardTypes';
import { handleApiError } from '../utils/handleApiError';

export const useCustomerDashboard = () => {
  const [dashboard, setDashboard] = useState<CustomerDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userApi.getDashboard();
      setDashboard(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await userApi.getDashboard();

        if (isMounted) {
          setDashboard(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(handleApiError(err));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    dashboard,
    isLoading,
    error,
    refetch,
  };
};
