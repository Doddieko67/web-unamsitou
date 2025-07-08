import React from 'react';

interface ExamTimerDisplayProps {
  timeLeft: number | undefined;
  timeSpent: number;
  isRunning: boolean;
  isSubmitted: boolean;
  formatTime: (seconds: number | undefined) => string;
  onPause?: () => void;
  onResume?: () => void;
}

/**
 * Pure timer display component
 * Handles only timer visualization and basic controls
 */
export const ExamTimerDisplay: React.FC<ExamTimerDisplayProps> = ({
  timeLeft,
  timeSpent,
  isRunning,
  isSubmitted,
  formatTime,
  onPause,
  onResume,
}) => {
  const getTimerColor = () => {
    if (isSubmitted) return 'text-gray-500';
    if (timeLeft === undefined) return 'text-blue-600';
    if (timeLeft <= 300) return 'text-red-600'; // Last 5 minutes
    if (timeLeft <= 900) return 'text-orange-600'; // Last 15 minutes
    return 'text-green-600';
  };

  const getTimerBgColor = () => {
    if (isSubmitted) return 'bg-gray-100';
    if (timeLeft === undefined) return 'bg-blue-50';
    if (timeLeft <= 300) return 'bg-red-50';
    if (timeLeft <= 900) return 'bg-orange-50';
    return 'bg-green-50';
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${getTimerBgColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">
          Tiempo de Examen
        </h3>
        {!isSubmitted && (
          <div className="flex items-center space-x-2">
            {isRunning ? (
              <button
                onClick={onPause}
                className="text-xs text-gray-500 hover:text-gray-700"
                title="Pausar timer"
              >
                <i className="fas fa-pause"></i>
              </button>
            ) : (
              <button
                onClick={onResume}
                className="text-xs text-gray-500 hover:text-gray-700"
                title="Reanudar timer"
              >
                <i className="fas fa-play"></i>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {/* Time Left */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Tiempo restante:</span>
          <span className={`text-lg font-bold ${getTimerColor()}`}>
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Time Spent */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Tiempo transcurrido:</span>
          <span className="text-sm font-semibold text-gray-700">
            {formatTime(timeSpent)}
          </span>
        </div>

        {/* Status indicator */}
        <div className="flex items-center space-x-2 pt-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isSubmitted
                ? 'bg-gray-400'
                : isRunning
                ? 'bg-green-400 animate-pulse'
                : 'bg-yellow-400'
            }`}
          />
          <span className="text-xs text-gray-500">
            {isSubmitted
              ? 'Examen finalizado'
              : isRunning
              ? 'En progreso'
              : 'Pausado'}
          </span>
        </div>

        {/* Warning for low time */}
        {timeLeft !== undefined && timeLeft <= 300 && !isSubmitted && (
          <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded-md">
            <div className="flex items-center">
              <i className="fas fa-exclamation-triangle text-red-600 mr-2"></i>
              <span className="text-xs text-red-700 font-medium">
                ¡Quedan menos de 5 minutos!
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};