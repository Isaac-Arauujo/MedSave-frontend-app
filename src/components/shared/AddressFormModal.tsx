import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

const SAVE_BLOCKED_HINT = 'Selecione uma sugestão completa para salvar.';

type StatusTone = 'success' | 'warning' | 'neutral' | 'error';

interface AddressStatus {
  main: string | null;
  sub?: string | null;
  tone: StatusTone;
}

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

  const handlePlaceSelected = useCallback((place: ExtractedGooglePlaceAddress) => {
    setSelectedPlace(place);
    setPlaceInvalidated(false);
    setSearchQuery(place.formattedAddress);
    setValue('street', place.street, { shouldValidate: true });
    setValue('number', place.number || '', { shouldValidate: true });
    setValue('neighborhood', place.neighborhood, { shouldValidate: true });
    setValue('city', place.city, { shouldValidate: true });
    setValue('state', place.state, { shouldValidate: true });
    if (place.zipCode) {
      setValue('zipCode', place.zipCode, { shouldValidate: true });
    }
  }, [setValue]);

  const handleUserSearchInput = useCallback((value: string) => {
    setSearchQuery(value);
    setSelectedPlace(null);
    setPlaceInvalidated(true);
  }, []);

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

  const status = useMemo((): AddressStatus => {
    if (complementOnlyUpdate) {
      return { main: null, tone: 'neutral' };
    }

    if (selectedPlace && payloadValidation.valid && !placeInvalidated) {
      return { main: 'Endereço localizado com sucesso.', tone: 'success' };
    }

    if (selectedPlace && payloadValidation.missingGoogleNumber) {
      return {
        main: 'Selecione uma sugestão com número ou busque novamente incluindo o número.',
        tone: 'warning',
      };
    }

    if (selectedPlace && !hasValidPlaceCoordinates(selectedPlace.latitude, selectedPlace.longitude)) {
      return {
        main: 'Não foi possível obter a localização. Selecione outra sugestão.',
        tone: 'error',
      };
    }

    if (isCepOnlySearchInput(searchQuery)) {
      return {
        main: 'CEP sozinho não localiza o endereço para entrega. Busque por rua, número e cidade.',
        tone: 'warning',
      };
    }

    if (looksLikeStreetWithoutNumber(searchQuery) && !selectedPlace) {
      return {
        main: 'Selecione uma sugestão com número ou busque novamente incluindo o número.',
        tone: 'warning',
      };
    }

    if (placeInvalidated || searchQuery.trim().length > 0) {
      return {
        main: 'Selecione uma sugestão da lista para liberar o salvamento.',
        tone: 'neutral',
      };
    }

    return {
      main: 'Digite rua, número e cidade. Depois selecione uma sugestão da lista.',
      sub: 'Não use apenas o CEP.',
      tone: 'neutral',
    };
  }, [
    complementOnlyUpdate,
    selectedPlace,
    payloadValidation.valid,
    payloadValidation.missingGoogleNumber,
    placeInvalidated,
    searchQuery,
  ]);

  const statusClassName = {
    success: 'text-sm text-primary',
    warning: 'text-sm text-[var(--color-warning)]',
    neutral: 'text-sm text-on-surface-variant',
    error: 'text-sm text-[var(--color-danger)]',
  }[status.tone];

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

  const fieldInputClass = 'min-h-11 text-base sm:min-h-0 sm:text-sm';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar endereço' : 'Adicionar endereço'}
      size="lg"
      layout="sheet"
      footer={
        <div className="flex w-full flex-col gap-3">
          {!canSave && !complementOnlyUpdate && (
            <p className="text-center text-xs text-on-surface-variant sm:text-left">{SAVE_BLOCKED_HINT}</p>
          )}
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              form="address-form"
              isLoading={isSubmitting}
              disabled={!canSave}
              className="w-full sm:w-auto"
            >
              Salvar endereço
            </Button>
          </div>
        </div>
      }
    >
      <form
        id="address-form"
        className="flex flex-col gap-4 overflow-x-hidden"
        onSubmit={(event) => void onFormSubmit(event)}
      >
        <GooglePlacesAddressAutocomplete
          resetKey={searchResetKey}
          disabled={isSubmitting}
          onPlaceSelected={handlePlaceSelected}
          onUserInputChange={handleUserSearchInput}
        />

        {status.main && (
          <div role="status" className="space-y-1">
            <p className={statusClassName}>{status.main}</p>
            {status.sub && (
              <p className="text-xs text-on-surface-variant">{status.sub}</p>
            )}
          </div>
        )}

        {payloadValidation.zipWarning && (
          <p className="text-sm text-[var(--color-warning)]" role="alert">
            Confira o CEP antes de salvar.
          </p>
        )}

        <div className="space-y-3 border-t border-outline-variant pt-4">
          <p className="text-xs font-medium text-on-surface-variant">
            Confira os dados preenchidos automaticamente.
          </p>

          <Input
            label="Rua"
            required
            readOnly={fieldsLocked}
            className={fieldInputClass}
            error={errors.street?.message}
            {...register('street', { onChange: handleStructuralFieldChange })}
          />

          <Input
            label="Número"
            required
            readOnly={fieldsLocked}
            className={fieldInputClass}
            error={errors.number?.message}
            {...register('number', { onChange: handleStructuralFieldChange })}
          />

          <Input
            label="Complemento"
            className={fieldInputClass}
            error={errors.complement?.message}
            {...register('complement')}
          />

          <Input
            label="Bairro"
            required
            readOnly={fieldsLocked}
            className={fieldInputClass}
            error={errors.neighborhood?.message}
            {...register('neighborhood', { onChange: handleStructuralFieldChange })}
          />

          <Input
            label="Cidade"
            required
            readOnly={fieldsLocked}
            className={fieldInputClass}
            error={errors.city?.message}
            {...register('city', { onChange: handleStructuralFieldChange })}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="UF"
              required
              maxLength={2}
              placeholder="SP"
              readOnly={fieldsLocked}
              className={fieldInputClass}
              error={errors.state?.message}
              {...register('state', { onChange: handleStructuralFieldChange })}
            />
            <Input
              label="CEP"
              placeholder="00000-000"
              inputMode="numeric"
              required
              readOnly={fieldsLocked}
              className={fieldInputClass}
              error={errors.zipCode?.message}
              {...register('zipCode', { onChange: handleStructuralFieldChange })}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 pb-2 text-sm text-on-surface">
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
