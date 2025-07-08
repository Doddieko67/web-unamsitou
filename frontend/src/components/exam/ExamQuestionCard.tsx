import React, { memo } from 'react';

interface Question {
  id?: number;
  pregunta: string;
  opciones?: string[];
  correcta?: number;
  respuesta?: number;
  feedback?: string;
}

interface ExamQuestionCardProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  selectedAnswer?: number;
  isSubmitted: boolean;
  feedback?: string;
  isPinned: boolean;
  onAnswerSelect: (answerIndex: number) => void;
  onTogglePin: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
  showFeedback?: boolean;
}

/**
 * Pure question card component
 * Displays a single question with its options and handles answer selection
 */
export const ExamQuestionCard: React.FC<ExamQuestionCardProps> = memo(({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  isSubmitted,
  feedback,
  isPinned,
  onAnswerSelect,
  onTogglePin,
  onPrevious,
  onNext,
  canGoPrevious = false,
  canGoNext = false,
  showFeedback = true,
}) => {
  const getAnswerButtonClass = (optionIndex: number) => {
    const baseClass = "w-full text-left p-4 border-2 rounded-lg transition-all duration-200 hover:shadow-md";
    
    if (!isSubmitted) {
      // During exam
      if (selectedAnswer === optionIndex) {
        return `${baseClass} border-blue-500 bg-blue-50 text-blue-900`;
      }
      return `${baseClass} border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50`;
    } else {
      // After submission
      const isCorrect = question.correcta === optionIndex;
      const isSelected = selectedAnswer === optionIndex;
      
      if (isCorrect && isSelected) {
        return `${baseClass} border-green-500 bg-green-50 text-green-900`;
      } else if (isCorrect) {
        return `${baseClass} border-green-500 bg-green-50 text-green-900`;
      } else if (isSelected) {
        return `${baseClass} border-red-500 bg-red-50 text-red-900`;
      }
      return `${baseClass} border-gray-200 bg-gray-50 text-gray-600`;
    }
  };

  const getAnswerIcon = (optionIndex: number) => {
    if (!isSubmitted) {
      return selectedAnswer === optionIndex ? (
        <i className="fas fa-check-circle text-blue-500"></i>
      ) : (
        <i className="far fa-circle text-gray-400"></i>
      );
    } else {
      const isCorrect = question.correcta === optionIndex;
      const isSelected = selectedAnswer === optionIndex;
      
      if (isCorrect) {
        return <i className="fas fa-check-circle text-green-500"></i>;
      } else if (isSelected) {
        return <i className="fas fa-times-circle text-red-500"></i>;
      }
      return <i className="far fa-circle text-gray-400"></i>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
      {/* Question Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Pregunta {questionIndex + 1} de {totalQuestions}
            </span>
            <button
              onClick={onTogglePin}
              className={`p-1 rounded-full transition-colors ${
                isPinned
                  ? 'text-yellow-500 hover:text-yellow-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title={isPinned ? 'Desfijar pregunta' : 'Fijar pregunta'}
            >
              <i className={isPinned ? 'fas fa-thumbtack' : 'far fa-thumbtack'}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Question Text */}
      <div className="prose prose-lg max-w-none">
        <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
          {question.pregunta}
        </h2>
      </div>

      {/* Answer Options */}
      {question.opciones && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Selecciona tu respuesta:
          </h3>
          {question.opciones.map((option, index) => (
            <button
              key={index}
              onClick={() => !isSubmitted && onAnswerSelect(index)}
              disabled={isSubmitted}
              className={getAnswerButtonClass(index)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getAnswerIcon(index)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm text-gray-500">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="text-sm">
                      {option}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Ergonomic Navigation - Positioned immediately after answers for minimal cursor travel */}
      {(onPrevious || onNext) && (
        <div className="mt-6 flex items-center justify-between">
          {/* Previous Button */}
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious || !onPrevious}
            className={`
              flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105
              ${canGoPrevious && onPrevious
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-lg hover:-translate-x-1'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }
            `}
            title="Pregunta anterior (← tecla)"
          >
            <i className="fas fa-arrow-left"></i>
            <span>Anterior</span>
          </button>

          {/* Question Counter with Navigation Hint */}
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-800">
              {questionIndex + 1} <span className="text-gray-400">de</span> {totalQuestions}
            </div>
            {!isSubmitted && (
              <div className="text-xs text-gray-500 mt-1">
                ← → para navegar | 1-4 para responder
              </div>
            )}
          </div>

          {/* Next Button */}
          <button
            onClick={onNext}
            disabled={!canGoNext || !onNext}
            className={`
              flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105
              ${canGoNext && onNext
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:shadow-lg hover:translate-x-1'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }
            `}
            title="Siguiente pregunta (→ tecla)"
          >
            <span>Siguiente</span>
            <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      )}

      {/* Keyboard Hint (when navigation not available) */}
      {!isSubmitted && !(onPrevious || onNext) && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            💡 <strong>Tip:</strong> Usa las teclas 1-4 para seleccionar respuestas rápidamente
          </p>
        </div>
      )}

      {/* Feedback Section */}
      {isSubmitted && feedback && showFeedback && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <i className="fas fa-lightbulb text-blue-600 mt-0.5"></i>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Retroalimentación
              </h4>
              <p className="text-sm text-blue-800">
                {feedback}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Answer Status */}
      {isSubmitted && (
        <div className="mt-4 p-3 rounded-lg border">
          {selectedAnswer !== undefined ? (
            selectedAnswer === question.correcta ? (
              <div className="flex items-center space-x-2 text-green-700 bg-green-50 border-green-200">
                <i className="fas fa-check-circle"></i>
                <span className="text-sm font-medium">Respuesta correcta</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-red-700 bg-red-50 border-red-200">
                <i className="fas fa-times-circle"></i>
                <span className="text-sm font-medium">Respuesta incorrecta</span>
              </div>
            )
          ) : (
            <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 border-gray-200">
              <i className="fas fa-question-circle"></i>
              <span className="text-sm font-medium">Sin respuesta</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});