export interface SavedProductResponse {
  id: number;
  listingId: number;
  productName: string;
  productImages: string[];
  discountPrice: number;
  originalPrice: number;
  pharmacyName: string;
  expirationDate: string;
  savedAt: string;
}
