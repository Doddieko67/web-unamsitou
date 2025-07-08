import React, { memo } from 'react';

interface ExamNavigationPanelProps {
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  isSubmitted: boolean;
  currentIndex: number;
  totalQuestions: number;
}

/**
 * Pure navigation panel component
 * Handles question navigation controls
 */
export const ExamNavigationPanel: React.FC<ExamNavigationPanelProps> = memo(({
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  isSubmitted,
  currentIndex,
  totalQuestions,
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white border-t border-gray-200">
      {/* Previous Button */}
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
          ${canGoPrevious
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        <i className="fas fa-arrow-left"></i>
        <span>Anterior</span>
      </button>

      {/* Question Counter */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">
          {currentIndex + 1} de {totalQuestions}
        </span>
        {!isSubmitted && (
          <div className="text-xs text-gray-500">
            (Use ← → para navegar)
          </div>
        )}
      </div>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={!canGoNext}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
          ${canGoNext
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:shadow-md'
            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        <span>Siguiente</span>
        <i className="fas fa-arrow-right"></i>
      </button>
    </div>
  );
});