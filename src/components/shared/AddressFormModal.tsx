import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type {
  AddressResponse,
  CreateAddressRequest,
  UpdateAddressRequest,
} from '../../types/AddressTypes';
import {
  hasValidPlaceCoordinates,
  isValidAddressPayload,
  type ExtractedGooglePlaceAddress,
} from '../../utils/extractGooglePlaceAddress';
import { GooglePlacesAddressAutocomplete } from './GooglePlacesAddressAutocomplete';
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
  onSubmit: (
    data: CreateAddressRequest | UpdateAddressRequest,
    setAsDefault: boolean
  ) => Promise<void>;
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

const STRUCTURAL_FIELDS = ['zipCode', 'street', 'number', 'neighborhood', 'city', 'state'] as const;

export const AddressFormModal = ({
  isOpen,
  onClose,
  initialAddress,
  onSubmit,
  isSubmitting = false,
}: AddressFormModalProps) => {
  const [selectedPlace, setSelectedPlace] = useState<ExtractedGooglePlaceAddress | null>(null);
  const [placeInvalidated, setPlaceInvalidated] = useState(false);
  const [searchResetKey, setSearchResetKey] = useState(0);
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

  const watchedValues = watch();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSelectedPlace(null);
    setPlaceInvalidated(false);
    setSearchResetKey((key) => key + 1);

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
  }, [isOpen, initialAddress, reset]);

  const structuralFieldsChanged = useMemo(() => {
    if (!initialAddress) {
      return true;
    }

    return STRUCTURAL_FIELDS.some((field) => {
      if (field === 'zipCode') {
        return (watchedValues.zipCode ?? '').replace(/\D/g, '')
          !== (initialAddress.zipCode ?? '').replace(/\D/g, '');
      }
      return (watchedValues[field] ?? '').trim() !== (initialAddress[field] ?? '').trim();
    });
  }, [initialAddress, watchedValues]);

  const complementOnlyUpdate = isEditing && !structuralFieldsChanged;

  const handlePlaceSelected = (place: ExtractedGooglePlaceAddress) => {
    setSelectedPlace(place);
    setPlaceInvalidated(false);
    setValue('street', place.street, { shouldValidate: true });
    if (place.number) {
      setValue('number', place.number, { shouldValidate: true });
    }
    setValue('neighborhood', place.neighborhood, { shouldValidate: true });
    setValue('city', place.city, { shouldValidate: true });
    setValue('state', place.state, { shouldValidate: true });
    if (place.zipCode) {
      setValue('zipCode', place.zipCode, { shouldValidate: true });
    }
  };

  const handleStructuralFieldChange = () => {
    if (selectedPlace) {
      setSelectedPlace(null);
      setPlaceInvalidated(true);
    }
  };

  const payloadValidation = isValidAddressPayload(
    selectedPlace,
    watchedValues.number ?? '',
    watchedValues.zipCode ?? ''
  );

  const canSave = complementOnlyUpdate
    ? hasValidPlaceCoordinates(initialAddress?.latitude, initialAddress?.longitude)
    : payloadValidation.valid && !placeInvalidated;

  const statusMessage = useMemo(() => {
    if (complementOnlyUpdate) {
      return null;
    }
    if (selectedPlace && payloadValidation.valid) {
      return 'Endereço localizado com sucesso.';
    }
    if (placeInvalidated || !selectedPlace) {
      return 'Selecione um endereço válido na busca antes de salvar.';
    }
    if (selectedPlace && !hasValidPlaceCoordinates(selectedPlace.latitude, selectedPlace.longitude)) {
      return 'Não foi possível obter a localização desse endereço. Tente selecionar outra sugestão.';
    }
    return 'Selecione um endereço válido na busca antes de salvar.';
  }, [complementOnlyUpdate, selectedPlace, payloadValidation.valid, placeInvalidated]);

  const onFormSubmit = handleSubmit(async (data) => {
    const parsed = addressSchema.parse(data);

    if (complementOnlyUpdate) {
      await onSubmit({ complement: parsed.complement || undefined }, parsed.isDefault);
      onClose();
      return;
    }

    if (!selectedPlace || !payloadValidation.valid) {
      return;
    }

    const numberSource = selectedPlace.numberFromGoogle && parsed.number === selectedPlace.number
      ? 'GOOGLE_PLACE'
      : 'USER';

    const payload: CreateAddressRequest = {
      zipCode: parsed.zipCode,
      street: parsed.street,
      number: parsed.number,
      complement: parsed.complement || undefined,
      neighborhood: parsed.neighborhood,
      city: parsed.city,
      state: parsed.state,
      latitude: selectedPlace.latitude,
      longitude: selectedPlace.longitude,
      googlePlaceId: selectedPlace.placeId,
      formattedAddress: selectedPlace.formattedAddress,
      geocodingProvider: 'GOOGLE_PLACES',
      coordinatesSource: 'GOOGLE_PLACES',
      numberSource,
    };

    await onSubmit(payload, parsed.isDefault);
    onClose();
  });

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
            disabled={!canSave}
          >
            Salvar endereço
          </Button>
        </>
      }
    >
      <form id="address-form" className="flex flex-col gap-4" onSubmit={(event) => void onFormSubmit(event)}>
        <GooglePlacesAddressAutocomplete
          resetKey={searchResetKey}
          disabled={isSubmitting}
          onPlaceSelected={handlePlaceSelected}
          onInputChange={() => {
            if (selectedPlace) {
              setSelectedPlace(null);
              setPlaceInvalidated(true);
            }
          }}
        />

        {statusMessage && (
          <p
            className={
              selectedPlace && payloadValidation.valid && !placeInvalidated
                ? 'text-sm text-primary'
                : 'text-sm text-on-surface-variant'
            }
            role="status"
          >
            {statusMessage}
          </p>
        )}

        {payloadValidation.zipWarning && (
          <p className="text-sm text-[var(--color-warning)]" role="alert">
            Confira o CEP antes de salvar.
          </p>
        )}

        <Input
          label="Rua"
          required
          error={errors.street?.message}
          {...register('street', { onChange: handleStructuralFieldChange })}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Número"
            required
            error={errors.number?.message}
            {...register('number', { onChange: handleStructuralFieldChange })}
          />
          <Input label="Complemento" error={errors.complement?.message} {...register('complement')} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Bairro"
            required
            error={errors.neighborhood?.message}
            {...register('neighborhood', { onChange: handleStructuralFieldChange })}
          />
          <Input
            label="Cidade"
            required
            error={errors.city?.message}
            {...register('city', { onChange: handleStructuralFieldChange })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="UF"
            required
            maxLength={2}
            placeholder="SP"
            error={errors.state?.message}
            {...register('state', { onChange: handleStructuralFieldChange })}
          />
          <Input
            label="CEP"
            placeholder="00000-000"
            inputMode="numeric"
            required
            error={errors.zipCode?.message}
            {...register('zipCode', { onChange: handleStructuralFieldChange })}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-on-surface">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
            {...register('isDefault')}
          />
          Definir como endereço padrão
        </label>
      </form>
    </Modal>
  );
};
