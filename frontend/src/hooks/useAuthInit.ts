import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

/**
 * Hook para inicializar la autenticación al cargar la aplicación
 * Debe ser usado una sola vez en el componente raíz
 */
export const useAuthInit = () => {
  const { initialize, loading, error, user } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    loading,
    error,
    user,
    isAuthenticated: !!user,
  };
};