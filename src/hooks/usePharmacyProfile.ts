import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as pharmacyApi from '../api/pharmacyApi';
import type { PharmacyResponse, UpdatePharmacyRequest } from '../types/PharmacyTypes';
import { handleApiError } from '../utils/handleApiError';

export const usePharmacyProfile = () => {
  const [pharmacy, setPharmacy] = useState<PharmacyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPharmacy = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await pharmacyApi.getMyPharmacy();
      setPharmacy(data);
      return data;
    } catch (err) {
      const message = handleApiError(err);
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPharmacy();
  }, [fetchPharmacy]);

  const updatePharmacy = useCallback(
    async (data: UpdatePharmacyRequest) => {
      try {
        setIsSubmitting(true);
        setError(null);
        const updated = await pharmacyApi.updateMyPharmacy(data);
        setPharmacy(updated);
        toast.success('Perfil da farmácia atualizado.');
        return updated;
      } catch (err) {
        const message = handleApiError(err);
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  return {
    pharmacy,
    isLoading,
    isSubmitting,
    error,
    updatePharmacy,
    refetch: fetchPharmacy,
  };
};
