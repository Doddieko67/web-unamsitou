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
    <div className={`space-y-3 ${className}`}>
      {/* Progress Labels */}
      <div className="flex justify-between text-sm text-gray-600">
        <span>
          Pregunta {currentQuestion + 1} de {totalQuestions}
        </span>
        <span>
          {answeredQuestions} respondidas
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="relative">
        {/* Background Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          {/* Answered Progress */}
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${answeredPercentage}%` }}
          />
          
          {/* Current Position Indicator */}
          <div
            className="absolute top-0 h-3 w-1 bg-blue-600 rounded-full transition-all duration-300 ease-out"
            style={{ left: `${Math.max(0, progressPercentage - 0.5)}%` }}
          />
        </div>
      </div>

      {/* Progress Stats */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>
          Progreso: {Math.round(progressPercentage)}%
        </span>
        <span>
          Completadas: {Math.round(answeredPercentage)}%
        </span>
      </div>
    </div>
  );
});