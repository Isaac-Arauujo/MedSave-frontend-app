import { create } from 'zustand';
import type { CheckoutSessionResponse, CheckoutStep, DeliveryType } from '../types/CheckoutTypes';
import type { FreightResult } from '../types/FreightTypes';

interface CheckoutState {
  session: CheckoutSessionResponse | null;
  currentStep: CheckoutStep;
  selectedDeliveryType: DeliveryType | null;
  selectedFreight: FreightResult | null;
  setSession: (session: CheckoutSessionResponse) => void;
  setStep: (step: CheckoutStep) => void;
  setSelectedDelivery: (deliveryType: DeliveryType, freight: FreightResult) => void;
  clearSession: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  session: null,
  currentStep: 'delivery',
  selectedDeliveryType: null,
  selectedFreight: null,
  setSession: (session) => set({ session }),
  setStep: (step) => set({ currentStep: step }),
  setSelectedDelivery: (deliveryType, freight) =>
    set({ selectedDeliveryType: deliveryType, selectedFreight: freight }),
  clearSession: () =>
    set({
      session: null,
      currentStep: 'delivery',
      selectedDeliveryType: null,
      selectedFreight: null,
    }),
}));
