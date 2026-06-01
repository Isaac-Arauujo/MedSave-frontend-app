import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ROUTES } from '../../constants/routes';
import { usePassword } from '../../hooks/usePassword';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('Informe um e-mail válido'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordPage = () => {
  const { forgotPassword, isLoading, successMessage } = usePassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (data) => {
    await forgotPassword(data.email);
  });

  return (
    <PageWrapper
      title="Recuperar senha"
      description="Informe seu e-mail para receber instruções de redefinição de senha."
    >
      <div className="mx-auto w-full max-w-md">
        {successMessage ? (
          <div className="flex flex-col gap-4">
            <p
              className="rounded-2xl bg-[var(--color-primary-light)] px-4 py-3 text-sm text-on-surface"
              role="status"
            >
              {successMessage}
            </p>
            <Link
              to={ROUTES.LOGIN}
              className="text-center text-sm font-medium text-primary hover:underline"
            >
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
            <Input
              label="E-mail"
              type="email"
              autoComplete="email"
              required
              error={errors.email?.message}
              {...register('email')}
            />

            <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
              Enviar instruções
            </Button>

            <Link
              to={ROUTES.LOGIN}
              className="text-center text-sm font-medium text-primary hover:underline"
            >
              Voltar para o login
            </Link>
          </form>
        )}
      </div>
    </PageWrapper>
  );
};
