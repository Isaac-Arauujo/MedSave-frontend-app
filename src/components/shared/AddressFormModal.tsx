import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { AddressResponse, CreateAddressRequest } from '../../types/AddressTypes';
import { fetchViaCep } from '../../utils/fetchViaCep';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

const addressSchema = z.object({
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
  isDefault: z.boolean(),
});

type AddressFormData = z.input<typeof addressSchema>;

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAddress?: AddressResponse;
  onSubmit: (data: CreateAddressRequest, setAsDefault: boolean) => Promise<void>;
  isSubmitting?: boolean;
}

const emptyValues: AddressFormData = {
  zipCode: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  isDefault: false,
};

export const AddressFormModal = ({
  isOpen,
  onClose,
  initialAddress,
  onSubmit,
  isSubmitting = false,
}: AddressFormModalProps) => {
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const isEditing = Boolean(initialAddress);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (initialAddress) {
      reset({
        zipCode: initialAddress.zipCode,
        street: initialAddress.street,
        number: initialAddress.number,
        complement: initialAddress.complement ?? '',
        neighborhood: initialAddress.neighborhood,
        city: initialAddress.city,
        state: initialAddress.state,
        isDefault: initialAddress.isDefault,
      });
      return;
    }

    reset(emptyValues);
    setCepError(null);
  }, [isOpen, initialAddress, reset]);

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

  const onFormSubmit = handleSubmit(async (data) => {
    const parsed = addressSchema.parse(data);
    const { isDefault, ...payload } = parsed;
    await onSubmit(payload, isDefault);
    onClose();
  });

  const zipCodeRegister = register('zipCode');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar endereço' : 'Adicionar endereço'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="address-form"
            isLoading={isSubmitting}
          >
            {isEditing ? 'Salvar alterações' : 'Adicionar endereço'}
          </Button>
        </>
      }
    >
      <form id="address-form" className="flex flex-col gap-4" onSubmit={(event) => void onFormSubmit(event)}>
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
        <Input label="Complemento" error={errors.complement?.message} {...register('complement')} />

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

        <label className="flex items-center gap-2 text-sm text-on-surface">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
            {...register('isDefault')}
          />
          Definir como endereço padrão
        </label>

        {cepLoading && (
          <p className="text-sm text-on-surface-variant">Buscando endereço pelo CEP...</p>
        )}
      </form>
    </Modal>
  );
};
