import { useCallback, useMemo, useRef, useState } from 'react';
import * as addressApi from '../api/addressApi';
import * as freightApi from '../api/freightApi';
import { ROLES } from '../constants/roles';
import { useAuthStore } from '../store/authStore';
import type { AddressResponse } from '../types/AddressTypes';
import type { DeliveryType } from '../types/CheckoutTypes';
import type { FreightEstimateOption } from '../types/ListingFreightTypes';
import type { ListingPharmacySummary } from '../types/ListingTypes';
import { fetchViaCep } from '../utils/fetchViaCep';
import { handleApiError } from '../utils/handleApiError';

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

const cacheKey = (
  listingId: number,
  zip: string,
  number: string,
  addressId: number | null
) => `${listingId}:${zip}:${number}:${addressId ?? 'none'}`;

export const useListingFreight = (
  listingId: number | null,
  pharmacy?: ListingPharmacySummary | null
) => {
  const { isAuthenticated, role } = useAuthStore();
  const isCustomer = isAuthenticated && role === ROLES.CUSTOMER;

  const [form, setForm] = useState<ListingFreightForm>({
    zipCode: '',
    number: '',
    complement: '',
    selectedAddressId: null,
  });
  const [showNumberField, setShowNumberField] = useState(false);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [cepValid, setCepValid] = useState(false);
  const [cepPreview, setCepPreview] = useState<string | null>(null);
  const [cepLoading, setCepLoading] = useState(false);
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [options, setOptions] = useState<FreightEstimateOption[]>([]);
  const [approximate, setApproximate] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const sessionCache = useRef<Map<string, FreightEstimateOption[]>>(new Map());

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
      setCepValid(false);
      return;
    }

    try {
      setCepLoading(true);
      const data = await fetchViaCep(digits);
      if (!data) {
        setCepPreview(null);
        setCepValid(false);
        return;
      }
      setCepValid(true);
      setCepPreview(`${data.logradouro} — ${data.localidade}/${data.uf}`);
    } catch {
      setCepPreview(null);
      setCepValid(false);
    } finally {
      setCepLoading(false);
    }
  }, []);

  const updateZipCode = useCallback(
    (value: string) => {
      const formatted = formatZipCodeDisplay(value);
      setForm((prev) => ({ ...prev, zipCode: formatted, selectedAddressId: null }));
      setOptions([]);
      setDeliveryError(null);
      setFormError(null);
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
    setCepValid(true);
    setCepPreview(`${address.street} — ${address.city}/${address.state}`);
    setShowNumberField(true);
    setOptions([]);
    setDeliveryError(null);
    setFormError(null);
    setShowSavedAddresses(false);
  }, []);

  const calculateAll = useCallback(async () => {
    if (!listingId) {
      return;
    }

    const digits = normalizeZip(form.zipCode);
    if (!form.selectedAddressId && digits.length !== 8) {
      setFormError('Informe um CEP válido com 8 dígitos.');
      return;
    }

    const key = cacheKey(
      listingId,
      digits,
      form.number.trim(),
      form.selectedAddressId
    );
    const cached = sessionCache.current.get(key);
    if (cached) {
      setOptions(cached);
      setDeliveryError(resolveDeliveryMessage(cached));
      return;
    }

    try {
      setIsCalculating(true);
      setFormError(null);
      setDeliveryError(null);

      const response = await freightApi.estimateFreightOptions({
        listingId,
        ...(form.selectedAddressId
          ? { addressId: form.selectedAddressId }
          : {
              destinationZipCode: digits,
              destinationNumber: form.number.trim() || undefined,
              destinationComplement: form.complement.trim() || undefined,
            }),
      });

      if (response.addressPreview) {
        setCepPreview(response.addressPreview);
        setCepValid(true);
      }
      setApproximate(response.approximate);
      setOptions(response.options);
      sessionCache.current.set(key, response.options);
      setDeliveryError(resolveDeliveryMessage(response.options));
    } catch (err) {
      const message = handleApiError(err);
      setFormError(message);
      setOptions([]);
    } finally {
      setIsCalculating(false);
    }
  }, [form, listingId]);

  const pickupOption = options.find((o) => o.deliveryType === 'PICKUP' && o.available);
  const deliveryOptions = options.filter(
    (o) => o.deliveryType !== 'PICKUP' && o.available && o.price != null
  );
  const hasDeliveryFailure = options.some(
    (o) => o.deliveryType !== 'PICKUP' && o.available === false
  );

  const deliveryTypeLabel = useMemo(
    () =>
      ({
        PICKUP: 'Retirar na farmácia',
        RAPID: 'Entrega rápida',
        NORMAL: 'Entrega normal',
        SCHEDULED: 'Entrega agendada',
      }) as Record<DeliveryType, string>,
    []
  );

  const pharmacyPickupLine = useMemo(() => {
    if (!pharmacy) {
      return null;
    }
    const location = [pharmacy.neighborhood, pharmacy.city, pharmacy.state]
      .filter(Boolean)
      .join(', ');
    return location || pharmacy.addressSummary || null;
  }, [pharmacy]);

  return {
    form,
    setForm,
    updateZipCode,
    showNumberField,
    setShowNumberField,
    showSavedAddresses,
    setShowSavedAddresses,
    cepValid,
    cepPreview,
    cepLoading,
    addresses,
    addressesLoading,
    loadAddresses,
    selectAddress,
    options,
    pickupOption,
    deliveryOptions,
    hasDeliveryFailure,
    approximate,
    isCalculating,
    formError,
    deliveryError,
    calculateAll,
    deliveryTypeLabel,
    pharmacyPickupLine,
    pharmacyName: pharmacy?.name ?? null,
    isCustomer,
  };
};

function resolveDeliveryMessage(options: FreightEstimateOption[]): string | null {
  const deliveryTypes = options.filter((o) => o.deliveryType !== 'PICKUP');
  if (deliveryTypes.length === 0) {
    return null;
  }
  const allFailed = deliveryTypes.every((o) => !o.available);
  if (!allFailed) {
    return null;
  }
  const firstMessage = deliveryTypes.find((o) => o.message)?.message;
  return firstMessage ?? 'Entrega indisponível para este CEP no momento.';
}
