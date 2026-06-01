import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/ui/ErrorState';
import { Input } from '../../components/ui/Input';
import { PageLoader } from '../../components/ui/PageLoader';
import { formatAddressLine } from '../../utils/formatAddress';
import { formatCnpj } from '../../utils/formatCnpj';
import { fetchViaCep } from '../../utils/fetchViaCep';
import type { PharmacyStatus } from '../../types/PharmacyTypes';
import { usePharmacyProfile } from '../../hooks/usePharmacyProfile';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral';

const pharmacyStatusConfig: Record<PharmacyStatus, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: 'Pendente', variant: 'warning' },
  APPROVED: { label: 'Aprovada', variant: 'success' },
  SUSPENDED: { label: 'Suspensa', variant: 'danger' },
};

const pharmacyProfileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  phone: z.string().optional(),
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
});

type PharmacyProfileFormData = z.input<typeof pharmacyProfileSchema>;

export const PharmacyProfilePage = () => {
  const { pharmacy, isLoading, isSubmitting, error, updatePharmacy, refetch } = usePharmacyProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PharmacyProfileFormData>({
    resolver: zodResolver(pharmacyProfileSchema),
  });

  useEffect(() => {
    if (!pharmacy) {
      return;
    }

    reset({
      name: pharmacy.name,
      phone: pharmacy.phone ?? '',
      zipCode: pharmacy.zipCode,
      street: pharmacy.street,
      number: pharmacy.number,
      complement: pharmacy.complement ?? '',
      neighborhood: pharmacy.neighborhood,
      city: pharmacy.city,
      state: pharmacy.state,
    });
  }, [pharmacy, reset]);

  const zipCodeRegister = register('zipCode');
  const zipCodeValue = watch('zipCode');

  const handleZipCodeBlur = async () => {
    const normalized = zipCodeValue?.replace(/\D/g, '') ?? '';

    if (normalized.length !== 8) {
      return;
    }

    try {
      setCepLoading(true);
      setCepError(null);
      const data = await fetchViaCep(normalized);

      if (!data) {
        setCepError('CEP não encontrado.');
        return;
      }

      setValue('street', data.logradouro || watch('street'));
      setValue('neighborhood', data.bairro || watch('neighborhood'));
      setValue('city', data.localidade || watch('city'));
      setValue('state', data.uf || watch('state'));
    } catch {
      setCepError('CEP não encontrado.');
    } finally {
      setCepLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (pharmacy) {
      reset({
        name: pharmacy.name,
        phone: pharmacy.phone ?? '',
        zipCode: pharmacy.zipCode,
        street: pharmacy.street,
        number: pharmacy.number,
        complement: pharmacy.complement ?? '',
        neighborhood: pharmacy.neighborhood,
        city: pharmacy.city,
        state: pharmacy.state,
      });
    }

    setIsEditing(false);
    setCepError(null);
  };

  const onSave = handleSubmit(async (data) => {
    const parsed = pharmacyProfileSchema.parse(data);
    await updatePharmacy({
      name: parsed.name,
      phone: parsed.phone || undefined,
      zipCode: parsed.zipCode,
      street: parsed.street,
      number: parsed.number,
      complement: parsed.complement || undefined,
      neighborhood: parsed.neighborhood,
      city: parsed.city,
      state: parsed.state,
    });
    setIsEditing(false);
  });

  if (isLoading && !pharmacy) {
    return <PageLoader message="Carregando perfil da farmácia..." />;
  }

  if (error && !pharmacy) {
    return <ErrorState message={error} onRetry={() => void refetch()} />;
  }

  if (!pharmacy) {
    return null;
  }

  const status = pharmacyStatusConfig[pharmacy.status];

  return (
    <PageWrapper title="Perfil da farmácia" description="Visualize e atualize os dados da sua farmácia.">
      <section className="mb-6 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-headline text-xl font-bold text-on-surface">{pharmacy.name}</h2>
            <p className="text-sm text-on-surface-variant">{pharmacy.email}</p>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>

        {!isEditing ? (
          <>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-on-surface-variant">CNPJ</dt>
                <dd className="font-medium text-on-surface">{formatCnpj(pharmacy.cnpj)}</dd>
              </div>
              <div>
                <dt className="text-sm text-on-surface-variant">Telefone</dt>
                <dd className="font-medium text-on-surface">{pharmacy.phone || 'Não informado'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm text-on-surface-variant">Endereço</dt>
                <dd className="font-medium text-on-surface">{formatAddressLine(pharmacy)}</dd>
              </div>
            </dl>
            <Button variant="primary" className="mt-6" onClick={() => setIsEditing(true)}>
              Editar perfil
            </Button>
          </>
        ) : (
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => void onSave(event)}>
            <Input
              label="Nome da farmácia"
              error={errors.name?.message}
              className="sm:col-span-2"
              {...register('name')}
            />
            <Input label="Telefone" error={errors.phone?.message} {...register('phone')} />
            <Input
              label="CEP"
              error={errors.zipCode?.message ?? cepError ?? undefined}
              {...zipCodeRegister}
              onBlur={(event) => {
                void zipCodeRegister.onBlur(event);
                void handleZipCodeBlur();
              }}
            />
            <Input
              label="Rua"
              error={errors.street?.message}
              className="sm:col-span-2"
              {...register('street')}
            />
            <Input label="Número" error={errors.number?.message} {...register('number')} />
            <Input label="Complemento" error={errors.complement?.message} {...register('complement')} />
            <Input label="Bairro" error={errors.neighborhood?.message} {...register('neighborhood')} />
            <Input label="Cidade" error={errors.city?.message} {...register('city')} />
            <Input label="UF" error={errors.state?.message} {...register('state')} />
            {cepLoading && (
              <p className="text-sm text-on-surface-variant sm:col-span-2">Buscando CEP...</p>
            )}
            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Salvar
              </Button>
              <Button type="button" variant="secondary" onClick={handleCancelEdit}>
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </section>
    </PageWrapper>
  );
};
