import { useState } from 'react';
import { AddressFormModal } from '../../components/shared/AddressFormModal';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Modal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/PageLoader';
import { useAddresses } from '../../hooks/useAddresses';
import type { AddressResponse, CreateAddressRequest } from '../../types/AddressTypes';
import { formatAddressLine } from '../../utils/formatAddress';

export const CustomerAddressesPage = () => {
  const {
    addresses,
    isLoading,
    error,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefault,
    refetch,
  } = useAddresses();

  const [formOpen, setFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressResponse | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<AddressResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenCreate = () => {
    setEditingAddress(undefined);
    setFormOpen(true);
  };

  const handleOpenEdit = (address: AddressResponse) => {
    setEditingAddress(address);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingAddress(undefined);
  };

  const handleFormSubmit = async (data: CreateAddressRequest, setAsDefault: boolean) => {
    try {
      setIsSubmitting(true);

      if (editingAddress) {
        await updateAddress(editingAddress.id, data);

        if (setAsDefault && !editingAddress.isDefault) {
          await setDefault(editingAddress.id);
        }
      } else {
        await createAddress(data, setAsDefault);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteAddress(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading && addresses.length === 0) {
    return <PageLoader message="Carregando endereços..." />;
  }

  if (error && addresses.length === 0) {
    return <ErrorState message={error} onRetry={() => void refetch()} />;
  }

  return (
    <PageWrapper
      title="Meus endereços"
      description="Gerencie seus endereços de entrega."
      actions={
        <Button variant="primary" onClick={handleOpenCreate}>
          + Adicionar endereço
        </Button>
      }
    >
      {addresses.length === 0 ? (
        <EmptyState
          icon={
            <span className="material-symbols-outlined text-3xl" aria-hidden="true">
              location_on
            </span>
          }
          title="Nenhum endereço cadastrado"
          description="Adicione um endereço para facilitar suas compras."
          action={
            <Button variant="primary" onClick={handleOpenCreate}>
              Adicionar endereço
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <article
              key={address.id}
              className="flex flex-col gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-on-surface">{formatAddressLine(address)}</p>
                {address.isDefault && <Badge variant="success">Padrão</Badge>}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(address)}>
                  Editar
                </Button>
                {!address.isDefault && (
                  <Button variant="ghost" size="sm" onClick={() => void setDefault(address.id)}>
                    Definir como padrão
                  </Button>
                )}
                <Button variant="danger" size="sm" onClick={() => setDeleteTarget(address)}>
                  Excluir
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {error && addresses.length > 0 && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}

      <AddressFormModal
        isOpen={formOpen}
        onClose={handleCloseForm}
        initialAddress={editingAddress}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Excluir endereço"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={() => void handleConfirmDelete()} isLoading={isDeleting}>
              Excluir
            </Button>
          </>
        }
      >
        <p className="text-on-surface-variant">
          Tem certeza que deseja excluir este endereço? Esta ação não pode ser desfeita.
        </p>
      </Modal>
    </PageWrapper>
  );
};
