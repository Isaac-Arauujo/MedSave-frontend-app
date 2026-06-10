import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as adminApi from '../api/adminApi';
import type {
  AdminOrderCancelRequest,
  AdminOrderDetailResponse,
  AdminOrderListParams,
  AdminOrderNoteRequest,
  AdminOrderStatusAction,
  AdminOrderStatusRequest,
  AdminOrderSummaryResponse,
} from '../types/AdminOrderTypes';
import type { OrderStatus } from '../types/OrderTypes';
import { handleApiError } from '../utils/handleApiError';

const PAGE_SIZE = 10;

export const useAdminOrders = () => {
  const [orders, setOrders] = useState<AdminOrderSummaryResponse[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderDetailResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params: AdminOrderListParams = {
        page: currentPage,
        size: PAGE_SIZE,
        search: search || undefined,
        status: statusFilter || undefined,
      };

      const response = await adminApi.getAdminOrders(params);
      setOrders(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, search, statusFilter]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const applySearch = useCallback((value: string) => {
    setSearch(value.trim());
    setCurrentPage(0);
  }, []);

  const applyStatusFilter = useCallback((value: OrderStatus | '') => {
    setStatusFilter(value);
    setCurrentPage(0);
  }, []);

  const loadOrderDetail = useCallback(async (orderId: number) => {
    try {
      setIsDetailLoading(true);
      setError(null);
      const detail = await adminApi.getAdminOrder(orderId);
      setSelectedOrder(detail);
      return detail;
    } catch (err) {
      const message = handleApiError(err);
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  const cancelOrder = useCallback(
    async (orderId: number, data: AdminOrderCancelRequest) => {
      try {
        setIsSubmitting(true);
        const response = await adminApi.cancelAdminOrder(orderId, data);
        toast.success('Pedido cancelado com sucesso.');
        if (response.refundStatus === 'PENDING' || response.refundStatus === 'REFUNDED') {
          toast.success('Estorno solicitado automaticamente.');
        }
        if (response.refundStatus === 'FAILED') {
          toast.error('Pedido cancelado, mas o estorno precisa de acompanhamento manual.');
        }
        await refetch();
        if (selectedOrder?.id === orderId) {
          await loadOrderDetail(orderId);
        }
        return response;
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadOrderDetail, refetch, selectedOrder?.id]
  );

  const applyStatusAction = useCallback(
    async (orderId: number, action: AdminOrderStatusAction, reason: string) => {
      try {
        setIsSubmitting(true);
        const payload: AdminOrderStatusRequest = { action, reason };
        const detail = await adminApi.updateAdminOrderStatus(orderId, payload);
        toast.success('Pedido atualizado com sucesso.');
        setSelectedOrder(detail);
        await refetch();
        return detail;
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [refetch]
  );

  const addInternalNote = useCallback(
    async (orderId: number, data: AdminOrderNoteRequest) => {
      try {
        setIsSubmitting(true);
        await adminApi.addAdminOrderNote(orderId, data);
        toast.success('Observação adicionada com sucesso.');
        await loadOrderDetail(orderId);
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadOrderDetail]
  );

  const resendEmail = useCallback(
    async (orderId: number) => {
      try {
        setIsSubmitting(true);
        await adminApi.resendAdminOrderEmail(orderId);
        toast.success('E-mail reenviado com sucesso.');
      } catch (err) {
        toast.error(handleApiError(err));
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  return {
    orders,
    selectedOrder,
    currentPage,
    totalPages,
    search,
    statusFilter,
    isLoading,
    isDetailLoading,
    isSubmitting,
    error,
    setCurrentPage,
    applySearch,
    applyStatusFilter,
    loadOrderDetail,
    setSelectedOrder,
    cancelOrder,
    applyStatusAction,
    addInternalNote,
    resendEmail,
    refetch,
  };
};
