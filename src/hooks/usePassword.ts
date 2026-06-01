import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as authApi from '../api/authApi';
import { ROUTES } from '../constants/routes';
import type { ChangePasswordRequest } from '../types/AuthTypes';
import { handleApiError } from '../utils/handleApiError';

const FORGOT_PASSWORD_SUCCESS_MESSAGE =
  'Se o e-mail existir, enviaremos instruções de recuperação.';

export const usePassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      const response = await authApi.forgotPassword(email);
      const baseMessage = response.message?.trim() || FORGOT_PASSWORD_SUCCESS_MESSAGE;
      const hint = response.hint?.trim();
      setSuccessMessage(hint ? `${baseMessage} ${hint}` : baseMessage);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(
    async (token: string, newPassword: string) => {
      try {
        setIsLoading(true);
        setError(null);
        await authApi.resetPassword(token, newPassword);
        toast.success('Senha redefinida com sucesso.');
        navigate(ROUTES.LOGIN, { replace: true });
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  const changePassword = useCallback(async (data: ChangePasswordRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      await authApi.changePassword(data);
      toast.success('Senha atualizada com sucesso.');
      return true;
    } catch (err) {
      setError(handleApiError(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    forgotPassword,
    resetPassword,
    changePassword,
    isLoading,
    error,
    successMessage,
  };
};
