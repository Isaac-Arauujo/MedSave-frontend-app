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
  isCepOnlySearchInput,
  isValidAddressPayload,
  looksLikeStreetWithoutNumber,
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

const SAVE_BLOCKED_HINT =
  'Para salvar, selecione uma sugestão de endereço completa com número.';

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
  const [searchQuery, setSearchQuery] = useState('');
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
    setSearchQuery('');
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
    } else {
      setValue('number', '', { shouldValidate: true });
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

  const fieldsLocked = !complementOnlyUpdate && !canSave;

  const statusMessage = useMemo(() => {
    if (complementOnlyUpdate) {
      return null;
    }
    if (selectedPlace && payloadValidation.valid && !placeInvalidated) {
      return 'Endereço localizado com sucesso.';
    }
    if (selectedPlace && payloadValidation.missingGoogleNumber) {
      return 'Este endereço foi localizado sem número. Para entrega, pesquise novamente incluindo o número.';
    }
    if (selectedPlace && !hasValidPlaceCoordinates(selectedPlace.latitude, selectedPlace.longitude)) {
      return 'Não foi possível obter a localização desse endereço. Tente selecionar outra sugestão.';
    }
    if (isCepOnlySearchInput(searchQuery)) {
      return 'Digite a rua com o número. O CEP sozinho não localiza o endereço para entrega.';
    }
    if (looksLikeStreetWithoutNumber(searchQuery) && !selectedPlace) {
      return 'Selecione uma sugestão com número ou pesquise novamente incluindo o número do endereço.';
    }
    if (placeInvalidated || !selectedPlace) {
      return SAVE_BLOCKED_HINT;
    }
    return SAVE_BLOCKED_HINT;
  }, [
    complementOnlyUpdate,
    selectedPlace,
    payloadValidation.valid,
    payloadValidation.missingGoogleNumber,
    placeInvalidated,
    searchQuery,
  ]);

  const statusIsSuccess =
    Boolean(selectedPlace && payloadValidation.valid && !placeInvalidated && !complementOnlyUpdate);

  const statusIsWarning =
    !statusIsSuccess
    && (isCepOnlySearchInput(searchQuery)
      || payloadValidation.missingGoogleNumber
      || looksLikeStreetWithoutNumber(searchQuery));

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
      numberSource: 'GOOGLE_PLACE',
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
        <div className="flex w-full flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
          {!canSave && !complementOnlyUpdate && (
            <p className="text-xs text-on-surface-variant sm:mr-auto">{SAVE_BLOCKED_HINT}</p>
          )}
          <div className="flex gap-2 sm:justify-end">
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
          </div>
        </div>
      }
    >
      <form id="address-form" className="flex flex-col gap-4" onSubmit={(event) => void onFormSubmit(event)}>
        <GooglePlacesAddressAutocomplete
          resetKey={searchResetKey}
          disabled={isSubmitting}
          onPlaceSelected={handlePlaceSelected}
          onInputChange={(value) => {
            setSearchQuery(value);
            if (selectedPlace) {
              setSelectedPlace(null);
              setPlaceInvalidated(true);
            }
          }}
        />

        {statusMessage && (
          <p
            className={
              statusIsSuccess
                ? 'text-sm text-primary'
                : statusIsWarning
                  ? 'text-sm text-[var(--color-warning)]'
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

        <p className="text-xs text-on-surface-variant">
          Os campos são preenchidos após selecionar uma sugestão válida.
        </p>

        <Input
          label="Rua"
          required
          readOnly={fieldsLocked}
          error={errors.street?.message}
          {...register('street', { onChange: handleStructuralFieldChange })}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Número"
            required
            readOnly={fieldsLocked}
            error={errors.number?.message}
            {...register('number', { onChange: handleStructuralFieldChange })}
          />
          <Input label="Complemento" error={errors.complement?.message} {...register('complement')} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Bairro"
            required
            readOnly={fieldsLocked}
            error={errors.neighborhood?.message}
            {...register('neighborhood', { onChange: handleStructuralFieldChange })}
          />
          <Input
            label="Cidade"
            required
            readOnly={fieldsLocked}
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
            readOnly={fieldsLocked}
            error={errors.state?.message}
            {...register('state', { onChange: handleStructuralFieldChange })}
          />
          <Input
            label="CEP"
            placeholder="00000-000"
            inputMode="numeric"
            required
            readOnly={fieldsLocked}
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
