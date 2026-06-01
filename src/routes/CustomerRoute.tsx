import { Navigate } from 'react-router-dom';
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
  const hydrated = useAuthHydrated();
  const { isAuthenticated, role } = useAuthStore();

  if (!hydrated) {
    return <PageLoader message="Carregando sessão..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (role !== ROLES.CUSTOMER) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  return <>{children}</>;
};
