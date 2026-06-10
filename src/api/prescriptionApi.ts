import type {
  GetPharmacyPrescriptionReviewsParams,
  PharmacyPrescriptionReviewDetail,
  PharmacyPrescriptionReviewPage,
  PrescriptionReviewApproveRequest,
  PrescriptionReviewRejectRequest,
} from '../types/PrescriptionTypes';
import { api } from './axiosInstance';

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
