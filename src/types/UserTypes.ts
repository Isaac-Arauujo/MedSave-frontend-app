export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export interface UserProfileResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  cpf: string;
  phone?: string;
  mobilePhone?: string;
  birthDate?: string;
  gender?: Gender;
  active?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  mobilePhone?: string;
  birthDate?: string;
  gender?: string;
}
