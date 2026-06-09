import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as pharmacyApi from '../api/pharmacyApi';
import type { OrderStatus } from '../types/OrderTypes';
import type {
  CancelPharmacyOrderRequest,
  GetPharmacyOrdersParams,
  OrderStatusTransitionRequest,
  PharmacyOrdersTab,
  PickupOrderResponse,
  UpdatePharmacyDeliveryRequest,
} from '../types/PharmacyOrderTypes';
import { isDeliveryOrder } from '../types/PharmacyOrderTypes';
import type { OrderSummaryResponse } from '../types/OrderTypes';
import { handleApiError } from '../utils/handleApiError';

const PAGE_SIZE = 10;

export const usePharmacyOrders = () => {
  const [activeTab, setActiveTab] = useState<PharmacyOrdersTab>('all');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [currentPage, setCurrentPage] = useState(0);
  const [orders, setOrders] = useState<OrderSummaryResponse[]>([]);
  const [pickupOrders, setPickupOrders] = useState<PickupOrderResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (activeTab === 'pickups') {
        const response = await pharmacyApi.getPickupOrders({
          page: currentPage,
          size: PAGE_SIZE,
        });
        setPickupOrders(response.content);
        setOrders([]);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
        return;
      }

      const params: GetPharmacyOrdersParams = {
        page: currentPage,
        size: PAGE_SIZE,
        status: statusFilter || undefined,
      };
      const response = await pharmacyApi.getPharmacyOrders(params);
      const content =
        activeTab === 'deliveries'
          ? response.content.filter((order) => isDeliveryOrder(order.deliveryType))
          : response.content;

      setOrders(content);
      setPickupOrders([]);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, currentPage, statusFilter]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const changeTab = useCallback((tab: PharmacyOrdersTab) => {
    setActiveTab(tab);
    setCurrentPage(0);
    if (tab !== 'all') {
      setStatusFilter('');
    }
  }, []);

  const applyStatusFilter = useCallback((status: OrderStatus | '') => {
    setStatusFilter(status);
    setCurrentPage(0);
  }, []);

  const updateOrderStatus = useCallback(
    async (orderId: number, data: OrderStatusTransitionRequest) => {
      try {
        setIsSubmitting(true);
        await pharmacyApi.updateOrderStatus(orderId, data);
        toast.success('Status do pedido atualizado.');
        await loadOrders();
      } catch (err) {
        const message = handleApiError(err);
        toast.error(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadOrders]
  );

  const cancelOrder = useCallback(
    async (orderId: number, data: CancelPharmacyOrderRequest) => {
      try {
        setIsSubmitting(true);
        await pharmacyApi.cancelOrder(orderId, data);
        toast.success('Pedido cancelado com sucesso. O cliente será notificado.');
        await loadOrders();
      } catch (err) {
        const message = handleApiError(err);
        toast.error(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadOrders]
  );

  const updateOrderDelivery = useCallback(
    async (orderId: number, data: UpdatePharmacyDeliveryRequest) => {
      try {
        setIsSubmitting(true);
        await pharmacyApi.updateDelivery(orderId, data);
        toast.success('Informações de entrega atualizadas.');
        await loadOrders();
      } catch (err) {
        const message = handleApiError(err);
        toast.error(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadOrders]
  );

  return {
    activeTab,
    statusFilter,
    currentPage,
    orders,
    pickupOrders,
    totalPages,
    totalElements,
    isLoading,
    isSubmitting,
    error,
    setCurrentPage,
    changeTab,
    applyStatusFilter,
    updateOrderStatus,
    cancelOrder,
    updateOrderDelivery,
    refetch: loadOrders,
  };
};
