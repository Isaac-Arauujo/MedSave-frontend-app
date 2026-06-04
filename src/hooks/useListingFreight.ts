import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import * as addressApi from '../api/addressApi';
import * as freightApi from '../api/freightApi';
import { ROLES } from '../constants/roles';
import { useAuthStore } from '../store/authStore';
import type { AddressResponse } from '../types/AddressTypes';
import type { DeliveryType } from '../types/CheckoutTypes';
import type { FreightResult } from '../types/FreightTypes';
import { fetchViaCep } from '../utils/fetchViaCep';
import { handleApiError } from '../utils/handleApiError';

const DELIVERY_TYPES: DeliveryType[] = ['PICKUP', 'RAPID', 'NORMAL', 'SCHEDULED'];

const PICKUP_FREIGHT: FreightResult = {
  price: 0,
  estimateLabel: 'Retirada na farmácia',
  estimateDays: 0,
};

export interface ListingFreightOption {
  deliveryType: DeliveryType;
  freight: FreightResult;
}

export interface ListingFreightForm {
  zipCode: string;
  number: string;
  complement: string;
  selectedAddressId: number | null;
}

const normalizeZip = (value: string) => value.replace(/\D/g, '');

export const formatZipCodeDisplay = (value: string): string => {
  const digits = normalizeZip(value).slice(0, 8);
  if (digits.length <= 5) {
    return digits;
  }
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

export const useListingFreight = (listingId: number | null) => {
  const { isAuthenticated, role } = useAuthStore();
  const isCustomer = isAuthenticated && role === ROLES.CUSTOMER;

  const [form, setForm] = useState<ListingFreightForm>({
    zipCode: '',
    number: '',
    complement: '',
    selectedAddressId: null,
  });
  const [cepPreview, setCepPreview] = useState<string | null>(null);
  const [cepLoading, setCepLoading] = useState(false);
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [options, setOptions] = useState<ListingFreightOption[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAddresses = useCallback(async () => {
    if (!isCustomer) {
      setAddresses([]);
      return;
    }

    try {
      setAddressesLoading(true);
      const data = await addressApi.getAddresses();
      setAddresses(data);
    } catch {
      setAddresses([]);
    } finally {
      setAddressesLoading(false);
    }
  }, [isCustomer]);

  const lookupCep = useCallback(async (zipCode: string) => {
    const digits = normalizeZip(zipCode);
    if (digits.length !== 8) {
      setCepPreview(null);
      return;
    }

    try {
      setCepLoading(true);
      const data = await fetchViaCep(digits);
      if (!data) {
        setCepPreview(null);
        return;
      }
      setCepPreview(`${data.logradouro}, ${data.bairro} — ${data.localidade}/${data.uf}`);
    } catch {
      setCepPreview(null);
    } finally {
      setCepLoading(false);
    }
  }, []);

  const updateZipCode = useCallback(
    (value: string) => {
      const formatted = formatZipCodeDisplay(value);
      setForm((prev) => ({ ...prev, zipCode: formatted, selectedAddressId: null }));
      void lookupCep(formatted);
    },
    [lookupCep]
  );

  const selectAddress = useCallback((address: AddressResponse) => {
    setForm({
      zipCode: formatZipCodeDisplay(address.zipCode),
      number: address.number,
      complement: address.complement ?? '',
      selectedAddressId: address.id,
    });
    setCepPreview(
      `${address.street}, ${address.neighborhood} — ${address.city}/${address.state}`
    );
    setError(null);
  }, []);

  const clearResults = useCallback(() => {
    setOptions([]);
    setError(null);
  }, []);

  const calculateAll = useCallback(async () => {
    if (!listingId) {
      return;
    }

    const digits = normalizeZip(form.zipCode);
    if (!form.selectedAddressId && (digits.length !== 8 || !form.number.trim())) {
      setError('Informe CEP e número para calcular o frete.');
      return;
    }

    try {
      setIsCalculating(true);
      setError(null);
      const calculated: ListingFreightOption[] = [];

      for (const deliveryType of DELIVERY_TYPES) {
        if (deliveryType === 'PICKUP') {
          calculated.push({ deliveryType, freight: PICKUP_FREIGHT });
          continue;
        }

        try {
          const freight = await freightApi.estimateFreight({
            listingId,
            deliveryType,
            ...(form.selectedAddressId
              ? { addressId: form.selectedAddressId }
              : {
                  destinationZipCode: digits,
                  destinationNumber: form.number.trim(),
                  destinationComplement: form.complement.trim() || undefined,
                }),
          });
          calculated.push({ deliveryType, freight });
        } catch (partialError) {
          if (calculated.length === 0 && deliveryType === DELIVERY_TYPES[DELIVERY_TYPES.length - 1]) {
            throw partialError;
          }
        }
      }

      if (calculated.length === 1 && calculated[0]?.deliveryType === 'PICKUP') {
        setError('Frete indisponível para esse endereço.');
      }

      setOptions(calculated);
    } catch (err) {
      const message = handleApiError(err);
      setError(message);
      toast.error(message);
    } finally {
      setIsCalculating(false);
    }
  }, [form, listingId]);

  const deliveryTypeLabel = useMemo(
    () =>
      ({
        PICKUP: 'Retirada na farmácia',
        RAPID: 'Entrega rápida',
        NORMAL: 'Entrega normal',
        SCHEDULED: 'Entrega agendada',
      }) as Record<DeliveryType, string>,
    []
  );

  return {
    form,
    setForm,
    updateZipCode,
    cepPreview,
    cepLoading,
    addresses,
    addressesLoading,
    loadAddresses,
    selectAddress,
    options,
    isCalculating,
    error,
    calculateAll,
    clearResults,
    deliveryTypeLabel,
    isCustomer,
  };
};
