export interface ListingProductSummary {
  id: number;
  name: string;
  images: string[];
}

export interface ListingPharmacySummary {
  id: number;
  name: string;
  city: string;
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
