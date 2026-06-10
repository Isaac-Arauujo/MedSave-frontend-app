import type { CartItemResponse, PrescriptionRequirementStatus } from '../types/CartTypes';

export const BLOCKING_PRESCRIPTION_STATUSES: PrescriptionRequirementStatus[] = [
  'REQUIRED_NOT_UPLOADED',
  'PENDING',
  'UNDER_REVIEW',
  'REJECTED',
];

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
