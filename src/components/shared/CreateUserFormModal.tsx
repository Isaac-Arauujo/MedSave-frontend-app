import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { CreateAdminUserRequest } from '../../types/AdminUserTypes';
import { ADMIN_USER_ROLE_OPTIONS } from '../../types/AdminUserTypes';
import { confirmPasswordField, strongPasswordSchema } from '../../utils/passwordValidation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

const createUserSchema = z
  .object({
    name: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(120, 'Nome muito longo'),
    email: z.string().trim().email('E-mail inválido'),
    role: z.enum(['CUSTOMER', 'PHARMACY', 'ADMIN'], { message: 'Selecione uma role' }),
    password: strongPasswordSchema,
    confirmPassword: confirmPasswordField,
    enabled: z.boolean(),
    sendWelcomeEmail: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateUserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAdminUserRequest) => Promise<void>;
  isSubmitting?: boolean;
}

const defaultValues: CreateUserFormData = {
  name: '',
  email: '',
  role: 'CUSTOMER',
  password: '',
  confirmPassword: '',
  enabled: true,
  sendWelcomeEmail: true,
};

export const CreateUserFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: CreateUserFormModalProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues,
  });

  const selectedRole = watch('role');

  useEffect(() => {
    if (isOpen) {
      reset(defaultValues);
      setShowPassword(false);
    }
  }, [isOpen, reset]);

  const handleFormSubmit = async (data: CreateUserFormData) => {
    await onSubmit({
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password,
      role: data.role,
      enabled: data.enabled,
      sendWelcomeEmail: data.sendWelcomeEmail,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Novo usuário"
      size="md"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="create-user-form"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Criando...' : 'Criar usuário'}
          </Button>
        </>
      }
    >
      <form id="create-user-form" className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
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
          <label className="mb-1 block text-sm font-medium text-on-surface" htmlFor="role">
            Role *
          </label>
          <select
            id="role"
            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-sm text-on-surface"
            {...register('role')}
          >
            {ADMIN_USER_ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.role && <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.role.message}</p>}
        </div>

        {selectedRole === 'ADMIN' && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-on-surface">
            Este usuário terá acesso administrativo ao sistema.
          </p>
        )}

        <Input
          label="Senha temporária *"
          type={showPassword ? 'text' : 'password'}
          {...register('password')}
          error={errors.password?.message}
          autoComplete="new-password"
        />

        <Input
          label="Confirmar senha *"
          type={showPassword ? 'text' : 'password'}
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
        />

        <label className="flex items-center gap-2 text-sm text-on-surface">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-outline-variant"
            checked={showPassword}
            onChange={(event) => setShowPassword(event.target.checked)}
          />
          Mostrar senha
        </label>

        <label className="flex items-center gap-2 text-sm text-on-surface">
          <input type="checkbox" className="h-4 w-4 rounded border-outline-variant" {...register('enabled')} />
          Status ativo
        </label>

        <label className="flex items-center gap-2 text-sm text-on-surface">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-outline-variant"
            {...register('sendWelcomeEmail')}
          />
          Enviar e-mail de boas-vindas
        </label>
      </form>
    </Modal>
  );
};
