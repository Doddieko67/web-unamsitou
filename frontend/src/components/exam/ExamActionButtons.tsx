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
      <div className="space-y-4">
        {/* Sync Status */}
        <div 
          className="flex items-center justify-center space-x-2 text-sm transition-colors duration-300"
          style={{ color: 'var(--theme-text-secondary)' }}
        >
          <i className={`fas ${getSyncStatusIcon()}`}></i>
          <span>{getSyncStatusText()}</span>
        </div>

        {/* Feedback Button */}
        {onGenerateFeedback && !hasFeedback && (
          <button
            onClick={async () => {
              try {
                await onGenerateFeedback();
              } catch (error) {
                console.error('Error en retroalimentación:', error);
                const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                
                let userMessage = 'Hubo un problema al generar la retroalimentación.';
                
                if (errorMessage.includes('autenticado')) {
                  userMessage = 'Necesitas estar autenticado para generar retroalimentación.';
                } else if (errorMessage.includes('HTTP') || errorMessage.includes('fetch')) {
                  userMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
                } else if (errorMessage.includes('inesperada')) {
                  userMessage = 'El servidor devolvió una respuesta inesperada. Inténtalo más tarde.';
                }
                
                Swal.fire({
                  title: 'Error al generar retroalimentación',
                  text: `${userMessage}\n\nDetalle técnico: ${errorMessage}`,
                  icon: 'error',
                  confirmButtonText: 'Entendido'
                });
              }
            }}
            className="w-full px-4 py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed border-2"
            style={{
              color: 'var(--theme-warning)',
              backgroundColor: 'var(--theme-warning-light)',
              borderColor: 'var(--theme-warning)',
              boxShadow: 'var(--theme-shadow-md)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-warning)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = 'var(--theme-shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-warning-light)';
              e.currentTarget.style.color = 'var(--theme-warning)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--theme-shadow-md)';
            }}
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

        {/* Reset Button */}
        {onReset && (
          <button
            onClick={handleResetClick}
            className="w-full px-4 py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed border-2"
            style={{
              color: 'var(--terciary)',
              backgroundColor: 'var(--theme-bg-primary)',
              borderColor: 'var(--terciary)',
              boxShadow: 'var(--theme-shadow-md)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, var(--terciary), var(--cuaternary))';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = 'var(--theme-shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-bg-primary)';
              e.currentTarget.style.background = 'var(--theme-bg-primary)';
              e.currentTarget.style.color = 'var(--terciary)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--theme-shadow-md)';
            }}
            title="Reiniciar examen"
            disabled={isLoading}
          >
            <i className="fas fa-redo mr-2"></i>
            <span>Reiniciar el Examen</span>
          </button>
        )}

      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sync Status */}
      <div 
        className="flex items-center justify-center space-x-2 text-sm transition-colors duration-300"
        style={{ color: 'var(--theme-text-secondary)' }}
      >
        <i className={`fas ${getSyncStatusIcon()}`}></i>
        <span>{getSyncStatusText()}</span>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmitClick}
        disabled={!canSubmit || isLoading}
        className="w-full text-white px-4 py-3 rounded-lg font-semibold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
          '--tw-ring-color': 'var(--primary)',
          '--tw-ring-opacity': '0.5'
        } as React.CSSProperties}
        onMouseEnter={(e) => {
          if (!(!canSubmit || isLoading)) {
            e.currentTarget.style.background = 'linear-gradient(135deg, var(--primary-dark), var(--primary))';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
          }
        }}
        onMouseLeave={(e) => {
          if (!(!canSubmit || isLoading)) {
            e.currentTarget.style.background = 'linear-gradient(135deg, var(--primary), var(--primary-dark))';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
          }
        }}
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
        className="w-full text-white px-4 py-3 rounded-lg font-semibold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: 'linear-gradient(135deg, var(--terciary), var(--cuaternary))',
          opacity: '0.8',
          '--tw-ring-color': 'var(--terciary)',
          '--tw-ring-opacity': '0.5'
        } as React.CSSProperties}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading) {
            e.currentTarget.style.opacity = '0.8';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
          }
        }}
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