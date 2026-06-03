export interface CartItemResponse {
  itemId: number;
  listingId: number;
  productName: string;
  firstImage?: string;
  quantity: number;
  unitPrice: number;
  itemSubtotal: number;
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
  currentPharmacyName: string;
}
