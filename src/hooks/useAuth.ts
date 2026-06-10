import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as authApi from '../api/authApi';
import { ROUTES } from '../constants/routes';
import { ROLES } from '../constants/roles';
import { useMergeConflictStore } from '../hooks/useCart';
import { useAuthStore } from '../store/authStore';
import type { LoginRequest, RegisterRequest } from '../types/AuthTypes';
import { getDashboardPath } from '../utils/getDashboardPath';
import { handleApiError } from '../utils/handleApiError';
import { mergeAnonymousCartAfterAuth } from '../utils/mergeAnonymousCart';
import { normalizeRole } from '../utils/normalizeRole';

const isSafeRedirectPath = (path: string | null): path is string =>
  Boolean(path && path.startsWith('/') && !path.startsWith('//'));

const resolvePostAuthNavigation = (
  role: string,
  redirectPath: string | null | undefined,
  mergeStatus: Awaited<ReturnType<typeof mergeAnonymousCartAfterAuth>>
): string => {
  if (mergeStatus.status === 'partial' && isSafeRedirectPath(redirectPath ?? null)) {
    return ROUTES.CART;
  }

  if (isSafeRedirectPath(redirectPath ?? null)) {
    return redirectPath;
  }

  return getDashboardPath(role);
};

export const useAuth = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setMergeConflict = useMergeConflictStore((state) => state.setConflict);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCustomerMerge = useCallback(async () => {
    const mergeResult = await mergeAnonymousCartAfterAuth();
    if (mergeResult.status === 'conflict') {
      setMergeConflict(mergeResult.conflict);
      toast('Seu carrinho já possui itens de outra farmácia.', { icon: '⚠️' });
    }
    return mergeResult;
  }, [setMergeConflict]);

  const login = useCallback(
    async (data: LoginRequest, redirectPath?: string | null) => {
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

        let mergeResult: Awaited<ReturnType<typeof mergeAnonymousCartAfterAuth>> = {
          status: 'empty',
        };
        if (role === ROLES.CUSTOMER) {
          mergeResult = await handleCustomerMerge();
        }

        navigate(resolvePostAuthNavigation(role, redirectPath, mergeResult), { replace: true });
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, setAuth, handleCustomerMerge]
  );

  const register = useCallback(
    async (data: RegisterRequest, redirectPath?: string | null) => {
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

        let mergeResult: Awaited<ReturnType<typeof mergeAnonymousCartAfterAuth>> = {
          status: 'empty',
        };
        if (role === ROLES.CUSTOMER) {
          mergeResult = await handleCustomerMerge();
        }

        navigate(resolvePostAuthNavigation(role, redirectPath, mergeResult), { replace: true });
      } catch (err) {
        const message = handleApiError(err);
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, setAuth, handleCustomerMerge]
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
