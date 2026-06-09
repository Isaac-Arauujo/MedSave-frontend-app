import type { ListingResponse } from './ListingTypes';

export interface ListingRecommendationsResponse {
  similarProducts: ListingResponse[];
  samePharmacyProducts: ListingResponse[];
}
