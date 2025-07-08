import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode, useState } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Tiempo de cache por defecto: 5 minutos
            staleTime: 5 * 60 * 1000,
            // Tiempo que los datos permanecen en cache: 10 minutos
            gcTime: 10 * 60 * 1000,
            // Reintento automático en caso de error
            retry: (failureCount, error: any) => {
              // No reintentar en errores 4xx (excepto 408)
              if (error?.status >= 400 && error?.status < 500 && error?.status !== 408) {
                return false;
              }
              // Máximo 2 reintentos para otros errores
              return failureCount < 2;
            },
            // Configuración de red
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            refetchOnMount: true,
          },
          mutations: {
            // Reintento para mutaciones
            retry: (failureCount, error: any) => {
              // No reintentar errores de cliente
              if (error?.status >= 400 && error?.status < 500) {
                return false;
              }
              return failureCount < 1;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Solo mostrar devtools en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
};