import { ROLES, type Role } from '../constants/roles';

export const normalizeRole = (role: string): Role | null => {
  const withPrefix = role.startsWith('ROLE_') ? role : `ROLE_${role}`;

  if (withPrefix === ROLES.CUSTOMER) {
    return ROLES.CUSTOMER;
  }

  if (withPrefix === ROLES.PHARMACY) {
    return ROLES.PHARMACY;
  }

  if (withPrefix === ROLES.ADMIN) {
    return ROLES.ADMIN;
  }

  return null;
};
