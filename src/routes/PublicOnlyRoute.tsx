import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';
import { getDashboardPath } from '../utils/getDashboardPath';
import { PageLoader } from '../components/ui/PageLoader';
import { useAuthHydrated } from '../hooks/useAuthHydrated';

interface PublicOnlyRouteProps {
  children: ReactNode;
}

export const PublicOnlyRoute = ({ children }: PublicOnlyRouteProps) => {
  const hydrated = useAuthHydrated();
  const { isAuthenticated, role } = useAuthStore();

  if (!hydrated) {
    return <PageLoader message="Carregando sessão..." />;
  }

  if (isAuthenticated) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  return <>{children}</>;
};
