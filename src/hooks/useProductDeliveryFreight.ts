import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as addressApi from '../api/addressApi';
import * as freightApi from '../api/freightApi';
import { ROLES } from '../constants/roles';
import { useAuthStore } from '../store/authStore';
import type { AddressResponse, CreateAddressRequest } from '../types/AddressTypes';
import type { FreightEstimateOption } from '../types/ListingFreightTypes';
import type { ListingPharmacySummary } from '../types/ListingTypes';
import {
  formatShortAddressLine,
  hasValidSavedAddressCoordinates,
  pickDefaultDeliverableAddress,
} from '../utils/addressDisplay';
import type { ExtractedGooglePlaceAddress } from '../utils/extractGooglePlaceAddress';
import { isCepOnlySearchInput } from '../utils/extractGooglePlaceAddress';
import { handleApiError } from '../utils/handleApiError';
import {
  buildFreightEstimateRequest,
  freightCacheKey,
  resolveDeliveryFailureMessage,
  type ProductDeliverySource,
} from '../utils/productDeliveryFreight';

export const useProductDeliveryFreight = (
  listingId: number | null,
  pharmacy?: ListingPharmacySummary | null,
  deliveryAvailable = true
) => {
  const { isAuthenticated, role } = useAuthStore();
  const isCustomer = isAuthenticated && role === ROLES.CUSTOMER;

  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressResponse | null>(null);
  const [guestPlace, setGuestPlace] = useState<ExtractedGooglePlaceAddress | null>(null);
  const [guestSearchQuery, setGuestSearchQuery] = useState('');
  const [options, setOptions] = useState<FreightEstimateOption[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);
  const sessionCache = useRef<Map<string, FreightEstimateOption[]>>(new Map());
  const autoCalculatedRef = useRef(false);

  const deliverySource = useMemo((): ProductDeliverySource | null => {
    if (isCustomer && selectedAddress) {
      return { type: 'saved', address: selectedAddress };
    }
    if (!isCustomer && guestPlace) {
      return { type: 'guest', place: guestPlace };
    }
    return null;
  }, [guestPlace, isCustomer, selectedAddress]);

  const loadAddresses = useCallback(async () => {
    if (!isCustomer) {
      setAddresses([]);
      setSelectedAddress(null);
      return;
    }

    try {
      setAddressesLoading(true);
      const data = await addressApi.getAddresses();
      setAddresses(data);
      const defaultAddress = pickDefaultDeliverableAddress(data);
      setSelectedAddress(defaultAddress);
    } catch {
      setAddresses([]);
      setSelectedAddress(null);
    } finally {
      setAddressesLoading(false);
    }
  }, [isCustomer]);

  const calculateFreight = useCallback(
    async (source: ProductDeliverySource | null = deliverySource) => {
      if (!listingId || !source || !deliveryAvailable) {
        return;
      }

      const cacheKey = freightCacheKey(listingId, source);
      const cached = sessionCache.current.get(cacheKey);
      if (cached) {
        setOptions(cached);
        setDeliveryError(resolveDeliveryFailureMessage(cached));
        setHasCalculated(true);
        return;
      }

      try {
        setIsCalculating(true);
        setDeliveryError(null);

        const response = await freightApi.estimateFreightOptions(
          buildFreightEstimateRequest(listingId, source)
        );

        setOptions(response.options);
        sessionCache.current.set(cacheKey, response.options);
        setDeliveryError(resolveDeliveryFailureMessage(response.options));
        setHasCalculated(true);
      } catch (err) {
        setOptions([]);
        setDeliveryError(handleApiError(err));
        setHasCalculated(true);
      } finally {
        setIsCalculating(false);
      }
    },
    [deliveryAvailable, deliverySource, listingId]
  );

  useEffect(() => {
    autoCalculatedRef.current = false;
    setOptions([]);
    setDeliveryError(null);
    setHasCalculated(false);
    setGuestPlace(null);
    setGuestSearchQuery('');
    void loadAddresses();
  }, [listingId, isCustomer, loadAddresses]);

  useEffect(() => {
    if (!isCustomer || !selectedAddress || autoCalculatedRef.current || addressesLoading) {
      return;
    }

    autoCalculatedRef.current = true;
    void calculateFreight({ type: 'saved', address: selectedAddress });
  }, [addressesLoading, calculateFreight, isCustomer, selectedAddress]);

  const selectAddress = useCallback(
    (address: AddressResponse) => {
      if (!hasValidSavedAddressCoordinates(address)) {
        setDeliveryError('Atualize seu endereço de entrega antes de continuar.');
        return;
      }

      setSelectedAddress(address);
      setGuestPlace(null);
      void calculateFreight({ type: 'saved', address });
    },
    [calculateFreight]
  );

  const handleGuestPlaceSelected = useCallback(
    (place: ExtractedGooglePlaceAddress) => {
      setGuestPlace(place);
      setGuestSearchQuery(place.formattedAddress);
      void calculateFreight({ type: 'guest', place });
    },
    [calculateFreight]
  );

  const handleGuestInputChange = useCallback((value: string) => {
    setGuestSearchQuery(value);
    if (guestPlace) {
      setGuestPlace(null);
      setOptions([]);
      setHasCalculated(false);
      setDeliveryError(null);
    }
  }, [guestPlace]);

  const handleAddressCreated = useCallback(
    async (payload: CreateAddressRequest, setAsDefault: boolean) => {
      const created = await addressApi.createAddress(payload);
      if (setAsDefault) {
        await addressApi.setDefaultAddress(created.id);
      }
      const refreshed = await addressApi.getAddresses();
      setAddresses(refreshed);
      const createdAddress = refreshed.find((address) => address.id === created.id) ?? created;
      selectAddress(createdAddress);
      return createdAddress;
    },
    [selectAddress]
  );

  const pickupOption = options.find(
    (option) => option.deliveryType === 'PICKUP' && option.available
  );
  const deliveryOptions = options.filter(
    (option) => option.deliveryType !== 'PICKUP' && option.available && option.price != null
  );
  const hasDeliveryFailure = options.some(
    (option) => option.deliveryType !== 'PICKUP' && option.available === false
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

  const selectedAddressLine = selectedAddress
    ? formatShortAddressLine(selectedAddress)
    : null;

  const guestHint = useMemo(() => {
    if (isCustomer || guestPlace) {
      return null;
    }
    if (isCepOnlySearchInput(guestSearchQuery)) {
      return 'Use rua, número e cidade para calcular o frete.';
    }
    if (guestSearchQuery.trim()) {
      return 'Informe rua, número e cidade para calcular.';
    }
    return 'Informe rua, número e cidade para calcular.';
  }, [guestPlace, guestSearchQuery, isCustomer]);

  const loggedInWithoutAddress = isCustomer && !addressesLoading && addresses.length === 0;
  const loggedInWithoutCoords = isCustomer
    && !addressesLoading
    && addresses.length > 0
    && !selectedAddress;

  return {
    isCustomer,
    addresses,
    addressesLoading,
    selectedAddress,
    selectedAddressLine,
    selectAddress,
    guestPlace,
    guestSearchQuery,
    handleGuestPlaceSelected,
    handleGuestInputChange,
    guestHint,
    loggedInWithoutAddress,
    loggedInWithoutCoords,
    pickupOption,
    deliveryOptions,
    hasDeliveryFailure,
    deliveryError,
    isCalculating,
    hasCalculated,
    calculateFreight,
    handleAddressCreated,
    pharmacyPickupLine,
    pharmacyName: pharmacy?.name ?? null,
    deliveryAvailable,
    deliverableAddresses: addresses.filter(hasValidSavedAddressCoordinates),
  };
};
