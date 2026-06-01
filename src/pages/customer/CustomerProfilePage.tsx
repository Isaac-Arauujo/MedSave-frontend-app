import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/ui/ErrorState';
import { Input } from '../../components/ui/Input';
import { PageLoader } from '../../components/ui/PageLoader';
import { useProfile } from '../../hooks/useProfile';
import type { Gender } from '../../types/UserTypes';
import { formatCpf } from '../../utils/formatCpf';
import { formatDate } from '../../utils/formatDate';

const genderOptions: { value: Gender; label: string }[] = [
  { value: 'MALE', label: 'Masculino' },
  { value: 'FEMALE', label: 'Feminino' },
  { value: 'OTHER', label: 'Outro' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefiro não informar' },
];

const profileSchema = z.object({
  firstName: z.string().min(1, 'Nome é obrigatório'),
  lastName: z.string().min(1, 'Sobrenome é obrigatório'),
  phone: z.string().optional(),
  mobilePhone: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z
    .enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY', ''])
    .optional()
    .transform((value) => (value === '' ? undefined : value)),
});

type ProfileFormData = z.input<typeof profileSchema>;

const toDateInputValue = (isoDate?: string): string => {
  if (!isoDate) {
    return '';
  }

  return isoDate.slice(0, 10);
};

const getGenderLabel = (gender?: Gender): string => {
  if (!gender) {
    return 'Não informado';
  }

  return genderOptions.find((option) => option.value === gender)?.label ?? 'Não informado';
};

export const CustomerProfilePage = () => {
  const { profile, isLoading, error, updateProfile, refetch } = useProfile();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (!profile) {
      return;
    }

    reset({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone ?? '',
      mobilePhone: profile.mobilePhone ?? '',
      birthDate: toDateInputValue(profile.birthDate),
      gender: profile.gender,
    });
  }, [profile, reset]);

  const handleCancelEdit = () => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone ?? '',
        mobilePhone: profile.mobilePhone ?? '',
        birthDate: toDateInputValue(profile.birthDate),
        gender: profile.gender,
      });
    }

    setIsEditing(false);
  };

  const onSave = handleSubmit(async (data) => {
    await updateProfile({
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || undefined,
      mobilePhone: data.mobilePhone || undefined,
      birthDate: data.birthDate || undefined,
      gender: data.gender,
    });
    setIsEditing(false);
  });

  if (isLoading && !profile) {
    return <PageLoader message="Carregando perfil..." />;
  }

  if (error && !profile) {
    return <ErrorState message={error} onRetry={() => void refetch()} />;
  }

  if (!profile) {
    return null;
  }

  return (
    <PageWrapper
      title="Meu perfil"
      description="Gerencie suas informações pessoais."
      actions={
        !isEditing ? (
          <Button variant="secondary" onClick={() => setIsEditing(true)}>
            Editar perfil
          </Button>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={handleCancelEdit} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={() => void onSave()} isLoading={isSubmitting}>
              Salvar
            </Button>
          </div>
        )
      }
    >
      <div className="mx-auto w-full max-w-2xl">
        <form className="flex flex-col gap-6" onSubmit={(event) => void onSave(event)}>
          <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
            <h2 className="mb-4 font-headline text-lg font-semibold text-on-surface">
              Informações da conta
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="E-mail" value={profile.email} readOnly disabled />
              <Input label="CPF" value={formatCpf(profile.cpf)} readOnly disabled />
            </div>
          </section>

          <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
            <h2 className="mb-4 font-headline text-lg font-semibold text-on-surface">
              Dados pessoais
            </h2>

            {!isEditing ? (
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-on-surface-variant">Nome</dt>
                  <dd className="font-medium text-on-surface">{profile.firstName}</dd>
                </div>
                <div>
                  <dt className="text-sm text-on-surface-variant">Sobrenome</dt>
                  <dd className="font-medium text-on-surface">{profile.lastName}</dd>
                </div>
                <div>
                  <dt className="text-sm text-on-surface-variant">Telefone</dt>
                  <dd className="font-medium text-on-surface">{profile.phone || 'Não informado'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-on-surface-variant">Celular</dt>
                  <dd className="font-medium text-on-surface">
                    {profile.mobilePhone || 'Não informado'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-on-surface-variant">Data de nascimento</dt>
                  <dd className="font-medium text-on-surface">
                    {profile.birthDate ? formatDate(profile.birthDate) : 'Não informado'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-on-surface-variant">Gênero</dt>
                  <dd className="font-medium text-on-surface">{getGenderLabel(profile.gender)}</dd>
                </div>
              </dl>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Nome"
                  required
                  error={errors.firstName?.message}
                  {...register('firstName')}
                />
                <Input
                  label="Sobrenome"
                  required
                  error={errors.lastName?.message}
                  {...register('lastName')}
                />
                <Input
                  label="Telefone"
                  type="tel"
                  error={errors.phone?.message}
                  {...register('phone')}
                />
                <Input
                  label="Celular"
                  type="tel"
                  error={errors.mobilePhone?.message}
                  {...register('mobilePhone')}
                />
                <Input
                  label="Data de nascimento"
                  type="date"
                  error={errors.birthDate?.message}
                  {...register('birthDate')}
                />
                <div className="flex w-full flex-col gap-1.5">
                  <label htmlFor="gender" className="text-sm font-medium text-on-surface">
                    Gênero
                  </label>
                  <select
                    id="gender"
                    className={clsx(
                      'w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                      errors.gender && 'border-[var(--color-danger)]'
                    )}
                    {...register('gender')}
                  >
                    <option value="">Selecione</option>
                    {genderOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.gender && (
                    <p className="text-sm text-[var(--color-danger)]" role="alert">
                      {errors.gender.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>

          {error && isEditing && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-[var(--color-danger)]" role="alert">
              {error}
            </p>
          )}
        </form>
      </div>
    </PageWrapper>
  );
};
