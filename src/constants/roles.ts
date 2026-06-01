export const ROLES = {
  CUSTOMER: 'ROLE_CUSTOMER',
  PHARMACY: 'ROLE_PHARMACY',
  ADMIN: 'ROLE_ADMIN',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
