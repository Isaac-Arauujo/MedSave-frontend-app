import { useCallback, useEffect, useState } from 'react';
import * as orderApi from '../api/orderApi';
import { CUSTOMER_ORDERS_PAGE_SIZE } from '../constants/orderListOptions';
import type { OrderListFilter, OrderSummaryResponse } from '../types/OrderTypes';
import { filterCustomerOrders } from '../utils/filterCustomerOrders';
import { handleApiError } from '../utils/handleApiError';

export const useCustomerOrders = () => {
  const [orders, setOrders] = useState<OrderSummaryResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filter, setFilter] = useState<OrderListFilter>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applyFilter = useCallback((nextFilter: OrderListFilter) => {
    setFilter(nextFilter);
    setCurrentPage(0);
  }, []);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await orderApi.getMyOrders({
        page: currentPage,
        size: CUSTOMER_ORDERS_PAGE_SIZE,
      });
      const filtered = filterCustomerOrders(response.content, filter);
      setOrders(filtered);
      setTotalPages(response.totalPages);
      setTotalElements(filter === 'ALL' ? response.totalElements : filtered.length);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filter]);

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await orderApi.getMyOrders({
          page: currentPage,
          size: CUSTOMER_ORDERS_PAGE_SIZE,
        });

        if (isMounted) {
          const filtered = filterCustomerOrders(response.content, filter);
          setOrders(filtered);
          setTotalPages(response.totalPages);
          setTotalElements(filter === 'ALL' ? response.totalElements : filtered.length);
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

    void loadOrders();

    return () => {
      isMounted = false;
    };
  }, [currentPage, filter]);

  return {
    orders,
    currentPage,
    totalPages,
    totalElements,
    filter,
    isLoading,
    error,
    setCurrentPage,
    applyFilter,
    refetch,
  };
};
