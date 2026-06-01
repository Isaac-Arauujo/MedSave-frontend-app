import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';

const loginSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('Informe um e-mail válido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const { login, isLoading, error } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    await login(data);
  });

  return (
    <PageWrapper
      title="Entrar"
      description="Acesse sua conta para continuar economizando em medicamentos."
    >
      <div className="mx-auto w-full max-w-md">
        <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            required
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Senha"
            type="password"
            autoComplete="current-password"
            required
            error={errors.password?.message}
            {...register('password')}
          />

          {error && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-[var(--color-danger)]" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
            Entrar
          </Button>

          <div className="flex flex-col items-center gap-2 text-sm">
            <Link to={ROUTES.FORGOT_PASSWORD} className="font-medium text-primary hover:underline">
              Esqueceu a senha?
            </Link>
            <p className="text-on-surface-variant">
              Não tem conta?{' '}
              <Link to={ROUTES.REGISTER} className="font-medium text-primary hover:underline">
                Cadastre-se
              </Link>
            </p>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
};
