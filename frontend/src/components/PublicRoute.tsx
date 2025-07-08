import { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuthStore } from '../stores/authStore';
import { LoadingSpinner } from './LoadingSpinner';

interface PublicRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export const PublicRoute = ({ 
  children, 
  redirectTo = '/inicio' 
}: PublicRouteProps) => {
  const { user, loading } = useAuthStore();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return <LoadingSpinner fullScreen text="Verificando autenticación..." />;
  }

  // Si ya hay usuario autenticado, redirigir a la página principal
  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Si no hay usuario, mostrar la página pública (login/signup)
  return <>{children}</>;
};