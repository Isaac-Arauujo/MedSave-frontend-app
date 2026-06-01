import { useState } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { ErrorState } from '../../components/ui/ErrorState';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/PageLoader';
import { useAdminCustomers } from '../../hooks/useAdminCustomers';
import type { UserProfileResponse } from '../../types/UserTypes';
import { formatCpf } from '../../utils/formatCpf';
import { formatDate } from '../../utils/formatDate';

export const AdminCustomersPage = () => {
  const {
    customers,
    currentPage,
    totalPages,
    search,
    isLoading,
    isSubmitting,
    isDetailLoading,
    error,
    selectedCustomer,
    setCurrentPage,
    applySearch,
    loadCustomer,
    setSelectedCustomer,
    deactivateCustomer,
    refetch,
  } = useAdminCustomers();

  const [searchInput, setSearchInput] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<UserProfileResponse | null>(null);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    applySearch(searchInput);
  };

  const handleViewCustomer = async (customer: UserProfileResponse) => {
    setDetailOpen(true);
    await loadCustomer(customer.id);
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivateTarget) {
      return;
    }

    await deactivateCustomer(deactivateTarget.id);
    setDeactivateTarget(null);
    setDetailOpen(false);
  };

  if (error && customers.length === 0 && !isLoading) {
    return <ErrorState message={error} onRetry={() => void refetch()} />;
  }

  return (
    <PageWrapper title="Clientes" description="Gerencie os clientes cadastrados na plataforma.">
      <form
        className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={handleSearchSubmit}
      >
        <Input
          label="Buscar por nome ou e-mail"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Ex.: maria@email.com"
          className="flex-1"
        />
        <Button type="submit" variant="primary">
          Buscar
        </Button>
      </form>

      {search && (
        <p className="mb-4 text-sm text-on-surface-variant">Resultados para: {search}</p>
      )}

      {isLoading && customers.length === 0 ? (
        <PageLoader message="Carregando clientes..." />
      ) : (
        <DataTable
          columns={[
            {
              key: 'name',
              header: 'Nome',
              render: (customer) => `${customer.firstName} ${customer.lastName}`,
            },
            { key: 'email', header: 'E-mail', render: (customer) => customer.email },
            { key: 'cpf', header: 'CPF', render: (customer) => formatCpf(customer.cpf) },
            {
              key: 'phone',
              header: 'Telefone',
              render: (customer) => customer.phone || customer.mobilePhone || '—',
            },
            {
              key: 'active',
              header: 'Status',
              render: (customer) => (
                <Badge variant={customer.active === false ? 'danger' : 'success'}>
                  {customer.active === false ? 'Inativo' : 'Ativo'}
                </Badge>
              ),
            },
            {
              key: 'createdAt',
              header: 'Cadastro',
              render: (customer) => formatDate(customer.createdAt),
            },
            {
              key: 'actions',
              header: 'Ações',
              render: (customer) => (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => void handleViewCustomer(customer)}
                  >
                    Ver detalhes
                  </Button>
                  {customer.active !== false && (
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => setDeactivateTarget(customer)}
                    >
                      Desativar
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
          data={customers}
          isLoading={isLoading}
          rowKey={(customer) => customer.id}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          emptyTitle="Nenhum cliente encontrado"
          emptyDescription="Ajuste a busca ou aguarde novos cadastros."
        />
      )}

      <Modal
        isOpen={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedCustomer(null);
        }}
        title="Detalhes do cliente"
        footer={
          selectedCustomer && selectedCustomer.active !== false ? (
            <Button variant="danger" onClick={() => setDeactivateTarget(selectedCustomer)}>
              Desativar cliente
            </Button>
          ) : undefined
        }
      >
        {isDetailLoading ? (
          <PageLoader message="Carregando detalhes..." />
        ) : selectedCustomer ? (
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-on-surface-variant">Nome</dt>
              <dd className="font-medium text-on-surface">
                {selectedCustomer.firstName} {selectedCustomer.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-on-surface-variant">E-mail</dt>
              <dd className="font-medium text-on-surface">{selectedCustomer.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-on-surface-variant">CPF</dt>
              <dd className="font-medium text-on-surface">{formatCpf(selectedCustomer.cpf)}</dd>
            </div>
            <div>
              <dt className="text-sm text-on-surface-variant">Telefone</dt>
              <dd className="font-medium text-on-surface">
                {selectedCustomer.phone || selectedCustomer.mobilePhone || 'Não informado'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-on-surface-variant">Status</dt>
              <dd>
                <Badge variant={selectedCustomer.active === false ? 'danger' : 'success'}>
                  {selectedCustomer.active === false ? 'Inativo' : 'Ativo'}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-on-surface-variant">Cadastro</dt>
              <dd className="font-medium text-on-surface">
                {formatDate(selectedCustomer.createdAt)}
              </dd>
            </div>
          </dl>
        ) : null}
      </Modal>

      <Modal
        isOpen={Boolean(deactivateTarget)}
        onClose={() => setDeactivateTarget(null)}
        title="Desativar cliente"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeactivateTarget(null)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={() => void handleConfirmDeactivate()} isLoading={isSubmitting}>
              Confirmar desativação
            </Button>
          </>
        }
      >
        <p className="text-on-surface-variant">
          Deseja desativar o cliente{' '}
          <strong className="text-on-surface">
            {deactivateTarget?.firstName} {deactivateTarget?.lastName}
          </strong>
          ? Esta ação pode ser revertida apenas pelo backend.
        </p>
      </Modal>
    </PageWrapper>
  );
};
