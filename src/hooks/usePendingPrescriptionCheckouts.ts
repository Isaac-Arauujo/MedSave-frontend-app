import { useCallback, useEffect, useState } from 'react';
import { getPendingPrescriptionCheckouts } from '../api/prescriptionApi';
import type { PendingPrescriptionCheckout } from '../types/PrescriptionTypes';
import { handleApiError } from '../utils/handleApiError';

export const usePendingPrescriptionCheckouts = () => {
  const [items, setItems] = useState<PendingPrescriptionCheckout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingCheckouts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getPendingPrescriptionCheckouts();
      setItems(response);
    } catch (err) {
      setError(handleApiError(err));
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPendingCheckouts();
  }, [fetchPendingCheckouts]);

  return {
    items,
    isLoading,
    error,
    refetch: fetchPendingCheckouts,
  };
};
