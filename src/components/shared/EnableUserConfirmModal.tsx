import type { AdminUserResponse } from '../../types/AdminUserTypes';
import { ADMIN_USER_ROLE_LABELS } from '../../types/AdminUserTypes';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface EnableUserConfirmModalProps {
  isOpen: boolean;
  user: AdminUserResponse | null;
  onClose: () => void;
  onConfirm: (userId: number) => Promise<void>;
  isSubmitting?: boolean;
}

export const EnableUserConfirmModal = ({
  isOpen,
  user,
  onClose,
  onConfirm,
  isSubmitting = false,
}: EnableUserConfirmModalProps) => {
  const handleConfirm = async () => {
    if (!user) {
      return;
    }

    await onConfirm(user.id);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reativar usuário"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Voltar
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => void handleConfirm()}
            disabled={!user}
            isLoading={isSubmitting}
          >
            Reativar usuário
          </Button>
        </>
      }
    >
      <p className="mb-4 text-on-surface-variant">
        Este usuário voltará a conseguir acessar o sistema.
      </p>

      {user && (
        <dl className="space-y-2 rounded-xl border border-outline-variant bg-surface-container px-4 py-3 text-sm">
          <div>
            <dt className="text-on-surface-variant">Nome</dt>
            <dd className="font-medium text-on-surface">{user.name}</dd>
          </div>
          <div>
            <dt className="text-on-surface-variant">E-mail</dt>
            <dd className="font-medium text-on-surface">{user.email}</dd>
          </div>
          <div>
            <dt className="text-on-surface-variant">Role</dt>
            <dd className="font-medium text-on-surface">{ADMIN_USER_ROLE_LABELS[user.role]}</dd>
          </div>
        </dl>
      )}
    </Modal>
  );
};
