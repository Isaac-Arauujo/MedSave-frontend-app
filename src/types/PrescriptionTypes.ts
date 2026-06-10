import type { PageResponse } from './CommonTypes';

export type PrescriptionReviewStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export type PharmacyPrescriptionTab = 'pending' | 'approved' | 'rejected' | 'all';

export interface PharmacyPrescriptionReviewSummary {
  reviewId: number;
  documentId: number;
  status: PrescriptionReviewStatus;
  customerName: string;
  productName: string;
  listingId: number;
  productId: number;
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
