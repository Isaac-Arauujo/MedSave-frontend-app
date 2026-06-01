import type { PageResponse } from '../types/CommonTypes';
import type { DeliveryResponse, OrderSummaryResponse } from '../types/OrderTypes';
import type {
  GetPharmacyOrdersParams,
  GetPickupOrdersParams,
  OrderStatusTransitionRequest,
  PickupOrderResponse,
  UpdatePharmacyDeliveryRequest,
} from '../types/PharmacyOrderTypes';
import type {
  PharmacyNearbyResponse,
  PharmacyRegisterRequest,
  PharmacyResponse,
  UpdatePharmacyRequest,
} from '../types/PharmacyTypes';
import { api } from './axiosInstance';
export const registerPharmacy = async (
  data: PharmacyRegisterRequest
): Promise<PharmacyResponse> => {
  const response = await api.post<PharmacyResponse>('/pharmacy/register', data);
  return response.data;
};

export const getMyPharmacy = async (): Promise<PharmacyResponse> => {
  const response = await api.get<PharmacyResponse>('/pharmacy/me');
  return response.data;
};

export const updateMyPharmacy = async (
  data: UpdatePharmacyRequest
): Promise<PharmacyResponse> => {
  const response = await api.put<PharmacyResponse>('/pharmacy/me', data);
  return response.data;
};

export const getNearbyPharmacies = async (
  lat: number,
  lng: number,
  radius?: number
): Promise<PharmacyNearbyResponse[]> => {
  const response = await api.get<PharmacyNearbyResponse[]>('/pharmacies/nearby', {
    params: { lat, lng, radius },
  });
  return response.data;
};

export const getPharmacyOrders = async (
  params: GetPharmacyOrdersParams = {}
): Promise<PageResponse<OrderSummaryResponse>> => {
  const response = await api.get<PageResponse<OrderSummaryResponse>>('/pharmacy/orders', {
    params,
  });
  return response.data;
};

export const getPickupOrders = async (
  params: GetPickupOrdersParams = {}
): Promise<PageResponse<PickupOrderResponse>> => {
  const response = await api.get<PageResponse<PickupOrderResponse>>('/pharmacy/orders/pickups', {
    params,
  });
  return response.data;
};

export const updateOrderStatus = async (
  orderId: number,
  data: OrderStatusTransitionRequest
): Promise<void> => {
  await api.patch(`/pharmacy/orders/${orderId}/status`, data);
};

export const updateDelivery = async (
  orderId: number,
  data: UpdatePharmacyDeliveryRequest
): Promise<DeliveryResponse> => {
  const response = await api.put<DeliveryResponse>(`/pharmacy/orders/${orderId}/delivery`, data);
  return response.data;
};
