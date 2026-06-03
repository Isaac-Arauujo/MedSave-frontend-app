import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import * as checkoutApi from '../api/checkoutApi';
import * as orderApi from '../api/orderApi';
import { useCartStore } from '../store/cartStore';
import { useCheckoutStore } from '../store/checkoutStore';
import type {
  CheckoutStep,
  DeliveryType,
  PaymentMethod,
  UpdateDeliveryRequest,
  UpdatePickupPersonRequest,
} from '../types/CheckoutTypes';
import type { OrderResponse } from '../types/OrderTypes';
import type { FreightResult } from '../types/FreightTypes';
import type { AddressResponse } from '../types/AddressTypes';
import type { CartResponse } from '../types/CartTypes';
import { formatAddressLine, formatCartPharmacyLine } from '../utils/formatAddress';
import { handleApiError } from '../utils/handleApiError';
import { parseOrderCreationError } from '../utils/parseOrderCreationError';

export interface FreightContext {
  cart?: Pick<
    CartResponse,
    | 'pharmacyName'
    | 'pharmacyStreet'
    | 'pharmacyNumber'
    | 'pharmacyNeighborhood'
    | 'pharmacyCity'
    | 'pharmacyState'
    | 'pharmacyZipCode'
    | 'pharmacyPhone'
    | 'pharmacyLatitude'
    | 'pharmacyLongitude'
  >;
  selectedAddress?: AddressResponse;
  recipientName?: string;
  recipientPhone?: string;
}

const DELIVERY_TYPES: DeliveryType[] = ['PICKUP', 'RAPID', 'SCHEDULED', 'NORMAL'];

const PICKUP_FREIGHT: FreightResult = {
  price: 0,
  estimateLabel: 'Retirada na farmácia',
  estimateDays: 0,
};

export interface DeliveryOption {
  deliveryType: DeliveryType;
  freight: FreightResult;
}

export const useCheckout = () => {
  const session = useCheckoutStore((state) => state.session);
  const currentStep = useCheckoutStore((state) => state.currentStep);
  const selectedDeliveryType = useCheckoutStore((state) => state.selectedDeliveryType);
  const selectedFreight = useCheckoutStore((state) => state.selectedFreight);
  const setSession = useCheckoutStore((state) => state.setSession);
  const setStep = useCheckoutStore((state) => state.setStep);
  const setSelectedDelivery = useCheckoutStore((state) => state.setSelectedDelivery);
  const clearSession = useCheckoutStore((state) => state.clearSession);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFreightLoading, setIsFreightLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [freightError, setFreightError] = useState<string | null>(null);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);

  const initializeSession = useCallback(async () => {
    if (session) {
      try {
        setIsLoading(true);
        setError(null);
        const refreshed = await checkoutApi.getSession(session.sessionToken);
        setSession(refreshed);
        return refreshed;
      } catch (err) {
        const status = (err as { response?: { status?: number } }).response?.status;
        if (status === 400 || status === 401) {
          clearSession();
        }
        setError(handleApiError(err));
        return null;
      } finally {
        setIsLoading(false);
      }
    }

    try {
      setIsLoading(true);
      setError(null);
      const created = await checkoutApi.createSession();
      setSession(created);
      setStep('delivery');
      return created;
    } catch (err) {
      setError(handleApiError(err));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session, setSession, setStep, clearSession]);

  const calculateAllDeliveryOptions = useCallback(
    async (originZip: string, destinationZip: string, freightContext?: FreightContext) => {
      const normalizedOrigin = originZip.replace(/\D/g, '');
      const normalizedDestination = destinationZip.replace(/\D/g, '');

      if (normalizedDestination.length !== 8) {
        const pickupOnly: DeliveryOption[] = [{ deliveryType: 'PICKUP', freight: PICKUP_FREIGHT }];
        setDeliveryOptions(pickupOnly);
        return pickupOnly;
      }

      const hasCoordinateQuote =
        freightContext?.cart?.pharmacyLatitude != null
        && freightContext?.cart?.pharmacyLongitude != null
        && freightContext?.selectedAddress?.latitude != null
        && freightContext?.selectedAddress?.longitude != null
        && Boolean(freightContext.cart?.pharmacyZipCode);

      try {
        setIsFreightLoading(true);
        setFreightError(null);
        const options: DeliveryOption[] = [];

        for (const deliveryType of DELIVERY_TYPES) {
          if (deliveryType === 'PICKUP') {
            options.push({ deliveryType, freight: PICKUP_FREIGHT });
            continue;
          }

          if (normalizedOrigin.length !== 8) {
            continue;
          }

          const freight = await checkoutApi.calculateFreight({
            originZip: normalizedOrigin,
            destinationZip: normalizedDestination,
            deliveryType,
            ...(hasCoordinateQuote && freightContext?.cart && freightContext.selectedAddress
              ? {
                  originLatitude: freightContext.cart.pharmacyLatitude,
                  originLongitude: freightContext.cart.pharmacyLongitude,
                  originAddress: formatCartPharmacyLine(freightContext.cart),
                  originContactName: freightContext.cart.pharmacyName,
                  originPhone: freightContext.cart.pharmacyPhone,
                  destinationLatitude: freightContext.selectedAddress.latitude,
                  destinationLongitude: freightContext.selectedAddress.longitude,
                  destinationAddress: formatAddressLine(freightContext.selectedAddress),
                  recipientName: freightContext.recipientName,
                  recipientPhone: freightContext.recipientPhone,
                }
              : {}),
          });
          options.push({ deliveryType, freight });
        }

        if (options.length === 1 && options[0]?.deliveryType === 'PICKUP') {
          setFreightError('CEP da farmácia indisponível para calcular frete.');
        }

        setDeliveryOptions(options);
        return options;
      } catch (err) {
        const message = handleApiError(err);
        setFreightError(message);
        throw err;
      } finally {
        setIsFreightLoading(false);
      }
    },
    []
  );

  const selectDeliveryOption = useCallback(
    (deliveryType: DeliveryType, freight: FreightResult) => {
      setSelectedDelivery(deliveryType, freight);
    },
    [setSelectedDelivery]
  );

  const submitDelivery = useCallback(
    async (data: UpdateDeliveryRequest, pickupPerson?: UpdatePickupPersonRequest) => {
      if (!session) {
        return;
      }

      try {
        setIsSubmitting(true);
        setError(null);

        if (data.deliveryType === 'PICKUP' && pickupPerson) {
          const withPickup = await checkoutApi.updatePickupPerson(session.sessionToken, pickupPerson);
          setSession(withPickup);
        }

        const updated = await checkoutApi.updateDelivery(session.sessionToken, data);
        setSession(updated);
        setStep('payment');
        toast.success('Entrega configurada.');
      } catch (err) {
        const message = handleApiError(err);
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [session, setSession, setStep]
  );

  const submitPayment = useCallback(
    async (paymentMethod: PaymentMethod) => {
      if (!session) {
        return;
      }

      try {
        setIsSubmitting(true);
        setError(null);
        const updated = await checkoutApi.updatePayment(session.sessionToken, { paymentMethod });
        setSession(updated);
        setStep('review');
        toast.success('Pagamento configurado.');
      } catch (err) {
        const message = handleApiError(err);
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [session, setSession, setStep]
  );

  const placeOrder = useCallback(async (): Promise<OrderResponse> => {
    if (!session) {
      throw new Error('Sessão de checkout não encontrada.');
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const order = await orderApi.createOrder(session.sessionToken);
      clearSession();
      useCartStore.getState().clearCart();
      toast.success('Pedido realizado com sucesso.');
      return order;
    } catch (err) {
      const parsed = parseOrderCreationError(err);
      setError(parsed.message);

      if (parsed.code === 'generic') {
        toast.error(parsed.message);
      }

      throw parsed;
    } finally {
      setIsSubmitting(false);
    }
  }, [session, clearSession]);
  const goToStep = useCallback(
    (step: CheckoutStep) => {
      setStep(step);
    },
    [setStep]
  );

  return {
    session,
    currentStep,
    selectedDeliveryType,
    selectedFreight,
    isLoading,
    isSubmitting,
    isFreightLoading,
    error,
    freightError,
    deliveryOptions,
    initializeSession,
    calculateAllDeliveryOptions,
    selectDeliveryOption,
    submitDelivery,
    submitPayment,
    placeOrder,
    goToStep,
    clearSession,
  };
};
