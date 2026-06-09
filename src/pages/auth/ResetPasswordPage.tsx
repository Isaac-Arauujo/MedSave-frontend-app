import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ROUTES } from '../../constants/routes';
import { usePassword } from '../../hooks/usePassword';
import { confirmPasswordField, strongPasswordSchema } from '../../utils/passwordValidation';

const resetPasswordSchema = z
  .object({
    newPassword: strongPasswordSchema,
    confirmPassword: confirmPasswordField,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword, isLoading, error } = usePassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  if (!token) {
    return <Navigate to={ROUTES.FORGOT_PASSWORD} replace />;
  }

  const onSubmit = handleSubmit(async (data) => {
    const success = await resetPassword(token, data.newPassword);
    if (success) {
      setIsSuccess(true);
    }
  });

  if (isSuccess) {
    return (
      <PageWrapper
        title="Senha alterada"
        description="Sua senha foi alterada com sucesso."
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-4 text-center">
          <p className="text-on-surface">Sua senha foi alterada com sucesso.</p>
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-base font-semibold text-on-primary hover:bg-[var(--color-primary-dark)]"
          >
            Ir para o login
          </Link>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Criar nova senha"
      description="Digite sua nova senha para concluir a redefinição."
    >
      <div className="mx-auto w-full max-w-md">
        <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
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
            Confirmar nova senha
          </Button>

          <Link
            to={ROUTES.LOGIN}
            className="text-center text-sm font-medium text-primary hover:underline"
          >
            Voltar para o login
          </Link>
        </form>
      </div>
    </PageWrapper>
  );
};
