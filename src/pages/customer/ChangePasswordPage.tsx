import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { usePassword } from '../../hooks/usePassword';
import { confirmPasswordField, strongPasswordSchema } from '../../utils/passwordValidation';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: strongPasswordSchema,
    confirmPassword: confirmPasswordField,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const ChangePasswordPage = () => {
  const { changePassword, isLoading, error } = usePassword();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    const success = await changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });

    if (success) {
      reset();
    }
  });

  return (
    <PageWrapper
      title="Alterar senha"
      description="Atualize sua senha de acesso."
    >
      <div className="mx-auto w-full max-w-md">
        <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
          <Input
            label="Senha atual"
            type="password"
            autoComplete="current-password"
            required
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />
          <Input
            label="Nova senha"
            type="password"
            autoComplete="new-password"
            required
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <Input
            label="Confirmar nova senha"
            type="password"
            autoComplete="new-password"
            required
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          {error && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-[var(--color-danger)]" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
            Salvar nova senha
          </Button>
        </form>
      </div>
    </PageWrapper>
  );
};
