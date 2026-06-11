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
  batchNumber?: string;
  availableStock: number;
  active: boolean;
}

export interface CreateListingRequest {
  productId: number;
  batchNumber: string;
  originalPrice: number;
  discountPrice: number;
  expirationDate: string;
  stock: number;
}

export interface UpdateListingRequest {
  batchNumber?: string;
  originalPrice?: number;
  discountPrice?: number;
  expirationDate?: string;
  stock?: number;
  active?: boolean;
}
