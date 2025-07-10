import { useState, useCallback, useRef } from 'react';
import Swal from 'sweetalert2';

export interface CancellableRequestState {
  isLoading: boolean;
  abortController: AbortController | null;
}

export interface CancellableRequestActions {
  startRequest: () => AbortController;
  cancelRequest: () => void;
  isLoading: boolean;
  signal: AbortSignal | undefined;
}

/**
 * Hook para manejar solicitudes que pueden ser canceladas
 * Proporciona AbortController y manejo de estado de carga
 */
export const useCancellableRequest = (
  loadingMessage = 'Operación cancelada',
  showCancelNotification = true
): CancellableRequestActions => {
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startRequest = useCallback((): AbortController => {
    // Cancelar cualquier solicitud anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo controller
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsLoading(true);

    return controller;
  }, []);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);

      if (showCancelNotification) {
        Swal.fire({
          icon: 'info',
          title: 'Operación Cancelada',
          text: loadingMessage,
          timer: 2000,
          showConfirmButton: false
        });
      }
    }
  }, [loadingMessage, showCancelNotification]);

  const finishRequest = useCallback(() => {
    setIsLoading(false);
    abortControllerRef.current = null;
  }, []);

  // Efecto de limpieza al desmontar
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  }, []);

  return {
    startRequest,
    cancelRequest: cancelRequest,
    isLoading,
    signal: abortControllerRef.current?.signal,
    finishRequest,
    cleanup
  } as CancellableRequestActions & {
    finishRequest: () => void;
    cleanup: () => void;
  };
};

/**
 * Hook específico para generación de exámenes
 * Incluye manejo de errores AbortError
 */
export const useExamGeneration = () => {
  const cancellableRequest = useCancellableRequest(
    'La generación del examen ha sido cancelada.',
    true
  );

  const handleGenerationError = useCallback((error: any, controller?: AbortController) => {
    // Verificar si el error es por cancelación
    if (error.name === 'AbortError' || controller?.signal.aborted) {
      console.log('Generación de examen cancelada por el usuario');
      return { wasCancelled: true };
    }

    // Error real de la generación
    Swal.fire({
      icon: 'error',
      title: 'Error al Generar Examen',
      text: 'Hubo un problema al intentar generar tu examen. Por favor, inténtalo de nuevo.',
      confirmButtonColor: '#d33'
    });

    return { wasCancelled: false };
  }, []);

  const executeWithCancellation = useCallback(async <T>(
    requestFn: (signal: AbortSignal) => Promise<T>
  ): Promise<T | null> => {
    const controller = cancellableRequest.startRequest();

    try {
      const result = await requestFn(controller.signal);
      return result;
    } catch (error: any) {
      const { wasCancelled } = handleGenerationError(error, controller);
      if (wasCancelled) {
        return null;
      }
      throw error;
    } finally {
      (cancellableRequest as any).finishRequest();
    }
  }, [cancellableRequest, handleGenerationError]);

  return {
    ...cancellableRequest,
    executeWithCancellation,
    handleGenerationError
  };
};