import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as adminApi from '../api/adminApi';
import type { PharmacyResponse, PharmacyStatus } from '../types/PharmacyTypes';
import { handleApiError } from '../utils/handleApiError';

const PAGE_SIZE = 10;

export const useAdminPharmacies = () => {
  const [pharmacies, setPharmacies] = useState<PharmacyResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState<PharmacyStatus | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyResponse | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminApi.getPharmacies({
        page: currentPage,
        size: PAGE_SIZE,
        status: statusFilter || undefined,
      });
      setPharmacies(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    let isMounted = true;

    const loadPharmacies = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await adminApi.getPharmacies({
          page: currentPage,
          size: PAGE_SIZE,
          status: statusFilter || undefined,
        });

        if (isMounted) {
          setPharmacies(response.content);
          setTotalPages(response.totalPages);
        }
      } catch (err) {
        if (isMounted) {
          setError(handleApiError(err));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadPharmacies();

    return () => {
      isMounted = false;
    };
  }, [currentPage, statusFilter]);

  const loadPharmacyDetails = useCallback(async (id: number) => {
    try {
      setIsDetailLoading(true);
      setError(null);
      const pharmacy = await adminApi.getPharmacy(id);
      setSelectedPharmacy(pharmacy);
    } catch (err) {
      const message = handleApiError(err);
      setError(message);
      toast.error(message);
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  const approvePharmacy = useCallback(
    async (id: number) => {
      try {
        setIsActionLoading(true);
        setError(null);
        await adminApi.approvePharmacy(id);
        toast.success('Farmácia aprovada com sucesso.');
        setSelectedPharmacy(null);
        await refetch();
      } catch (err) {
        const message = handleApiError(err);
        setError(message);
        toast.error(message);
      } finally {
        setIsActionLoading(false);
      }
    },
    [refetch]
  );

  const suspendPharmacy = useCallback(
    async (id: number) => {
      try {
        setIsActionLoading(true);
        setError(null);
        await adminApi.suspendPharmacy(id);
        toast.success('Farmácia suspensa com sucesso.');
        setSelectedPharmacy(null);
        await refetch();
      } catch (err) {
        const message = handleApiError(err);
        setError(message);
        toast.error(message);
      } finally {
        setIsActionLoading(false);
      }
    },
    [refetch]
  );

  const handleStatusFilterChange = useCallback((status: PharmacyStatus | '') => {
    setStatusFilter(status);
    setCurrentPage(0);
  }, []);

  const closeDetails = useCallback(() => {
    setSelectedPharmacy(null);
  }, []);

  return {
    pharmacies,
    currentPage,
    totalPages,
    statusFilter,
    isLoading,
    error,
    selectedPharmacy,
    isDetailLoading,
    isActionLoading,
    setCurrentPage,
    setStatusFilter: handleStatusFilterChange,
    loadPharmacyDetails,
    approvePharmacy,
    suspendPharmacy,
    closeDetails,
    refetch,
  };
};
