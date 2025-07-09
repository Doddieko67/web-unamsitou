import React, { memo } from 'react';

interface ExamProgressBarProps {
  currentQuestion: number;
  totalQuestions: number;
  answeredQuestions: number;
  className?: string;
}

/**
 * Pure progress bar component
 * Shows exam completion progress
 */
export const ExamProgressBar: React.FC<ExamProgressBarProps> = memo(({
  currentQuestion,
  totalQuestions,
  answeredQuestions,
  className = '',
}) => {
  const progressPercentage = totalQuestions > 0 
    ? ((currentQuestion + 1) / totalQuestions) * 100 
    : 0;
    
  const answeredPercentage = totalQuestions > 0 
    ? (answeredQuestions / totalQuestions) * 100 
    : 0;

  return (
    <div 
      className={`rounded-2xl p-4 transition-colors duration-300 ${className}`}
      style={{
        background: 'linear-gradient(135deg, var(--theme-info-light), var(--theme-bg-accent))',
        border: '1px solid var(--theme-border-primary)'
      }}
    >
      {/* Header with Progress Info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <i className="fas fa-tasks text-white text-sm"></i>
          </div>
          <div>
            <h3 
              className="text-sm font-semibold transition-colors duration-300"
              style={{ color: 'var(--theme-text-primary)' }}
            >
              📊 Progreso del Examen
            </h3>
          </div>
        </div>
        <div className="text-right">
          <div 
            className="text-lg font-bold transition-colors duration-300"
            style={{ color: 'var(--primary)' }}
          >
            {currentQuestion + 1}/{totalQuestions}
          </div>
          <div 
            className="text-xs transition-colors duration-300"
            style={{ color: 'var(--theme-text-secondary)' }}
          >
            preguntas
          </div>
        </div>
      </div>

      {/* Modern Progress Bar */}
      <div className="relative mb-3">
        {/* Background Bar */}
        <div 
          className="w-full rounded-full h-4 overflow-hidden transition-colors duration-300"
          style={{ 
            backgroundColor: 'var(--theme-bg-secondary)',
            border: '1px solid var(--theme-border-primary)'
          }}
        >
          {/* Answered Progress - Gradient */}
          <div
            className="h-4 rounded-full transition-all duration-500 ease-out relative"
            style={{ 
              width: `${answeredPercentage}%`,
              background: 'linear-gradient(90deg, var(--secondary), var(--theme-success))'
            }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
          </div>
          
          {/* Current Position Indicator */}
          <div
            className="absolute top-0 h-4 w-1 transition-all duration-500 ease-out shadow-lg"
            style={{ 
              left: `${Math.max(0, progressPercentage - 0.5)}%`,
              backgroundColor: 'var(--primary)'
            }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div 
          className="rounded-lg px-3 py-2 transition-colors duration-300"
          style={{ 
            backgroundColor: 'var(--theme-bg-primary)',
            border: '1px solid var(--theme-border-primary)'
          }}
        >
          <div 
            className="text-sm font-bold transition-colors duration-300"
            style={{ color: 'var(--theme-text-primary)' }}
          >
            {answeredQuestions}
          </div>
          <div 
            className="text-xs transition-colors duration-300"
            style={{ color: 'var(--theme-text-secondary)' }}
          >
            Respondidas
          </div>
        </div>
        <div 
          className="rounded-lg px-3 py-2 transition-colors duration-300"
          style={{ 
            backgroundColor: 'var(--theme-bg-primary)',
            border: '1px solid var(--theme-border-primary)'
          }}
        >
          <div 
            className="text-sm font-bold transition-colors duration-300"
            style={{ color: 'var(--primary)' }}
          >
            {Math.round(progressPercentage)}%
          </div>
          <div 
            className="text-xs transition-colors duration-300"
            style={{ color: 'var(--theme-text-secondary)' }}
          >
            Progreso
          </div>
        </div>
        <div 
          className="rounded-lg px-3 py-2 transition-colors duration-300"
          style={{ 
            backgroundColor: 'var(--theme-bg-primary)',
            border: '1px solid var(--theme-border-primary)'
          }}
        >
          <div 
            className="text-sm font-bold transition-colors duration-300"
            style={{ color: 'var(--secondary)' }}
          >
            {Math.round(answeredPercentage)}%
          </div>
          <div 
            className="text-xs transition-colors duration-300"
            style={{ color: 'var(--theme-text-secondary)' }}
          >
            Completado
          </div>
        </div>
      </div>
    </div>
  );
});