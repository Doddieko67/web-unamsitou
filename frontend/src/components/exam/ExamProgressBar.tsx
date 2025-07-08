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
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 ${className}`}>
      {/* Header with Progress Info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center">
            <i className="fas fa-chart-line text-blue-600 text-sm"></i>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              📊 Progreso del Examen
            </h3>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-blue-600">
            {currentQuestion + 1}/{totalQuestions}
          </div>
          <div className="text-xs text-gray-600">preguntas</div>
        </div>
      </div>

      {/* Modern Progress Bar */}
      <div className="relative mb-3">
        {/* Background Bar */}
        <div className="w-full bg-gray-200 bg-opacity-60 rounded-full h-4 overflow-hidden">
          {/* Answered Progress - Gradient */}
          <div
            className="bg-gradient-to-r from-green-400 to-emerald-500 h-4 rounded-full transition-all duration-500 ease-out relative"
            style={{ width: `${answeredPercentage}%` }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
          </div>
          
          {/* Current Position Indicator */}
          <div
            className="absolute top-0 h-4 w-1 bg-blue-500 transition-all duration-500 ease-out shadow-lg"
            style={{ left: `${Math.max(0, progressPercentage - 0.5)}%` }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-white bg-opacity-70 rounded-lg px-3 py-2">
          <div className="text-sm font-bold text-gray-800">{answeredQuestions}</div>
          <div className="text-xs text-gray-600">Respondidas</div>
        </div>
        <div className="bg-white bg-opacity-70 rounded-lg px-3 py-2">
          <div className="text-sm font-bold text-blue-600">{Math.round(progressPercentage)}%</div>
          <div className="text-xs text-gray-600">Progreso</div>
        </div>
        <div className="bg-white bg-opacity-70 rounded-lg px-3 py-2">
          <div className="text-sm font-bold text-emerald-600">{Math.round(answeredPercentage)}%</div>
          <div className="text-xs text-gray-600">Completado</div>
        </div>
      </div>
    </div>
  );
});