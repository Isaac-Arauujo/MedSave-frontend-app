import { useState } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Modal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/PageLoader';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { useAdminPharmacies } from '../../hooks/useAdminPharmacies';
import type { PharmacyResponse, PharmacyStatus } from '../../types/PharmacyTypes';
import { formatAddressLine } from '../../utils/formatAddress';
import { formatCnpj } from '../../utils/formatCnpj';
import { formatDate } from '../../utils/formatDate';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral';

const statusConfig: Record<
  PharmacyStatus,
  { label: string; variant: BadgeVariant }
> = {
  PENDING: { label: 'Pendente', variant: 'warning' },
  APPROVED: { label: 'Aprovada', variant: 'success' },
  SUSPENDED: { label: 'Suspensa', variant: 'danger' },
};

const filterOptions: { value: PharmacyStatus | ''; label: string }[] = [
  { value: '', label: 'Todos os status' },
  { value: 'PENDING', label: 'Pendentes' },
  { value: 'APPROVED', label: 'Aprovadas' },
  { value: 'SUSPENDED', label: 'Suspensas' },
];

interface ConfirmAction {
  type: 'approve' | 'suspend';
  pharmacy: PharmacyResponse;
}

const PharmacyStatusBadge = ({ status }: { status: PharmacyStatus }) => {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const PharmacyDetails = ({ pharmacy }: { pharmacy: PharmacyResponse }) => (
  <dl className="grid gap-3 sm:grid-cols-2">
    <div>
      <dt className="text-sm text-on-surface-variant">Nome</dt>
      <dd className="font-medium text-on-surface">{pharmacy.name}</dd>
    </div>
    <div>
      <dt className="text-sm text-on-surface-variant">CNPJ</dt>
      <dd className="font-medium text-on-surface">{formatCnpj(pharmacy.cnpj)}</dd>
    </div>
    <div>
      <dt className="text-sm text-on-surface-variant">E-mail</dt>
      <dd className="font-medium text-on-surface">{pharmacy.email}</dd>
    </div>
    <div>
      <dt className="text-sm text-on-surface-variant">Telefone</dt>
      <dd className="font-medium text-on-surface">{pharmacy.phone || 'Não informado'}</dd>
    </div>
    <div>
      <dt className="text-sm text-on-surface-variant">Status</dt>
      <dd>
        <PharmacyStatusBadge status={pharmacy.status} />
      </dd>
    </div>
    <div>
      <dt className="text-sm text-on-surface-variant">Usuário ativo</dt>
      <dd className="font-medium text-on-surface">{pharmacy.user.active ? 'Sim' : 'Não'}</dd>
    </div>
    <div>
      <dt className="text-sm text-on-surface-variant">E-mail de acesso</dt>
      <dd className="font-medium text-on-surface">{pharmacy.user.email}</dd>
    </div>
    <div className="sm:col-span-2">
      <dt className="text-sm text-on-surface-variant">Endereço</dt>
      <dd className="font-medium text-on-surface">{formatAddressLine(pharmacy)}</dd>
    </div>
    <div>
      <dt className="text-sm text-on-surface-variant">Cadastro</dt>
      <dd className="font-medium text-on-surface">{formatDate(pharmacy.createdAt)}</dd>
    </div>
    <div>
      <dt className="text-sm text-on-surface-variant">Atualização</dt>
      <dd className="font-medium text-on-surface">{formatDate(pharmacy.updatedAt)}</dd>
    </div>
  </dl>
);

export const AdminPharmaciesPage = () => {
  const {
    pharmacies,
    currentPage,
    totalPages,
    statusFilter,
    isLoading,
    error,
    selectedPharmacy,
    isDetailLoading,
    isActionLoading,
    setCurrentPage,
    setStatusFilter,
    loadPharmacyDetails,
    approvePharmacy,
    suspendPharmacy,
    closeDetails,
    refetch,
  } = useAdminPharmacies();

  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const handleRowClick = (id: number) => {
    setDetailOpen(true);
    void loadPharmacyDetails(id);
  };

  const handleCloseDetails = () => {
    setDetailOpen(false);
    closeDetails();
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) {
      return;
    }

    if (confirmAction.type === 'approve') {
      await approvePharmacy(confirmAction.pharmacy.id);
    } else {
      await suspendPharmacy(confirmAction.pharmacy.id);
    }

    setConfirmAction(null);
    setDetailOpen(false);
  };

  if (isLoading && pharmacies.length === 0) {
    return <PageLoader message="Carregando farmácias..." />;
  }

  if (error && pharmacies.length === 0) {
    return <ErrorState message={error} onRetry={() => void refetch()} />;
  }

  return (
    <PageWrapper
      title="Farmácias"
      description="Gerencie cadastros, aprovações e suspensões de farmácias."
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-on-surface">Filtrar por status</span>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as PharmacyStatus | '')
            }
            className="rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {filterOptions.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {pharmacies.length === 0 ? (
        <EmptyState
          title="Nenhuma farmácia encontrada"
          description="Não há farmácias com o filtro selecionado."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-outline-variant">
            <table className="min-w-full divide-y divide-outline-variant">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                    Farmácia
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                    CNPJ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                    E-mail
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-on-surface-variant">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
                {pharmacies.map((pharmacy) => (
                  <tr
                    key={pharmacy.id}
                    className="cursor-pointer transition-colors hover:bg-surface-container"
                    onClick={() => handleRowClick(pharmacy.id)}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-on-surface">{pharmacy.name}</td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">
                      {formatCnpj(pharmacy.cnpj)}
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">{pharmacy.email}</td>
                    <td className="px-4 py-3">
                      <PharmacyStatusBadge status={pharmacy.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="flex flex-wrap gap-2"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {pharmacy.status === 'PENDING' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              setConfirmAction({ type: 'approve', pharmacy })
                            }
                          >
                            Aprovar
                          </Button>
                        )}
                        {pharmacy.status === 'APPROVED' && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() =>
                              setConfirmAction({ type: 'suspend', pharmacy })
                            }
                          >
                            Suspender
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            className="mt-6"
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {error && pharmacies.length > 0 && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}

      <Modal
        isOpen={detailOpen}
        onClose={handleCloseDetails}
        title="Detalhes da farmácia"
        size="lg"
        footer={
          selectedPharmacy && (
            <div className="flex flex-wrap justify-end gap-2">
              {selectedPharmacy.status === 'PENDING' && (
                <Button
                  variant="primary"
                  onClick={() =>
                    setConfirmAction({ type: 'approve', pharmacy: selectedPharmacy })
                  }
                >
                  Aprovar
                </Button>
              )}
              {selectedPharmacy.status === 'APPROVED' && (
                <Button
                  variant="danger"
                  onClick={() =>
                    setConfirmAction({ type: 'suspend', pharmacy: selectedPharmacy })
                  }
                >
                  Suspender
                </Button>
              )}
              <Button variant="secondary" onClick={handleCloseDetails}>
                Fechar
              </Button>
            </div>
          )
        }
      >
        {isDetailLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : selectedPharmacy ? (
          <PharmacyDetails pharmacy={selectedPharmacy} />
        ) : null}
      </Modal>

      <Modal
        isOpen={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        title={confirmAction?.type === 'approve' ? 'Aprovar farmácia' : 'Suspender farmácia'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmAction(null)} disabled={isActionLoading}>
              Cancelar
            </Button>
            <Button
              variant={confirmAction?.type === 'approve' ? 'primary' : 'danger'}
              onClick={() => void handleConfirmAction()}
              isLoading={isActionLoading}
            >
              Confirmar
            </Button>
          </>
        }
      >
        <p className="text-on-surface-variant">
          {confirmAction?.type === 'approve'
            ? `Confirma a aprovação da farmácia "${confirmAction.pharmacy.name}"?`
            : `Confirma a suspensão da farmácia "${confirmAction?.pharmacy.name}"?`}
        </p>
      </Modal>
    </PageWrapper>
  );
};
