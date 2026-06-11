import type {
  CustomerPrescriptionReview,
  GetMyPrescriptionsParams,
  GetPharmacyPrescriptionReviewsParams,
  PharmacyPrescriptionReviewDetail,
  PharmacyPrescriptionReviewPage,
  PrescriptionReviewApproveRequest,
  PrescriptionReviewRejectRequest,
  PrescriptionUploadResponse,
  PendingPrescriptionCheckout,
  UploadPrescriptionParams,
} from '../types/PrescriptionTypes';
import { api } from './axiosInstance';

export const uploadPrescription = async ({
  file,
  listingId,
  checkoutSessionToken,
}: UploadPrescriptionParams): Promise<PrescriptionUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('listingId', String(listingId));
  if (checkoutSessionToken) {
    formData.append('checkoutSessionToken', checkoutSessionToken);
  }

  const response = await api.post<PrescriptionUploadResponse>('/prescriptions', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getMyPrescriptions = async (
  params: GetMyPrescriptionsParams = {}
): Promise<CustomerPrescriptionReview[]> => {
  const response = await api.get<CustomerPrescriptionReview[]>('/prescriptions/my', { params });
  return response.data;
};

export const getPendingPrescriptionCheckouts = async (): Promise<PendingPrescriptionCheckout[]> => {
  const response = await api.get<PendingPrescriptionCheckout[]>('/me/pending-prescription-checkouts');
  return response.data;
};

export const getPharmacyPrescriptionReviews = async (
  params: GetPharmacyPrescriptionReviewsParams = {}
): Promise<PharmacyPrescriptionReviewPage> => {
  const response = await api.get<PharmacyPrescriptionReviewPage>('/pharmacy/prescription-reviews', {
    params,
  });
  return response.data;
};

export const getPharmacyPrescriptionReview = async (
  reviewId: number
): Promise<PharmacyPrescriptionReviewDetail> => {
  const response = await api.get<PharmacyPrescriptionReviewDetail>(
    `/pharmacy/prescription-reviews/${reviewId}`
  );
  return response.data;
};

export const approvePharmacyPrescriptionReview = async (
  reviewId: number,
  data: PrescriptionReviewApproveRequest
): Promise<PharmacyPrescriptionReviewDetail> => {
  const response = await api.post<PharmacyPrescriptionReviewDetail>(
    `/pharmacy/prescription-reviews/${reviewId}/approve`,
    data
  );
  return response.data;
};

export const rejectPharmacyPrescriptionReview = async (
  reviewId: number,
  data: PrescriptionReviewRejectRequest
): Promise<PharmacyPrescriptionReviewDetail> => {
  const response = await api.post<PharmacyPrescriptionReviewDetail>(
    `/pharmacy/prescription-reviews/${reviewId}/reject`,
    data
  );
  return response.data;
};

export const getPrescriptionFileBlob = async (documentId: number): Promise<Blob> => {
  const response = await api.get<Blob>(`/prescriptions/${documentId}/file`, {
    responseType: 'blob',
  });
  return response.data;
};

export const downloadPrescriptionFile = async (documentId: number): Promise<Blob> => {
  const response = await api.get<Blob>(`/prescriptions/${documentId}/download`, {
    responseType: 'blob',
  });
  return response.data;
};
