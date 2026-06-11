import type { PageResponse } from './CommonTypes';

export type PrescriptionReviewStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export interface PrescriptionUploadResponse {
  documentId: number;
  reviewId: number;
  listingId: number;
  productId: number;
  status: PrescriptionReviewStatus;
  message: string;
}

export interface CustomerPrescriptionReview {
  documentId: number;
  reviewId: number;
  listingId: number;
  productId: number;
  productName: string;
  pharmacyName: string;
  status: PrescriptionReviewStatus;
  uploadedAt: string;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
}

export interface UploadPrescriptionParams {
  file: File;
  listingId: number;
  checkoutSessionToken?: string;
}

export interface GetMyPrescriptionsParams {
  listingId?: number;
  checkoutSessionToken?: string;
  status?: PrescriptionReviewStatus;
}

export interface PendingPrescriptionCheckout {
  reviewId: number;
  listingId: number;
  productId: number;
  productName: string;
  pharmacyName: string;
  prescriptionStatus: PrescriptionReviewStatus;
  rejectionReason?: string | null;
  uploadedAt: string;
  actionUrl: string;
}

export type PharmacyPrescriptionTab = 'pending' | 'approved' | 'rejected' | 'all';

export interface PharmacyPrescriptionReviewSummary {
  reviewId: number;
  documentId: number;
  status: PrescriptionReviewStatus;
  customerName: string;
  productName: string;
  listingId: number;
  productId: number;
  prescriptionType?: string;
  requiresOriginalPrescriptionAtPickup?: boolean;
  uploadedAt: string;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  mimeType: string;
  originalFileName: string;
}

export interface PharmacyPrescriptionReviewDetail extends PharmacyPrescriptionReviewSummary {
  responsibilityAcceptedAt?: string | null;
  reviewedByName?: string | null;
  fileSize?: number;
}

export interface GetPharmacyPrescriptionReviewsParams {
  page?: number;
  size?: number;
  status?: PrescriptionReviewStatus;
  allStatuses?: boolean;
  search?: string;
}

export interface PrescriptionReviewApproveRequest {
  responsibilityAccepted: boolean;
}

export interface PrescriptionReviewRejectRequest {
  responsibilityAccepted: boolean;
  reason: string;
}

export type PharmacyPrescriptionReviewPage = PageResponse<PharmacyPrescriptionReviewSummary>;
