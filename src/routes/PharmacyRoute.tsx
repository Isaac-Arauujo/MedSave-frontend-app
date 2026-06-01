import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ROUTES } from '../constants/routes';
import { ROLES } from '../constants/roles';
import { useAuthStore } from '../store/authStore';
import { getDashboardPath } from '../utils/getDashboardPath';
import { PageLoader } from '../components/ui/PageLoader';
import { useAuthHydrated } from '../hooks/useAuthHydrated';

interface PharmacyRouteProps {
  children: ReactNode;
}

export const PharmacyRoute = ({ children }: PharmacyRouteProps) => {
  const hydrated = useAuthHydrated();
  const { isAuthenticated, role } = useAuthStore();

  if (!hydrated) {
    return <PageLoader message="Carregando sessão..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (role !== ROLES.PHARMACY) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  return <>{children}</>;
};
