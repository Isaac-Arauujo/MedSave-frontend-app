import { useState } from 'react';
import { CreateUserFormModal } from '../../components/shared/CreateUserFormModal';
import { DisableUserConfirmModal } from '../../components/shared/DisableUserConfirmModal';
import { EditUserFormModal } from '../../components/shared/EditUserFormModal';
import { EnableUserConfirmModal } from '../../components/shared/EnableUserConfirmModal';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Input } from '../../components/ui/Input';
import { PageLoader } from '../../components/ui/PageLoader';
import { Pagination } from '../../components/ui/Pagination';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { useAuthStore } from '../../store/authStore';
import {
  ADMIN_USER_ROLE_LABELS,
  ADMIN_USER_ROLE_OPTIONS,
  type AdminUserResponse,
  type AdminUserRole,
} from '../../types/AdminUserTypes';
import { formatDateTime } from '../../utils/formatDate';

const ENABLED_FILTER_OPTIONS: { value: 'all' | 'active' | 'inactive'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' },
];

export const AdminUsersPage = () => {
  const currentUserId = useAuthStore((state) => state.userId);
  const {
    users,
    currentPage,
    totalPages,
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
    updateUser,
    disableUser,
    enableUser,
    refetch,
  } = useAdminUsers();

  const [searchInput, setSearchInput] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminUserResponse | null>(null);
  const [disableTarget, setDisableTarget] = useState<AdminUserResponse | null>(null);
  const [enableTarget, setEnableTarget] = useState<AdminUserResponse | null>(null);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    applySearch(searchInput);
  };

  if (error && users.length === 0 && !isLoading) {
    return <ErrorState message={error} onRetry={() => void refetch()} />;
  }

  return (
    <PageWrapper
      title="Usuários"
      description="Gerencie contas de clientes, farmácias e administradores."
      actions={
        <Button type="button" variant="primary" onClick={() => setFormOpen(true)}>
          Novo usuário
        </Button>
      }
    >
      <form
        className="mb-6 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]"
        onSubmit={handleSearchSubmit}
      >
        <Input
          label="Buscar por nome ou e-mail"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Ex.: maria@email.com"
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-on-surface" htmlFor="role-filter">
            Role
          </label>
          <select
            id="role-filter"
            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-sm text-on-surface"
            value={roleFilter}
            onChange={(event) => applyRoleFilter(event.target.value as AdminUserRole | '')}
          >
            <option value="">Todas</option>
            {ADMIN_USER_ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-on-surface" htmlFor="enabled-filter">
            Status
          </label>
          <select
            id="enabled-filter"
            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-sm text-on-surface"
            value={enabledFilter}
            onChange={(event) =>
              applyEnabledFilter(event.target.value as 'all' | 'active' | 'inactive')
            }
          >
            {ENABLED_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <Button type="submit" variant="primary" className="w-full">
            Buscar
          </Button>
        </div>
      </form>

      {isLoading ? (
        <PageLoader message="Carregando usuários..." />
      ) : users.length === 0 ? (
        <EmptyState
          title="Nenhum usuário encontrado"
          description="Ajuste os filtros ou crie um novo usuário."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-outline-variant">
          <table className="min-w-full divide-y divide-outline-variant">
            <thead className="bg-surface-container">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                  Nome
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                  E-mail
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                  Criado em
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 text-sm font-medium text-on-surface">{user.name}</td>
                  <td className="px-4 py-3 text-sm text-on-surface-variant">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-on-surface">
                    {ADMIN_USER_ROLE_LABELS[user.role]}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.enabled ? 'success' : 'neutral'}>
                      {user.enabled ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-on-surface-variant">
                    {formatDateTime(user.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditTarget(user)}
                      >
                        Editar
                      </Button>
                      {user.enabled ? (
                        currentUserId !== user.id && (
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={() => setDisableTarget(user)}
                          >
                            Desativar
                          </Button>
                        )
                      ) : (
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => setEnableTarget(user)}
                        >
                          Reativar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        className="mt-8"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <CreateUserFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        isSubmitting={isSubmitting}
        onSubmit={createUser}
      />

      <EditUserFormModal
        isOpen={Boolean(editTarget)}
        user={editTarget}
        onClose={() => setEditTarget(null)}
        isSubmitting={isSubmitting}
        onSubmit={updateUser}
      />

      <DisableUserConfirmModal
        isOpen={Boolean(disableTarget)}
        user={disableTarget}
        onClose={() => setDisableTarget(null)}
        isSubmitting={isSubmitting}
        onConfirm={disableUser}
      />

      <EnableUserConfirmModal
        isOpen={Boolean(enableTarget)}
        user={enableTarget}
        onClose={() => setEnableTarget(null)}
        isSubmitting={isSubmitting}
        onConfirm={enableUser}
      />
    </PageWrapper>
  );
};
