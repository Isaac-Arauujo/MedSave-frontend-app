import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as prescriptionApi from '../api/prescriptionApi';
import type {
  GetPharmacyPrescriptionReviewsParams,
  PharmacyPrescriptionReviewDetail,
  PharmacyPrescriptionReviewSummary,
  PharmacyPrescriptionTab,
} from '../types/PrescriptionTypes';
import { handleApiError } from '../utils/handleApiError';

const PAGE_SIZE = 10;

export const usePharmacyPrescriptions = () => {
  const [activeTab, setActiveTab] = useState<PharmacyPrescriptionTab>('pending');
  const [currentPage, setCurrentPage] = useState(0);
  const [reviews, setReviews] = useState<PharmacyPrescriptionReviewSummary[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<PharmacyPrescriptionReviewDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const buildParams = useCallback((): GetPharmacyPrescriptionReviewsParams => {
    const params: GetPharmacyPrescriptionReviewsParams = {
      page: currentPage,
      size: PAGE_SIZE,
    };

    if (activeTab === 'approved') {
      params.status = 'APPROVED';
    } else if (activeTab === 'rejected') {
      params.status = 'REJECTED';
    } else if (activeTab === 'all') {
      params.allStatuses = true;
    }

    return params;
  }, [activeTab, currentPage]);

  const loadReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await prescriptionApi.getPharmacyPrescriptionReviews(buildParams());
      setReviews(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const changeTab = useCallback((tab: PharmacyPrescriptionTab) => {
    setActiveTab(tab);
    setCurrentPage(0);
  }, []);

  const openReview = useCallback(async (reviewId: number) => {
    try {
      setIsDetailLoading(true);
      const detail = await prescriptionApi.getPharmacyPrescriptionReview(reviewId);
      setSelectedReview(detail);
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  const closeReview = useCallback(() => {
    setSelectedReview(null);
  }, []);

  const approveReview = useCallback(
    async (reviewId: number) => {
      try {
        setIsSubmitting(true);
        await prescriptionApi.approvePharmacyPrescriptionReview(reviewId, {
          responsibilityAccepted: true,
        });
        toast.success('Receita aprovada com sucesso.');
        setSelectedReview(null);
        await loadReviews();
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadReviews]
  );

  const rejectReview = useCallback(
    async (reviewId: number, reason: string) => {
      try {
        setIsSubmitting(true);
        await prescriptionApi.rejectPharmacyPrescriptionReview(reviewId, {
          responsibilityAccepted: true,
          reason,
        });
        toast.success('Receita recusada com sucesso.');
        setSelectedReview(null);
        await loadReviews();
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadReviews]
  );

  return {
    activeTab,
    currentPage,
    reviews,
    totalPages,
    totalElements,
    isLoading,
    isSubmitting,
    isDetailLoading,
    error,
    selectedReview,
    setCurrentPage,
    changeTab,
    openReview,
    closeReview,
    approveReview,
    rejectReview,
    refetch: loadReviews,
  };
};
