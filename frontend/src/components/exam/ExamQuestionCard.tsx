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
  const getAnswerButtonStyles = (optionIndex: number) => {
    const baseClasses = "w-full text-left p-4 border-2 rounded-lg transition-all duration-200 hover:shadow-md";
    
    if (!isSubmitted) {
      // During exam - mantener colores azules del diseño original
      if (selectedAnswer === optionIndex) {
        return {
          classes: baseClasses,
          styles: {
            borderColor: 'var(--primary)',
            backgroundColor: 'var(--theme-info-light)',
            color: 'var(--primary)'
          }
        };
      }
      return {
        classes: `${baseClasses} hover:shadow-md`,
        styles: {
          borderColor: 'var(--theme-border-primary)',
          backgroundColor: 'var(--theme-bg-primary)',
          color: 'var(--theme-text-primary)'
        },
        hoverStyles: {
          borderColor: 'var(--theme-border-secondary)',
          backgroundColor: 'var(--theme-bg-secondary)'
        }
      };
    } else {
      // After submission - mantener los colores verde/rojo del diseño original
      const isCorrect = question.correcta === optionIndex;
      const isSelected = selectedAnswer === optionIndex;
      
      if (isCorrect) {
        return {
          classes: baseClasses,
          styles: {
            borderColor: 'var(--secondary)', // Verde para correctas
            backgroundColor: 'var(--theme-success-light)',
            color: 'var(--secondary)'
          }
        };
      } else if (isSelected) {
        return {
          classes: baseClasses,
          styles: {
            borderColor: 'var(--theme-error)',
            backgroundColor: 'var(--theme-error-light)',
            color: 'var(--theme-error)'
          }
        };
      }
      return {
        classes: baseClasses,
        styles: {
          borderColor: 'var(--theme-border-primary)',
          backgroundColor: 'var(--theme-bg-secondary)',
          color: 'var(--theme-text-secondary)'
        }
      };
    }
  };

  const getAnswerIcon = (optionIndex: number) => {
    if (!isSubmitted) {
      return selectedAnswer === optionIndex ? (
        <i 
          className="fas fa-check-circle" 
          style={{ color: 'var(--primary)' }}
        ></i>
      ) : (
        <i 
          className="far fa-circle" 
          style={{ color: 'var(--theme-text-secondary)' }}
        ></i>
      );
    } else {
      const isCorrect = question.correcta === optionIndex;
      const isSelected = selectedAnswer === optionIndex;
      
      if (isCorrect) {
        return <i 
          className="fas fa-check-circle" 
          style={{ color: 'var(--secondary)' }}
        ></i>;
      } else if (isSelected) {
        return <i 
          className="fas fa-times-circle" 
          style={{ color: 'var(--theme-error)' }}
        ></i>;
      }
      return <i 
        className="far fa-circle" 
        style={{ color: 'var(--theme-text-secondary)' }}
      ></i>;
    }
  };

  return (
    <div 
      className="rounded-xl p-6 space-y-6 transition-colors duration-300"
      style={{
        backgroundColor: 'var(--theme-bg-primary)',
        boxShadow: 'var(--theme-shadow-md)'
      }}
    >
      {/* Question Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onScrollToOverview}
              className="inline-flex items-center px-4 py-2 rounded-full text-base font-semibold transition-all duration-200 cursor-pointer"
              style={{
                backgroundColor: 'var(--theme-info-light)',
                color: 'var(--primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--theme-info-light)';
                e.currentTarget.style.color = 'var(--primary)';
              }}
              title="Ver en Vista General de Preguntas"
            >
              <i className="fas fa-external-link-alt mr-2 text-sm"></i>
              Pregunta {questionIndex + 1} de {totalQuestions}
            </button>
            
            {/* Star Button - Right Side with Circular Container */}
            <button
              onClick={onTogglePin}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 border"
              style={{
                backgroundColor: isPinned ? '#fbbf24' : 'var(--theme-bg-primary)', // Amarillo más visible para dark mode
                color: isPinned ? 'white' : 'var(--theme-text-secondary)',
                borderColor: isPinned ? '#f59e0b' : 'var(--theme-border-primary)' // Borde para mejor definición
              }}
              onMouseEnter={(e) => {
                if (isPinned) {
                  e.currentTarget.style.backgroundColor = '#f59e0b'; // Amarillo más oscuro
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.borderColor = '#d97706';
                } else {
                  e.currentTarget.style.backgroundColor = '#fbbf24'; // Preview amarillo en hover
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.borderColor = '#f59e0b';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isPinned ? '#fbbf24' : 'var(--theme-bg-primary)';
                e.currentTarget.style.color = isPinned ? 'white' : 'var(--theme-text-secondary)';
                e.currentTarget.style.borderColor = isPinned ? '#f59e0b' : 'var(--theme-border-primary)';
              }}
              title={isPinned ? 'Desfijar pregunta' : 'Fijar pregunta'}
            >
              <i className={`${isPinned ? 'fas fa-star' : 'far fa-star'} text-lg`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Answer Status (above question) */}
      {isSubmitted && (
        <div className="mb-4">
          {selectedAnswer !== undefined ? (
            selectedAnswer === question.correcta ? (
              <div 
                className="flex items-center space-x-2 p-3 rounded-lg border transition-colors duration-300"
                style={{
                  backgroundColor: 'var(--theme-success-light)',
                  borderColor: 'var(--secondary)', // Verde del diseño original
                  color: 'var(--secondary)'
                }}
              >
                <i className="fas fa-check-circle"></i>
                <span className="text-sm font-medium">Respuesta correcta</span>
              </div>
            ) : (
              <div 
                className="flex items-center space-x-2 p-3 rounded-lg border transition-colors duration-300"
                style={{
                  backgroundColor: 'var(--theme-error-light)',
                  borderColor: 'var(--theme-error)',
                  color: 'var(--theme-error)'
                }}
              >
                <i className="fas fa-times-circle"></i>
                <span className="text-sm font-medium">Respuesta incorrecta</span>
              </div>
            )
          ) : (
            <div 
              className="flex items-center space-x-2 p-3 rounded-lg border transition-colors duration-300"
              style={{
                backgroundColor: 'var(--theme-bg-accent)',
                borderColor: 'var(--theme-border-primary)',
                color: 'var(--theme-text-secondary)'
              }}
            >
              <i className="fas fa-question-circle"></i>
              <span className="text-sm font-medium">Sin respuesta</span>
            </div>
          )}
        </div>
      )}

      {/* Question Text */}
      <div className="prose prose-lg max-w-none">
        <h2 
          className="text-xl font-semibold leading-relaxed transition-colors duration-300"
          style={{ color: 'var(--theme-text-primary)' }}
        >
          {question.pregunta}
        </h2>
      </div>

      {/* Answer Options */}
      {question.opciones && (
        <div className="space-y-3">
          {question.opciones.map((option, index) => {
            const buttonConfig = getAnswerButtonStyles(index);
            return (
              <button
                key={index}
                onClick={() => !isSubmitted && onAnswerSelect(index)}
                disabled={isSubmitted}
                className={buttonConfig.classes}
                style={buttonConfig.styles}
                onMouseEnter={(e) => {
                  if (buttonConfig.hoverStyles) {
                    Object.assign(e.currentTarget.style, buttonConfig.hoverStyles);
                  }
                }}
                onMouseLeave={(e) => {
                  if (buttonConfig.hoverStyles) {
                    Object.assign(e.currentTarget.style, buttonConfig.styles);
                  }
                }}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getAnswerIcon(index)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span 
                        className="font-medium text-sm transition-colors duration-300"
                        style={{ color: 'var(--theme-text-muted)' }}
                      >
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className="text-sm">
                        {option}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Navigation Hint */}
      {!isSubmitted && (
        <div className="mt-6 text-center">
          <div 
            className="text-xs transition-colors duration-300"
            style={{ color: 'var(--theme-text-secondary)' }}
          >
            ← → para navegar | 1-4 para responder
          </div>
        </div>
      )}

      {/* Keyboard Hint */}
      {!isSubmitted && (
        <div 
          className="mt-4 p-3 rounded-lg transition-colors duration-300"
          style={{
            backgroundColor: 'var(--theme-bg-accent)',
          }}
        >
          <p 
            className="text-xs transition-colors duration-300"
            style={{ color: 'var(--theme-text-secondary)' }}
          >
            💡 <strong>Tip:</strong> Usa las teclas 1-4 para seleccionar respuestas rápidamente
          </p>
        </div>
      )}

      {/* Feedback Section */}
      {isSubmitted && feedback && showFeedback && (
        <div 
          className="mt-6 p-4 border rounded-lg transition-colors duration-300"
          style={{
            backgroundColor: 'var(--theme-info-light)',
            borderColor: 'var(--primary)' // Azul del diseño original
          }}
        >
          <div className="flex items-start space-x-2">
            <i 
              className="fas fa-lightbulb mt-0.5"
              style={{ color: 'var(--primary)' }}
            ></i>
            <div>
              <h4 
                className="text-sm font-semibold mb-1 transition-colors duration-300"
                style={{ color: 'var(--primary)' }}
              >
                Retroalimentación
              </h4>
              <p 
                className="text-sm transition-colors duration-300"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                {feedback}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
});