export type AdminUserRole = 'CUSTOMER' | 'PHARMACY' | 'ADMIN';

export interface AdminUserResponse {
  id: number;
  name: string;
  email: string;
  role: AdminUserRole;
  enabled: boolean;
  createdAt: string;
}

export interface CreateAdminUserRequest {
  name: string;
  email: string;
  password: string;
  role: AdminUserRole;
  enabled?: boolean;
  sendWelcomeEmail?: boolean;
}

export interface UpdateAdminUserRequest {
  name: string;
  email: string;
  role: AdminUserRole;
}

export interface CreateAdminUserResponse extends AdminUserResponse {
  welcomeEmailSent: boolean;
}

export interface AdminUserListParams {
  page?: number;
  size?: number;
  search?: string;
  role?: AdminUserRole;
  enabled?: boolean;
}

export const ADMIN_USER_ROLE_LABELS: Record<AdminUserRole, string> = {
  CUSTOMER: 'Cliente',
  PHARMACY: 'Farmácia',
  ADMIN: 'Administrador',
};

export const ADMIN_USER_ROLE_OPTIONS: { value: AdminUserRole; label: string }[] = [
  { value: 'CUSTOMER', label: ADMIN_USER_ROLE_LABELS.CUSTOMER },
  { value: 'PHARMACY', label: ADMIN_USER_ROLE_LABELS.PHARMACY },
  { value: 'ADMIN', label: ADMIN_USER_ROLE_LABELS.ADMIN },
];
