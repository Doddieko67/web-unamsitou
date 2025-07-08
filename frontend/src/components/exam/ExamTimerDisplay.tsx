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
  const getTimerStyles = () => {
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    
    if (isSubmitted) {
      return {
        color: 'var(--primary)',
        background: isDarkMode 
          ? 'var(--theme-bg-primary)' 
          : 'linear-gradient(135deg, var(--theme-info-light), var(--theme-bg-accent))',
        iconColor: 'var(--primary)',
        textColor: 'var(--theme-text-primary)',
        dotColor: 'var(--primary)',
        borderColor: 'var(--primary)'
      };
    }
    if (timeLeft === undefined) {
      return {
        color: 'var(--primary)', 
        background: isDarkMode 
          ? 'var(--theme-bg-primary)' 
          : 'linear-gradient(135deg, var(--theme-info-light), var(--theme-bg-accent))',
        iconColor: 'var(--primary)',
        textColor: 'var(--theme-text-primary)',
        dotColor: 'var(--primary)',
        borderColor: 'var(--primary)'
      };
    }
    if (timeLeft <= 300) { // Last 5 minutes
      return {
        color: 'var(--theme-error)',
        background: isDarkMode 
          ? 'var(--theme-bg-primary)' 
          : 'linear-gradient(135deg, var(--theme-error-light), #fecaca)',
        iconColor: 'var(--theme-error)',
        textColor: 'var(--theme-text-primary)',
        dotColor: 'var(--theme-error)',
        borderColor: 'var(--theme-error)'
      };
    }
    if (timeLeft <= 900) { // Last 15 minutes
      return {
        color: 'var(--theme-warning)',
        background: isDarkMode 
          ? 'var(--theme-bg-primary)' 
          : 'linear-gradient(135deg, var(--theme-warning-light), #fde68a)',
        iconColor: 'var(--theme-warning)',
        textColor: 'var(--theme-text-primary)',
        dotColor: 'var(--theme-warning)',
        borderColor: 'var(--theme-warning)'
      };
    }
    return { // Running
      color: 'var(--secondary)',
      background: isDarkMode 
        ? 'var(--theme-bg-primary)' 
        : 'linear-gradient(135deg, var(--theme-success-light), #bbf7d0)',
      iconColor: 'var(--secondary)',
      textColor: 'var(--theme-text-primary)',
      dotColor: 'var(--secondary)',
      borderColor: 'var(--secondary)'
    };
  };

  const timerStyles = getTimerStyles();

  return (
    <div 
      className="px-6 py-4 rounded-2xl transition-all duration-300 min-w-[380px] border"
      style={{
        background: timerStyles.background,
        borderColor: timerStyles.borderColor,
        boxShadow: 'var(--theme-shadow-md)'
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300"
            style={{ 
              backgroundColor: 'var(--theme-bg-primary)',
              border: '1px solid var(--theme-border-primary)'
            }}
          >
            <i 
              className="fas fa-stopwatch text-sm transition-colors duration-300"
              style={{ color: timerStyles.iconColor }}
            ></i>
          </div>
          <h3 
            className="text-sm font-bold transition-colors duration-300"
            style={{ color: timerStyles.textColor }}
          >
            ⏰ Tiempo de Examen
          </h3>
        </div>
      </div>

      <div className="space-y-3">
        {/* Time Left - Main Display */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <span 
              className="text-xs font-medium transition-colors duration-300"
              style={{ color: timerStyles.textColor }}
            >
              ⏳ Tiempo restante
            </span>
            <div
              className={`w-3 h-3 rounded-full shadow-sm transition-colors duration-300 ${
                timeLeft !== undefined && timeLeft <= 900 ? 'animate-pulse' : ''
              }`}
              style={{ backgroundColor: timerStyles.dotColor }}
            />
          </div>
          <div 
            className="text-2xl font-black tracking-wider drop-shadow-lg transition-colors duration-300"
            style={{ color: timerStyles.color }}
          >
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Time Spent - Secondary Display */}
        <div 
          className="flex justify-between items-center rounded-lg px-3 py-2 transition-colors duration-300"
          style={{ 
            backgroundColor: 'var(--theme-bg-primary)',
            border: '1px solid var(--theme-border-primary)'
          }}
        >
          <span 
            className="text-xs font-medium flex items-center transition-colors duration-300"
            style={{ color: timerStyles.textColor }}
          >
            <i 
              className="fas fa-hourglass-half mr-1 transition-colors duration-300"
              style={{ color: timerStyles.iconColor }}
            ></i>
            Transcurrido
          </span>
          <span 
            className="text-sm font-bold transition-colors duration-300"
            style={{ color: timerStyles.textColor }}
          >
            {formatTime(timeSpent)}
          </span>
        </div>

        {/* Status indicator with emoji */}
        <div 
          className="flex items-center justify-center space-x-2 rounded-lg px-3 py-1 transition-colors duration-300"
          style={{ 
            backgroundColor: 'var(--theme-bg-primary)',
            border: '1px solid var(--theme-border-primary)'
          }}
        >
          <span className="text-sm">
            {isSubmitted
              ? '🏁'
              : timeLeft !== undefined && timeLeft <= 300
              ? '🚨'
              : timeLeft !== undefined && timeLeft <= 900
              ? '⚠️'
              : '🚀'}
          </span>
          <span 
            className="text-xs font-medium transition-colors duration-300"
            style={{ color: timerStyles.textColor }}
          >
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
          <div 
            className="mt-3 p-2 rounded-lg animate-pulse transition-colors duration-300"
            style={{
              background: 'linear-gradient(90deg, var(--theme-error-light), #fecaca)',
              border: '1px solid var(--theme-error)'
            }}
          >
            <div 
              className="flex items-center justify-center transition-colors duration-300"
              style={{ color: 'var(--theme-error)' }}
            >
              <span className="text-sm font-bold animate-bounce">
                🚨 ¡Solo {Math.floor(timeLeft / 60)} minutos! 🚨
              </span>
            </div>
          </div>
        )}
        
        {/* Encouragement for good time */}
        {timeLeft !== undefined && timeLeft > 1800 && !isSubmitted && (
          <div className="mt-2 text-center">
            <span 
              className="text-xs transition-colors duration-300"
              style={{ color: timerStyles.textColor }}
            >
              🌟 ¡Tienes tiempo suficiente! 🌟
            </span>
          </div>
        )}
      </div>
    </div>
  );
};