import type { CartItemResponse, PrescriptionRequirementStatus } from '../types/CartTypes';

export const BLOCKING_PRESCRIPTION_STATUSES: PrescriptionRequirementStatus[] = [
  'REQUIRED_NOT_UPLOADED',
  'PENDING',
  'UNDER_REVIEW',
  'REJECTED',
];

export const ORIGINAL_PRESCRIPTION_PICKUP_MESSAGE =
  'Este medicamento exige conferência da receita original na farmácia. Para continuar, escolha retirada na farmácia.';

export const ONLINE_SALE_BLOCKED_MESSAGE =
  'Este medicamento não está disponível para compra online no MediSave.';

export const itemRequiresPrescription = (item: CartItemResponse): boolean =>
  item.requiresPrescription === true ||
  item.requiresPharmacistReview === true ||
  (item.prescriptionStatus != null && item.prescriptionStatus !== 'NOT_REQUIRED');

export const isPrescriptionBlocking = (
  status?: PrescriptionRequirementStatus
): boolean => status != null && BLOCKING_PRESCRIPTION_STATUSES.includes(status);

export const cartHasBlockingPrescriptions = (items: CartItemResponse[]): boolean =>
  items.some((item) => itemRequiresPrescription(item) && isPrescriptionBlocking(item.prescriptionStatus));

export const getPrescriptionItems = (items: CartItemResponse[]): CartItemResponse[] =>
  items.filter(itemRequiresPrescription);

export const isOnlineSaleBlocked = (item: CartItemResponse): boolean => item.onlineSaleBlocked === true;

export const isDeliveryBlockedForPrescription = (item: CartItemResponse): boolean =>
  item.deliveryBlockedForPrescription === true;

export const isPickupRequiredForPrescription = (item: CartItemResponse): boolean =>
  item.pickupRequiredForPrescription === true;

export const cartHasOnlineSaleBlocked = (items: CartItemResponse[]): boolean =>
  items.some(isOnlineSaleBlocked);

export const cartRequiresPickupForPrescription = (items: CartItemResponse[]): boolean =>
  items.some(isPickupRequiredForPrescription);

export const cartBlocksDeliveryForPrescription = (items: CartItemResponse[]): boolean =>
  items.some(isDeliveryBlockedForPrescription);

export const getFulfillmentMessage = (item: CartItemResponse): string | null =>
  item.prescriptionFulfillmentMessage ?? null;
