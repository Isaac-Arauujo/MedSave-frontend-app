export type PharmacyStatus = 'PENDING' | 'APPROVED' | 'SUSPENDED';

export interface PharmacyRegisterRequest {
  name: string;
  cnpj: string;
  phone?: string;
  email: string;
  password: string;
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface PharmacyUserSummary {
  id: number;
  email: string;
  active: boolean;
}

export interface PharmacyResponse {
  id: number;
  name: string;
  cnpj: string;
  phone?: string;
  email: string;
  status: PharmacyStatus;
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
  user: PharmacyUserSummary;
}

export interface UpdatePharmacyRequest {
  name?: string;
  phone?: string;
  email?: string;
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

export interface PharmacyNearbyResponse {
  id: number;
  name: string;
  city: string;
  state: string;
  phone?: string;
  status: PharmacyStatus;
  distanceKm: number;
  latitude: number;
  longitude: number;
}
