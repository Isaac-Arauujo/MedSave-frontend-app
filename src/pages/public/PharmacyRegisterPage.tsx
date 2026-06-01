import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { ROUTES } from '../../constants/routes';
import { usePharmacyRegister } from '../../hooks/usePharmacyRegister';
import { fetchViaCep } from '../../utils/fetchViaCep';
import { confirmPasswordField, strongPasswordSchema } from '../../utils/passwordValidation';

const pharmacyRegisterSchema = z
  .object({
    name: z.string().min(1, 'Nome da farmácia é obrigatório'),
    cnpj: z
      .string()
      .min(1, 'CNPJ é obrigatório')
      .transform((value) => value.replace(/\D/g, ''))
      .pipe(z.string().length(14, 'CNPJ deve conter 14 dígitos numéricos')),
    phone: z.string().optional(),
    email: z.string().min(1, 'E-mail é obrigatório').email('Informe um e-mail válido'),
    password: strongPasswordSchema,
    confirmPassword: confirmPasswordField,
    zipCode: z
      .string()
      .min(1, 'CEP é obrigatório')
      .transform((value) => value.replace(/\D/g, ''))
      .pipe(z.string().length(8, 'CEP deve conter 8 dígitos')),
    street: z.string().min(1, 'Rua é obrigatória'),
    number: z.string().min(1, 'Número é obrigatório'),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, 'Bairro é obrigatório'),
    city: z.string().min(1, 'Cidade é obrigatória'),
    state: z
      .string()
      .min(2, 'UF é obrigatória')
      .max(2, 'UF deve ter 2 letras')
      .transform((value) => value.toUpperCase()),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type PharmacyRegisterFormData = z.infer<typeof pharmacyRegisterSchema>;

export const PharmacyRegisterPage = () => {
  const { registerPharmacy, isLoading, error, isSuccess } = usePharmacyRegister();
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PharmacyRegisterFormData>({
    resolver: zodResolver(pharmacyRegisterSchema),
    defaultValues: {
      name: '',
      cnpj: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      zipCode: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
    },
  });

  const zipCodeRegister = register('zipCode');

  const handleZipBlur = async () => {
    const zipCode = watch('zipCode');

    if (zipCode.replace(/\D/g, '').length !== 8) {
      return;
    }

    try {
      setCepLoading(true);
      setCepError(null);
      const data = await fetchViaCep(zipCode);

      if (!data) {
        setCepError('CEP não encontrado.');
        return;
      }

      setValue('street', data.logradouro || watch('street'));
      setValue('neighborhood', data.bairro || watch('neighborhood'));
      setValue('city', data.localidade || watch('city'));
      setValue('state', data.uf || watch('state'));

      if (data.complemento) {
        setValue('complement', data.complemento);
      }
    } catch {
      setCepError('Erro ao buscar CEP. Tente novamente.');
    } finally {
      setCepLoading(false);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    const { confirmPassword: _confirmPassword, ...payload } = data;
    await registerPharmacy(payload);
  });

  if (isSuccess) {
    return (
      <PageWrapper title="Cadastro de farmácia">
        <EmptyState
          icon={
            <span className="material-symbols-outlined text-3xl" aria-hidden="true">
              check_circle
            </span>
          }
          title="Cadastro recebido"
          description="Aguarde a aprovação do administrador antes de fazer login."
          action={
            <Link to={ROUTES.LOGIN}>
              <Button variant="primary">Ir para o login</Button>
            </Link>
          }
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Cadastro de farmácia"
      description="Registre sua farmácia no MedSave. O acesso será liberado após aprovação."
    >
      <div className="mx-auto w-full max-w-2xl">
        <form className="flex flex-col gap-8" onSubmit={onSubmit} noValidate>
          <section className="flex flex-col gap-4">
            <h2 className="font-headline text-lg font-semibold text-on-surface">
              Dados da empresa
            </h2>
            <Input
              label="Nome da farmácia"
              required
              error={errors.name?.message}
              {...register('name')}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="CNPJ"
                inputMode="numeric"
                placeholder="00000000000000"
                required
                error={errors.cnpj?.message}
                {...register('cnpj')}
              />
              <Input
                label="Telefone"
                type="tel"
                placeholder="Opcional"
                error={errors.phone?.message}
                {...register('phone')}
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
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="font-headline text-lg font-semibold text-on-surface">Acesso</h2>
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
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="font-headline text-lg font-semibold text-on-surface">Endereço</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="CEP"
                placeholder="00000-000"
                inputMode="numeric"
                required
                error={errors.zipCode?.message ?? cepError ?? undefined}
                disabled={cepLoading}
                {...zipCodeRegister}
                onBlur={(event) => {
                  zipCodeRegister.onBlur(event);
                  void handleZipBlur();
                }}
              />
              <Input
                label="Número"
                required
                error={errors.number?.message}
                {...register('number')}
              />
            </div>
            <Input label="Rua" required error={errors.street?.message} {...register('street')} />
            <Input
              label="Complemento"
              error={errors.complement?.message}
              {...register('complement')}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Bairro"
                required
                error={errors.neighborhood?.message}
                {...register('neighborhood')}
              />
              <Input label="Cidade" required error={errors.city?.message} {...register('city')} />
            </div>
            <Input
              label="UF"
              required
              maxLength={2}
              placeholder="SP"
              error={errors.state?.message}
              {...register('state')}
            />
            {cepLoading && (
              <p className="text-sm text-on-surface-variant">Buscando endereço pelo CEP...</p>
            )}
          </section>

          {error && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-[var(--color-danger)]" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
            Enviar cadastro
          </Button>

          <p className="text-center text-sm text-on-surface-variant">
            Já tem conta?{' '}
            <Link to={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </PageWrapper>
  );
};
