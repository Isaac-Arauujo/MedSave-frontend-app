import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ROUTES } from '../constants/routes';
import { ROLES } from '../constants/roles';
import { useAuthStore } from '../store/authStore';
import { getDashboardPath } from '../utils/getDashboardPath';
import { PageLoader } from '../components/ui/PageLoader';
import { useAuthHydrated } from '../hooks/useAuthHydrated';

interface CustomerRouteProps {
  children: ReactNode;
}

export const CustomerRoute = ({ children }: CustomerRouteProps) => {
  const location = useLocation();
  const hydrated = useAuthHydrated();
  const { isAuthenticated, role } = useAuthStore();

  if (!hydrated) {
    return <PageLoader message="Carregando sessão..." />;
  }

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${ROUTES.LOGIN}?redirect=${redirect}`} replace />;
  }

  if (role !== ROLES.CUSTOMER) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  return <>{children}</>;
};
