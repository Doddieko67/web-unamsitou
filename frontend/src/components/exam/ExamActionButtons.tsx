import React, { memo } from 'react';
import Swal from 'sweetalert2';

interface ExamActionButtonsProps {
  isSubmitted: boolean;
  onSubmit: (timeSpent: number) => Promise<void>;
  onSuspend: (timeSpent: number) => Promise<void>;
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
      <div className="space-y-4">
        {/* Sync Status */}
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <i className={`fas ${getSyncStatusIcon()}`}></i>
          <span>{getSyncStatusText()}</span>
        </div>

        {/* Feedback Button */}
        {onGenerateFeedback && !hasFeedback && (
          <button
            onClick={onGenerateFeedback}
            className="w-full text-yellow-600 bg-yellow-100 shadow-yellow-100 border-yellow-300 border-2 hover:shadow-yellow-400 px-4 py-3 rounded-lg font-semibold text-sm sm:text-base transition duration-150 ease-in-out shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            title="Generar retroalimentación"
            disabled={isFeedbackLoading}
          >
            {isFeedbackLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                <span>Generando...</span>
              </>
            ) : (
              <>
                <i className="fas fa-wheat-awn-circle-exclamation mr-2"></i>
                <span>Retroalimentar todo</span>
              </>
            )}
          </button>
        )}

        {/* Completed Status */}
        <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-center space-x-2 text-green-700">
            <i className="fas fa-check-circle text-xl"></i>
            <span className="font-semibold">Examen Completado</span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            Tus respuestas han sido guardadas exitosamente
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sync Status */}
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
        <i className={`fas ${getSyncStatusIcon()}`}></i>
        <span>{getSyncStatusText()}</span>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmitClick}
        disabled={!canSubmit || isLoading}
        className="w-full gradient-bg text-white px-4 py-3 rounded-lg font-semibold text-sm sm:text-base hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        title="Finalizar y Enviar Examen"
      >
        {isLoading ? (
          <>
            <i className="fas fa-spinner fa-spin mr-2"></i>
            <span>Enviando...</span>
          </>
        ) : (
          <>
            <i className="fas fa-paper-plane mr-2"></i>
            <span>Enviar Examen Ahora</span>
          </>
        )}
      </button>

      {/* Suspend Button */}
      <button
        onClick={handleSuspendClick}
        disabled={isLoading}
        className="w-full gradient-bg-purple text-white px-4 py-3 rounded-lg opacity-70 font-semibold text-sm sm:text-base hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        title="Suspender Examen"
      >
        {isLoading ? (
          <>
            <i className="fas fa-spinner fa-spin mr-2"></i>
            <span>Suspendiendo...</span>
          </>
        ) : (
          <>
            <i className="fas fa-calendar-xmark mr-2"></i>
            <span>Suspender el Examen</span>
          </>
        )}
      </button>
    </div>
  );
});