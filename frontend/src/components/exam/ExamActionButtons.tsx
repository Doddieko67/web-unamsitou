import React, { memo } from 'react';
import Swal from 'sweetalert2';

interface ExamActionButtonsProps {
  isSubmitted: boolean;
  onSubmit: (timeSpent: number) => Promise<void>;
  onSuspend: (timeSpent: number) => Promise<void>;
  onReset?: () => Promise<void>;
  timeSpent: number;
  onGenerateFeedback?: () => void;
  canSubmit?: boolean;
  isLoading?: boolean;
  isFeedbackLoading?: boolean;
  hasFeedback?: boolean;
  syncStatus?: 'idle' | 'syncing' | 'success' | 'error' | 'offline';
}

/**
 * Pure action buttons component
 * Handles exam submission, suspension, and other actions
 */
export const ExamActionButtons: React.FC<ExamActionButtonsProps> = memo(({
  isSubmitted,
  onSubmit,
  onSuspend,
  onReset,
  timeSpent,
  onGenerateFeedback,
  canSubmit = true,
  isLoading = false,
  isFeedbackLoading = false,
  hasFeedback = false,
  syncStatus = 'idle',
}) => {
  const handleSubmitClick = async () => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Una vez terminado, no podrás cambiar tus respuestas.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, terminar examen',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await onSubmit(timeSpent);
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al enviar el examen. Por favor, inténtalo de nuevo.',
          icon: 'error',
        });
      }
    }
  };

  const handleSuspendClick = async () => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Seguro que quieres suspender el examen? Simplemente se guardará el estado actual del examen en la base de datos y pausará el tiempo restante.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, suspender examen',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await onSuspend(timeSpent);
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al suspender el examen. Por favor, inténtalo de nuevo.',
          icon: 'error',
        });
      }
    }
  };

  const handleResetClick = async () => {
    if (!onReset) return;

    const result = await Swal.fire({
      title: '¿Reiniciar el examen?',
      text: 'Esto creará una nueva instancia del examen. Tu progreso actual se mantendrá guardado en el historial.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#8B5CF6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, reiniciar examen',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await onReset();
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al reiniciar el examen. Por favor, inténtalo de nuevo.',
          icon: 'error',
        });
      }
    }
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'fa-sync fa-spin text-blue-600';
      case 'success':
        return 'fa-check text-green-600';
      case 'error':
        return 'fa-exclamation-triangle text-orange-600';
      case 'offline':
        return 'fa-wifi text-red-500';
      default:
        return 'fa-cloud text-gray-400';
    }
  };

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Guardando...';
      case 'success':
        return 'Guardado';
      case 'error':
        return 'Error al guardar';
      case 'offline':
        return 'Sin conexión';
      default:
        return 'Sincronizado';
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
        {/* Completed Status */}
        <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-center space-x-2 text-green-700">
            <i className="fas fa-check-circle text-lg"></i>
            <span className="font-semibold text-sm">Completado</span>
          </div>
          <p className="text-xs text-green-600 mt-1">
            Respuestas guardadas
          </p>
        </div>

        {/* Sync Status */}
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-600">
          <i className={`fas ${getSyncStatusIcon()}`}></i>
          <span>{getSyncStatusText()}</span>
        </div>

        {/* Feedback Button */}
        {onGenerateFeedback && !hasFeedback && (
          <button
            onClick={onGenerateFeedback}
            className="w-full text-yellow-600 bg-yellow-100 border-yellow-300 border-2 hover:bg-yellow-200 px-3 py-2 rounded-lg font-medium text-xs transition duration-150 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            title="Generar retroalimentación"
            disabled={isFeedbackLoading}
          >
            {isFeedbackLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-1"></i>
                <span>Generando...</span>
              </>
            ) : (
              <>
                <i className="fas fa-lightbulb mr-1"></i>
                <span>Feedback</span>
              </>
            )}
          </button>
        )}

        {/* Reset Button */}
        {onReset && (
          <button
            onClick={handleResetClick}
            className="w-full text-purple-600 bg-purple-100 border-purple-300 border-2 hover:bg-purple-200 px-3 py-2 rounded-lg font-medium text-xs transition duration-150 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            title="Reiniciar examen"
            disabled={isLoading}
          >
            <i className="fas fa-redo mr-1"></i>
            <span>Reiniciar</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
      {/* Sync Status */}
      <div className="flex items-center justify-center space-x-2 text-xs text-gray-600">
        <i className={`fas ${getSyncStatusIcon()}`}></i>
        <span>{getSyncStatusText()}</span>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmitClick}
        disabled={!canSubmit || isLoading}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 rounded-lg font-medium text-xs hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out shadow-md hover:shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        title="Finalizar y Enviar Examen"
      >
        {isLoading ? (
          <>
            <i className="fas fa-spinner fa-spin mr-1"></i>
            <span>Enviando...</span>
          </>
        ) : (
          <>
            <i className="fas fa-paper-plane mr-1"></i>
            <span>Enviar Examen</span>
          </>
        )}
      </button>

      {/* Suspend Button */}
      <button
        onClick={handleSuspendClick}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-2 rounded-lg font-medium text-xs hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-150 ease-in-out shadow-md hover:shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        title="Suspender Examen"
      >
        {isLoading ? (
          <>
            <i className="fas fa-spinner fa-spin mr-1"></i>
            <span>Suspendiendo...</span>
          </>
        ) : (
          <>
            <i className="fas fa-pause mr-1"></i>
            <span>Suspender</span>
          </>
        )}
      </button>
    </div>
  );
});