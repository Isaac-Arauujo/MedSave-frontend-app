export interface ListingProductSummary {
  id: number;
  name: string;
  activeIngredient?: string;
  category?: import('./ProductTypes').ProductCategory;
  requiresPrescription?: boolean;
  images: string[];
}

export interface ListingPharmacySummary {
  id: number;
  name: string;
  city: string;
  state?: string;
  neighborhood?: string;
  addressSummary?: string;
  deliveryAvailable?: boolean;
  pickupAvailable?: boolean;
}

export interface ListingResponse {
  id: number;
  product: ListingProductSummary;
  pharmacy: ListingPharmacySummary;
  originalPrice: number;
  discountPrice: number;
  discountPercent: number;
  expirationDate: string;
  availableStock: number;
  active: boolean;
}

export interface CreateListingRequest {
  productId: number;
  originalPrice: number;
  discountPrice: number;
  expirationDate: string;
  stock: number;
}

export interface UpdateListingRequest {
  originalPrice?: number;
  discountPrice?: number;
  expirationDate?: string;
  stock?: number;
  active?: boolean;
}
