import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as adminApi from '../api/adminApi';
import type {
  AdminUserListParams,
  AdminUserResponse,
  AdminUserRole,
  CreateAdminUserRequest,
} from '../types/AdminUserTypes';
import { handleApiError } from '../utils/handleApiError';

const PAGE_SIZE = 10;

export const useAdminUsers = () => {
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<AdminUserRole | ''>('');
  const [enabledFilter, setEnabledFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params: AdminUserListParams = {
        page: currentPage,
        size: PAGE_SIZE,
        search: search || undefined,
        role: roleFilter || undefined,
        enabled:
          enabledFilter === 'all'
            ? undefined
            : enabledFilter === 'active',
      };

      const response = await adminApi.getUsers(params);
      setUsers(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, enabledFilter, roleFilter, search]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const applySearch = useCallback((value: string) => {
    setSearch(value.trim());
    setCurrentPage(0);
  }, []);

  const applyRoleFilter = useCallback((value: AdminUserRole | '') => {
    setRoleFilter(value);
    setCurrentPage(0);
  }, []);

  const applyEnabledFilter = useCallback((value: 'all' | 'active' | 'inactive') => {
    setEnabledFilter(value);
    setCurrentPage(0);
  }, []);

  const createUser = useCallback(
    async (data: CreateAdminUserRequest) => {
      try {
        setIsSubmitting(true);
        const response = await adminApi.createUser(data);
        toast.success('Usuário criado com sucesso.');
        if (data.sendWelcomeEmail !== false && !response.welcomeEmailSent) {
          toast.error('Usuário criado, mas não foi possível enviar o e-mail.');
        }
        await refetch();
        return response;
      } catch (err) {
        const message = handleApiError(err);
        toast.error(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [refetch]
  );

  return {
    users,
    currentPage,
    totalPages,
    search,
    roleFilter,
    enabledFilter,
    isLoading,
    isSubmitting,
    error,
    setCurrentPage,
    applySearch,
    applyRoleFilter,
    applyEnabledFilter,
    createUser,
    refetch,
  };
};
