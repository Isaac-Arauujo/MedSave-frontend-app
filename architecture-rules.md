FRONTEND ARCHITECTURE RULES
STATE MANAGEMENT
Use Zustand for global state.
Use React local state (useState) for component-local state.
Use React Context ONLY for theme or locale (not business state).
Zustand Store Pattern:
ts
// store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface AuthState {
token: string | null;
role: string | null;
userId: number | null;
isAuthenticated: boolean;
setAuth: (token: string, role: string, userId: number) => void;
clearAuth: () => void;
}
export const useAuthStore = create<AuthState>()(
persist(
(set) => ({
token: null,
role: null,
userId: null,
isAuthenticated: false,
setAuth: (token, role, userId) =>
set({ token, role, userId, isAuthenticated: true }),
clearAuth: () =>
set({ token: null, role: null, userId: null, isAuthenticated: false }),
}),
{ name: 'auth-storage' }
)
);
Required Stores:
authStore → token, role, userId, isAuthenticated
cartStore → cart data, item count, total
checkoutStore → checkout session state
API LAYER
Single Axios instance at 
src/api/axiosInstance.ts :
ts
API File Organization:
One file per domain:
src/api/authApi.ts
src/api/userApi.ts
src/api/addressApi.ts
src/api/pharmacyApi.ts
src/api/productApi.ts
src/api/listingApi.ts
src/api/cartApi.ts
src/api/couponApi.ts
src/api/checkoutApi.ts
src/api/orderApi.ts
src/api/paymentApi.ts
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});
// Request interceptor — attach token
api.interceptors.request.use((config) => {
const token = useAuthStore.getState().token;
if (token) {
    config.headers.Authorization = `Bearer ${token}`;
}
return config;
});
// Response interceptor — handle 401
api.interceptors.response.use(
(response) => response,
(error) => {
if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
window.location.href = '/login'; // only place window.location is allowed
}
return Promise.reject(error);
}
);
src/api/deliveryApi.ts
src/api/adminApi.ts
Each API file exports only typed async functions.
Each function returns typed response data (never raw AxiosResponse).
Example:
ts
// src/api/authApi.ts
import { api } from './axiosInstance';
import { LoginRequest, AuthResponse } from '../types/AuthTypes';
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
const response = await api.post<AuthResponse>('/auth/login', data);
return response.data;
};
TYPE DEFINITIONS
All TypeScript types mirror backend DTOs exactly. Place all types in 
Naming Convention:
Request types: 
src/types/ .
Create{Entity}Request , 
Update{Entity}Request
Response types: 
{Entity}Response
Enum types: mirror backend enum names exactly
Required Type Files:
AuthTypes.ts → LoginRequest, AuthResponse
UserTypes.ts → UserProfileResponse, UpdateProfileRequest
AddressTypes.ts → AddressResponse, CreateAddressRequest, UpdateAddressRequest
PharmacyTypes.ts → PharmacyResponse, PharmacyRegisterRequest,
PharmacyNearbyResponse
ProductTypes.ts → ProductResponse, ProductCategory enum
ListingTypes.ts → ListingResponse, CreateListingRequest
CartTypes.ts → CartResponse, CartItemResponse, CartSummaryResponse
CouponTypes.ts → CouponResponse, CouponType enum
CheckoutTypes.ts → CheckoutSessionResponse, DeliveryType enum, PaymentMethod
enum
OrderTypes.ts → OrderResponse, OrderDetailResponse, OrderStatus enum
PaymentTypes.ts → PaymentInitiateResponse, PaymentResponse, PaymentStatus enum
DeliveryTypes.ts → DeliveryResponse
CommonTypes.ts → PageResponse<T>, ApiError, PaginationParams
PageResponse generic:
ts
// src/types/CommonTypes.ts
export interface PageResponse<T> {
content: T[];
totalElements: number;
totalPages: number;
number: number; // current page (0-indexed)
size: number;
}
export interface ApiError {
status: number;
error: string;
message: string;
}
FORM HANDLING
Use React Hook Form for ALL forms.
Use Zod for ALL schema validation.
Pattern:
ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
const loginSchema = z.object({
email: z.string().email('Invalid email'),
password: z.string().min(1, 'Password is required'),
});
type LoginFormData = z.infer<typeof loginSchema>;
const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Logi
resolver: zodResolver(loginSchema),
});

Validation rules MUST mirror backend constraints:
@NotBlank → z.string().min(1, ...)
@Email → z.string().email(...)
@Size(max=20) → z.string().max(20, ...)
Strong password → z.string().regex(/^(?=.[A-Z])(?=.[0-9])(?=.*[^a-zA-Z0-9]).{8,}$/, ...)

REQUIRED DEPENDENCIES
These packages MUST be installed before starting:
react-router-dom (v6+)
axios
zustand
react-hook-form
@hookform/resolvers
zod
react-query OR @tanstack/react-query (for server state)
Optional but recommended:
react-hot-toast (notifications)
date-fns (date formatting)
clsx or classnames (conditional classes)
ENVIRONMENT VARIABLES
Required in .env:
VITE_API_BASE_URL=http://localhost:8080
Never hardcode the API URL. Always use 
import.meta.env.VITE_API_BASE_URL .