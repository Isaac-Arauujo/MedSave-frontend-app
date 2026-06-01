import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as userApi from '../api/userApi';
import type { UpdateProfileRequest, UserProfileResponse } from '../types/UserTypes';
import { handleApiError } from '../utils/handleApiError';

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userApi.getProfile();
      setProfile(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await userApi.getProfile();
        if (isMounted) {
          setProfile(data);
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

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfileRequest) => {
    try {
      setError(null);
      const updated = await userApi.updateProfile(data);
      setProfile(updated);
      toast.success('Perfil atualizado com sucesso.');
    } catch (err) {
      const message = handleApiError(err);
      setError(message);
      toast.error(message);
      throw err;
    }
  }, []);

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    refetch,
  };
};
