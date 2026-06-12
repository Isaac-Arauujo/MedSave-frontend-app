export type ProductCatalogRequestStatus = 'PENDING' | 'RESOLVED' | 'REJECTED';

export type ProductCatalogRequestSource = 'CSV_IMPORT' | 'MANUAL_PHARMACY_SEARCH';

export interface ProductCatalogRequestResponse {
  id: number;
  ean: string;
  productNameSnapshot?: string | null;
  manufacturerSnapshot?: string | null;
  pharmacyId: number;
  pharmacyName: string;
  source: ProductCatalogRequestSource;
  status: ProductCatalogRequestStatus;
  originalPrice?: number | null;
  discountPrice?: number | null;
  stock?: number | null;
  expirationDate?: string | null;
  batchNumber?: string | null;
  importLineNumber?: number | null;
  resolvedProductId?: number | null;
  resolvedProductName?: string | null;
  rejectionReason?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResolveProductCatalogRequestPayload {
  productId: number;
}

export interface RejectProductCatalogRequestPayload {
  reason: string;
}

export interface AdminProductCatalogRequestListParams {
  page?: number;
  size?: number;
  status?: ProductCatalogRequestStatus;
  search?: string;
}
