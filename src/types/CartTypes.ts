export type PrescriptionRequirementStatus =
  | 'NOT_REQUIRED'
  | 'REQUIRED_NOT_UPLOADED'
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

export type PrescriptionType =
  | 'NONE'
  | 'SIMPLE'
  | 'RETAINED'
  | 'ANTIBIOTIC'
  | 'CONTROLLED_C1'
  | 'CONTROLLED_C5'
  | 'CONTROLLED_OTHER';

export interface CartItemResponse {
  itemId: number;
  listingId: number;
  productName: string;
  firstImage?: string;
  quantity: number;
  unitPrice: number;
  itemSubtotal: number;
  requiresPrescription?: boolean;
  prescriptionType?: PrescriptionType;
  requiresPharmacistReview?: boolean;
  prescriptionStatus?: PrescriptionRequirementStatus;
  prescriptionReviewId?: number;
  prescriptionRejectionReason?: string;
  allowOnlineSale?: boolean;
  allowDeliveryWithPrescription?: boolean;
  allowPickupWithPrescription?: boolean;
  requiresOriginalPrescriptionAtPickup?: boolean;
  deliveryBlockedForPrescription?: boolean;
  pickupRequiredForPrescription?: boolean;
  onlineSaleBlocked?: boolean;
  prescriptionFulfillmentMessage?: string | null;
}

export interface CartItemSummary {
  itemId: number;
  listingId: number;
  productName: string;
  firstImage?: string;
  quantity: number;
  unitPrice: number;
  itemSubtotal: number;
}

export interface CartResponse {
  cartId: number;
  pharmacyName?: string;
  pharmacyStreet?: string;
  pharmacyNumber?: string;
  pharmacyNeighborhood?: string;
  pharmacyCity?: string;
  pharmacyState?: string;
  pharmacyZipCode?: string;
  pharmacyPhone?: string;
  pharmacyLatitude?: number;
  pharmacyLongitude?: number;
  items: CartItemResponse[];
  subtotal: number;
  discount: number;
  total: number;
  couponCode?: string;
}

export interface CartSummaryResponse {
  cartId: number;
  pharmacyName?: string;
  pharmacyCity?: string;
  items: CartItemSummary[];
  totalItems: number;
  subtotal: number;
  discount: number;
  total: number;
  couponCode?: string;
}

export interface AddCartItemRequest {
  listingId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface PharmacyConflictState {
  listingId: number;
  quantity: number;
  pharmacyId?: number;
  pharmacyName?: string;
  currentPharmacyName: string;
  incomingPharmacyName?: string;
  source: 'add' | 'anonymous' | 'merge';
}

export interface MergeCartItemRequest {
  listingId: number;
  quantity: number;
}

export interface MergeCartRequest {
  items: MergeCartItemRequest[];
}

export interface MergedCartItemResult {
  listingId: number;
  quantity: number;
  status: 'MERGED';
}

export interface RejectedCartItemResult {
  listingId: number;
  quantity: number;
  reason: string;
  message: string;
}

export interface MergeCartResponse {
  cart: CartResponse;
  mergedItems: MergedCartItemResult[];
  rejectedItems: RejectedCartItemResult[];
  warnings: string[];
}

export interface OnePharmacyCartConflictResponse {
  code: 'ONE_PHARMACY_CONFLICT';
  message: string;
  currentPharmacyName: string;
  incomingPharmacyName: string;
}

export interface AnonymousCartDisplayItem {
  listingId: number;
  productName: string;
  firstImage?: string;
  quantity: number;
  unitPrice: number;
  itemSubtotal: number;
  maxQuantity: number;
  pharmacyName?: string;
  pharmacyCity?: string;
}

export interface AnonymousCartDisplay {
  items: AnonymousCartDisplayItem[];
  pharmacyName?: string;
  pharmacyCity?: string;
  subtotal: number;
  total: number;
  itemCount: number;
}
