import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';
import { confirmPasswordField, strongPasswordSchema } from '../../utils/passwordValidation';

const registerSchema = z
  .object({
    firstName: z.string().min(1, 'Nome é obrigatório'),
    lastName: z.string().min(1, 'Sobrenome é obrigatório'),
    email: z.string().min(1, 'E-mail é obrigatório').email('Informe um e-mail válido'),
    cpf: z
      .string()
      .min(1, 'CPF é obrigatório')
      .transform((value) => value.replace(/\D/g, ''))
      .pipe(z.string().length(11, 'CPF deve conter 11 dígitos numéricos')),
    phone: z.string().optional(),
    password: strongPasswordSchema,
    confirmPassword: confirmPasswordField,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect');
  const { register: registerUser, isLoading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      cpf: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    await registerUser(data, redirectPath);
  });

  return (
    <PageWrapper
      title="Criar conta"
      description="Cadastre-se como cliente e comece a comparar preços de medicamentos."
    >
      <div className="mx-auto w-full max-w-lg">
        <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nome"
              autoComplete="given-name"
              required
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <Input
              label="Sobrenome"
              autoComplete="family-name"
              required
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            required
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="CPF"
            inputMode="numeric"
            autoComplete="off"
            required
            placeholder="00000000000"
            error={errors.cpf?.message}
            {...register('cpf')}
          />

          <Input
            label="Telefone"
            type="tel"
            autoComplete="tel"
            placeholder="Opcional"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label="Senha"
            type="password"
            autoComplete="new-password"
            required
            error={errors.password?.message}
            {...register('password')}
          />

          <Input
            label="Confirmar senha"
            type="password"
            autoComplete="new-password"
            required
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
            Cadastrar
          </Button>

          <p className="text-center text-sm text-on-surface-variant">
            Já tem uma conta?{' '}
            <Link to={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </PageWrapper>
  );
};
