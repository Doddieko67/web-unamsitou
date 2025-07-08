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
  onScrollToOverview?: () => void;
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
  onScrollToOverview,
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
    <div className="bg-white rounded-xl p-6 space-y-6">
      {/* Question Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onScrollToOverview}
              className="inline-flex items-center px-4 py-2 rounded-full text-base font-semibold bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
              title="Ver en Vista General de Preguntas"
            >
              <i className="fas fa-external-link-alt mr-2 text-sm"></i>
              Pregunta {questionIndex + 1} de {totalQuestions}
            </button>
            
            {/* Star Button - Right Side with Circular Container */}
            <button
              onClick={onTogglePin}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                isPinned
                  ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              title={isPinned ? 'Desfijar pregunta' : 'Fijar pregunta'}
            >
              <i className={`${isPinned ? 'fas fa-star' : 'far fa-star'} text-lg`}></i>
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

      {/* Navigation Hint */}
      {!isSubmitted && (
        <div className="mt-6 text-center">
          <div className="text-xs text-gray-500">
            ← → para navegar | 1-4 para responder
          </div>
        </div>
      )}

      {/* Keyboard Hint */}
      {!isSubmitted && (
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
        <div className="mt-4">
          {selectedAnswer !== undefined ? (
            selectedAnswer === question.correcta ? (
              <div className="flex items-center space-x-2 text-green-800 bg-green-100 border border-green-200 p-3 rounded-lg">
                <i className="fas fa-check-circle"></i>
                <span className="text-sm font-medium">Respuesta correcta</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-red-800 bg-red-100 border border-red-200 p-3 rounded-lg">
                <i className="fas fa-times-circle"></i>
                <span className="text-sm font-medium">Respuesta incorrecta</span>
              </div>
            )
          ) : (
            <div className="flex items-center space-x-2 text-gray-700 bg-gray-100 border border-gray-200 p-3 rounded-lg">
              <i className="fas fa-question-circle"></i>
              <span className="text-sm font-medium">Sin respuesta</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});