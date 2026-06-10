import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { AdminUserResponse, UpdateAdminUserRequest } from '../../types/AdminUserTypes';
import { ADMIN_USER_ROLE_OPTIONS } from '../../types/AdminUserTypes';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

const editUserSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(120, 'Nome muito longo'),
  email: z.string().trim().email('E-mail inválido'),
  role: z.enum(['CUSTOMER', 'PHARMACY', 'ADMIN'], { message: 'Selecione uma role' }),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface EditUserFormModalProps {
  isOpen: boolean;
  user: AdminUserResponse | null;
  onClose: () => void;
  onSubmit: (userId: number, data: UpdateAdminUserRequest) => Promise<void>;
  isSubmitting?: boolean;
}

export const EditUserFormModal = ({
  isOpen,
  user,
  onClose,
  onSubmit,
  isSubmitting = false,
}: EditUserFormModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'CUSTOMER',
    },
  });

  const selectedRole = watch('role');

  useEffect(() => {
    if (isOpen && user) {
      reset({
        name: user.name,
        email: user.email,
        role: user.role,
      });
    }
  }, [isOpen, reset, user]);

  const handleFormSubmit = async (data: EditUserFormData) => {
    if (!user) {
      return;
    }

    await onSubmit(user.id, {
      name: data.name.trim(),
      email: data.email.trim(),
      role: data.role,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar usuário"
      size="md"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="edit-user-form"
            variant="primary"
            disabled={isSubmitting || !user}
            isLoading={isSubmitting}
          >
            Salvar alterações
          </Button>
        </>
      }
    >
      <form id="edit-user-form" className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
        <Input
          label="Nome completo *"
          {...register('name')}
          error={errors.name?.message}
          autoComplete="name"
        />

        <Input
          label="E-mail *"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          autoComplete="off"
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-on-surface" htmlFor="edit-role">
            Role *
          </label>
          <select
            id="edit-role"
            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-sm text-on-surface"
            {...register('role')}
          >
            {ADMIN_USER_ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.role.message}</p>
          )}
        </div>

        {selectedRole === 'ADMIN' && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-on-surface">
            Este usuário terá acesso administrativo ao sistema.
          </p>
        )}

        <div>
          <span className="mb-1 block text-sm font-medium text-on-surface">Status</span>
          <Badge variant={user?.enabled ? 'success' : 'neutral'}>
            {user?.enabled ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </form>
    </Modal>
  );
};
