import { useCallback, useState } from 'react';
import * as pharmacyApi from '../api/pharmacyApi';
import type { PharmacyRegisterRequest } from '../types/PharmacyTypes';
import { handleApiError } from '../utils/handleApiError';

export const usePharmacyRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const registerPharmacy = useCallback(async (data: PharmacyRegisterRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);
      await pharmacyApi.registerPharmacy(data);
      setIsSuccess(true);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    registerPharmacy,
    isLoading,
    error,
    isSuccess,
  };
};
