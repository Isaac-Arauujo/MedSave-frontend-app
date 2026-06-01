import { ROUTES } from '../constants/routes';
import { ROLES, type Role } from '../constants/roles';

export const getDashboardPath = (role: string | null): string => {
  switch (role as Role) {
    case ROLES.PHARMACY:
      return ROUTES.PHARMACY_DASHBOARD;
    case ROLES.ADMIN:
      return ROUTES.ADMIN_DASHBOARD;
    case ROLES.CUSTOMER:
      return ROUTES.CUSTOMER_DASHBOARD;
    default:
      return ROUTES.LISTINGS;
  }
};
