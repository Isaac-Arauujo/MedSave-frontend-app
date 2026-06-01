import type { PageResponse } from '../types/CommonTypes';
import type {
  CreateOrderRequest,
  GetMyOrdersParams,
  OrderDetailResponse,
  OrderResponse,
  OrderSummaryResponse,
} from '../types/OrderTypes';
import { api } from './axiosInstance';

export const createOrder = async (checkoutSessionToken: string): Promise<OrderResponse> => {
  const body: CreateOrderRequest = { checkoutSessionToken };
  const response = await api.post<OrderResponse>('/orders', body);
  return response.data;
};

export const getOrderDetail = async (id: number): Promise<OrderDetailResponse> => {
  const response = await api.get<OrderDetailResponse>(`/orders/${id}`);
  return response.data;
};

export const getMyOrders = async (
  params: GetMyOrdersParams
): Promise<PageResponse<OrderSummaryResponse>> => {
  const response = await api.get<PageResponse<OrderSummaryResponse>>('/orders/my', {
    params: {
      page: params.page,
      size: params.size,
    },
  });
  return response.data;
};
