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
    if (isSubmitted) return 'text-gray-600';
    if (timeLeft === undefined) return 'text-blue-600';
    if (timeLeft <= 300) return 'text-red-600'; // Last 5 minutes
    if (timeLeft <= 900) return 'text-orange-600'; // Last 15 minutes
    return 'text-emerald-600';
  };

  const getTimerGradient = () => {
    if (isSubmitted) return 'from-gray-50 to-gray-100';
    if (timeLeft === undefined) return 'from-blue-50 to-blue-100';
    if (timeLeft <= 300) return 'from-red-50 to-red-100'; // Last 5 minutes
    if (timeLeft <= 900) return 'from-yellow-50 to-yellow-100'; // Last 15 minutes
    return 'from-green-50 to-green-100';
  };

  const getIconColor = () => {
    if (isSubmitted) return 'text-gray-400';
    if (timeLeft === undefined) return 'text-blue-500';
    if (timeLeft <= 300) return 'text-red-500';
    if (timeLeft <= 900) return 'text-orange-500';
    return 'text-emerald-500';
  };

  return (
    <div className={`p-4 rounded-2xl bg-gradient-to-br ${getTimerGradient()} border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-full bg-gray-50 border border-gray-200 shadow-md flex items-center justify-center`}>
            <i className={`fas fa-stopwatch ${getIconColor()} text-sm`}></i>
          </div>
          <h3 className="text-sm font-bold text-gray-800">
            ⏰ Tiempo de Examen
          </h3>
        </div>
        {!isSubmitted && (
          <div className="flex items-center space-x-1">
            <button
              onClick={isRunning ? onPause : onResume}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                isRunning 
                  ? 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900' 
                  : 'bg-green-400 hover:bg-green-500 text-green-900'
              } shadow-lg`}
              title={isRunning ? 'Pausar timer' : 'Reanudar timer'}
            >
              <i className={`fas fa-${isRunning ? 'pause' : 'play'} text-xs`}></i>
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {/* Time Left - Main Display */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <span className="text-xs font-medium text-gray-600">⏳ Tiempo restante</span>
            <div
              className={`w-3 h-3 rounded-full ${
                isSubmitted
                  ? 'bg-gray-400'
                  : isRunning
                  ? 'bg-green-400 animate-pulse'
                  : 'bg-yellow-400 animate-bounce'
              } shadow-sm`}
            />
          </div>
          <div className={`text-2xl font-black ${getTimerColor()} tracking-wider drop-shadow-lg`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Time Spent - Secondary Display */}
        <div className="flex justify-between items-center bg-gray-50 bg-opacity-90 border border-gray-200 rounded-lg px-3 py-2">
          <span className="text-xs font-medium text-gray-600 flex items-center">
            <i className="fas fa-hourglass-half mr-1 text-gray-500"></i>
            Transcurrido
          </span>
          <span className="text-sm font-bold text-gray-800">
            {formatTime(timeSpent)}
          </span>
        </div>

        {/* Status indicator with emoji */}
        <div className="flex items-center justify-center space-x-2 bg-gray-50 bg-opacity-90 border border-gray-200 rounded-lg px-3 py-1">
          <span className="text-sm">
            {isSubmitted
              ? '🏁'
              : isRunning
              ? '🚀'
              : '⏸️'}
          </span>
          <span className="text-xs font-medium text-gray-700">
            {isSubmitted
              ? 'Finalizado'
              : isRunning
              ? 'En marcha'
              : 'Pausado'}
          </span>
        </div>

        {/* Warning for low time - Fun style */}
        {timeLeft !== undefined && timeLeft <= 300 && !isSubmitted && (
          <div className="mt-3 p-2 bg-gradient-to-r from-red-200 to-red-300 border border-red-300 rounded-lg animate-pulse">
            <div className="flex items-center justify-center text-red-800">
              <span className="text-sm font-bold animate-bounce">
                🚨 ¡Solo {Math.floor(timeLeft / 60)} minutos! 🚨
              </span>
            </div>
          </div>
        )}
        
        {/* Encouragement for good time */}
        {timeLeft !== undefined && timeLeft > 1800 && !isSubmitted && (
          <div className="mt-2 text-center">
            <span className="text-xs text-gray-600">🌟 ¡Tienes tiempo suficiente! 🌟</span>
          </div>
        )}
      </div>
    </div>
  );
};