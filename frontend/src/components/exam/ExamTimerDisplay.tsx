import React from 'react';

interface ExamTimerDisplayProps {
  timeLeft: number | undefined;
  timeSpent: number;
  isRunning: boolean;
  isSubmitted: boolean;
  formatTime: (seconds: number | undefined) => string;
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
}) => {
  const getTimerColor = () => {
    if (isSubmitted) return 'text-blue-700';
    if (timeLeft === undefined) return 'text-blue-700';
    if (timeLeft <= 300) return 'text-red-700'; // Last 5 minutes
    if (timeLeft <= 900) return 'text-orange-700'; // Last 15 minutes
    return 'text-emerald-700'; // Running
  };

  const getTimerGradient = () => {
    if (isSubmitted) return 'from-blue-100 to-blue-200';
    if (timeLeft === undefined) return 'from-blue-100 to-indigo-200';
    if (timeLeft <= 300) return 'from-red-100 to-red-200'; // Last 5 minutes
    if (timeLeft <= 900) return 'from-orange-100 to-yellow-200'; // Last 15 minutes
    return 'from-emerald-100 to-green-200'; // Running
  };

  const getIconColor = () => {
    if (isSubmitted) return 'text-blue-600';
    if (timeLeft === undefined) return 'text-blue-500';
    if (timeLeft <= 300) return 'text-red-500';
    if (timeLeft <= 900) return 'text-orange-500';
    return 'text-emerald-500'; // Running
  };

  const getTextColor = () => {
    if (isSubmitted) return 'text-blue-800';
    if (timeLeft === undefined) return 'text-blue-800';
    if (timeLeft <= 300) return 'text-red-800';
    if (timeLeft <= 900) return 'text-orange-800';
    return 'text-emerald-800'; // Running
  };

  return (
    <div className={`px-6 py-4 rounded-2xl bg-gradient-to-br ${getTimerGradient()} transition-all duration-300 min-w-[380px]`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-full bg-white bg-opacity-90 flex items-center justify-center`}>
            <i className={`fas fa-stopwatch ${getIconColor()} text-sm`}></i>
          </div>
          <h3 className={`text-sm font-bold ${getTextColor()}`}>
            ⏰ Tiempo de Examen
          </h3>
        </div>
      </div>

      <div className="space-y-3">
        {/* Time Left - Main Display */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <span className={`text-xs font-medium ${getTextColor()}`}>⏳ Tiempo restante</span>
            <div
              className={`w-3 h-3 rounded-full ${
                isSubmitted
                  ? 'bg-blue-400'
                  : timeLeft !== undefined && timeLeft <= 300
                  ? 'bg-red-400 animate-pulse'
                  : timeLeft !== undefined && timeLeft <= 900
                  ? 'bg-orange-400 animate-pulse'
                  : 'bg-emerald-400 animate-pulse'
              } shadow-sm`}
            />
          </div>
          <div className={`text-2xl font-black ${getTimerColor()} tracking-wider drop-shadow-lg`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Time Spent - Secondary Display */}
        <div className="flex justify-between items-center bg-white bg-opacity-80 rounded-lg px-3 py-2">
          <span className={`text-xs font-medium ${getTextColor()} flex items-center`}>
            <i className={`fas fa-hourglass-half mr-1 ${getIconColor()}`}></i>
            Transcurrido
          </span>
          <span className={`text-sm font-bold ${getTextColor()}`}>
            {formatTime(timeSpent)}
          </span>
        </div>

        {/* Status indicator with emoji */}
        <div className="flex items-center justify-center space-x-2 bg-white bg-opacity-80 rounded-lg px-3 py-1">
          <span className="text-sm">
            {isSubmitted
              ? '🏁'
              : timeLeft !== undefined && timeLeft <= 300
              ? '🚨'
              : timeLeft !== undefined && timeLeft <= 900
              ? '⚠️'
              : '🚀'}
          </span>
          <span className={`text-xs font-medium ${getTextColor()}`}>
            {isSubmitted
              ? 'Finalizado'
              : timeLeft !== undefined && timeLeft <= 300
              ? 'Tiempo crítico'
              : timeLeft !== undefined && timeLeft <= 900
              ? 'Tiempo limitado'
              : 'En marcha'}
          </span>
        </div>

        {/* Warning for low time - Fun style */}
        {timeLeft !== undefined && timeLeft <= 300 && !isSubmitted && (
          <div className="mt-3 p-2 bg-gradient-to-r from-red-200 to-red-300 rounded-lg animate-pulse">
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
            <span className={`text-xs ${getTextColor()}`}>🌟 ¡Tienes tiempo suficiente! 🌟</span>
          </div>
        )}
      </div>
    </div>
  );
};