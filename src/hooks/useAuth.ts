import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as authApi from '../api/authApi';
import { ROUTES } from '../constants/routes';
import { useAuthStore } from '../store/authStore';
import type { LoginRequest, RegisterRequest } from '../types/AuthTypes';
import { getDashboardPath } from '../utils/getDashboardPath';
import { handleApiError } from '../utils/handleApiError';
import { normalizeRole } from '../utils/normalizeRole';

export const useAuth = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (data: LoginRequest) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await authApi.login(data);
        const role = normalizeRole(response.role);

        if (!role) {
          setError('Perfil de acesso inválido. Entre em contato com o suporte.');
          return;
        }

        setAuth(response.token, role, response.userId);
        navigate(getDashboardPath(role), { replace: true });
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, setAuth]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      try {
        setIsLoading(true);
        setError(null);

        const nome = `${data.firstName.trim()} ${data.lastName.trim()}`.trim();
        const response = await authApi.registerCustomer({
          nome,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
          cpf: data.cpf.replace(/\D/g, ''),
        });

        const role = normalizeRole(response.role);
        if (!role) {
          setError('Perfil de acesso inválido. Entre em contato com o suporte.');
          return;
        }

        setAuth(response.token, role, response.userId);
        toast.success('Conta criada com sucesso!');
        navigate(getDashboardPath(role), { replace: true });
      } catch (err) {
        const message = handleApiError(err);
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, setAuth]
  );

  const logout = useCallback(() => {
    clearAuth();
    navigate(ROUTES.LOGIN, { replace: true });
  }, [clearAuth, navigate]);

  return {
    login,
    register,
    logout,
    isLoading,
    error,
  };
};
