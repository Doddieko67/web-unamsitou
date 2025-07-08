import React from 'react';

interface Question {
  id?: number;
  pregunta: string;
  opciones?: string[];
  correcta?: number;
  respuesta?: number;
}

interface ExamQuestionCardsProps {
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: { [key: number]: number };
  pinnedQuestions: { [key: number]: boolean };
  feedback: { [key: number]: string };
  isSubmitted: boolean;
  onQuestionSelect: (index: number) => void;
  onTogglePin: (index: number) => void;
}

/**
 * Simple grid of question cards without complex state management
 * Displays all questions as clickable cards with status indicators
 */
export const ExamQuestionCards: React.FC<ExamQuestionCardsProps> = ({
  questions,
  currentQuestionIndex,
  userAnswers,
  pinnedQuestions,
  feedback,
  isSubmitted,
  onQuestionSelect,
  onTogglePin,
}) => {
  
  // Simple stats calculation
  const answeredCount = Object.keys(userAnswers).length;
  const unansweredCount = questions.length - answeredCount;
  const pinnedCount = Object.keys(pinnedQuestions).length;

  const getCardStyles = (index: number) => {
    const isAnswered = userAnswers[index] !== undefined;
    const isPinned = pinnedQuestions[index];
    const isCurrent = index === currentQuestionIndex;
    const question = questions[index];
    const isCorrect = isAnswered && question.correcta !== undefined && 
                     userAnswers[index] === question.correcta;
    
    const baseStyles = {
      position: 'relative' as const,
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      border: '2px solid',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    };
    
    if (isCurrent) {
      return {
        ...baseStyles,
        borderColor: 'var(--primary)',
        backgroundColor: 'var(--theme-info-light)',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 4px rgba(99, 102, 241, 0.1)'
      };
    } else if (isPinned) {
      return {
        ...baseStyles,
        borderColor: '#a855f7', // Purple-500 para mantener diseño original
        backgroundColor: 'var(--theme-bg-primary)' // Adaptativo para dark mode
      };
    } else if (isAnswered) {
      if (isSubmitted) {
        if (isCorrect) {
          return {
            ...baseStyles,
            borderColor: 'var(--secondary)', // Verde para correctas
            backgroundColor: 'var(--theme-success-light)'
          };
        } else {
          return {
            ...baseStyles,
            borderColor: 'var(--theme-error)', // Rojo para incorrectas
            backgroundColor: 'var(--theme-error-light)'
          };
        }
      } else {
        return {
          ...baseStyles,
          borderColor: 'var(--primary)', // Azul para contestadas
          backgroundColor: 'var(--theme-info-light)'
        };
      }
    } else {
      return {
        ...baseStyles,
        borderColor: 'var(--theme-border-primary)',
        backgroundColor: 'var(--theme-bg-secondary)'
      };
    }
  };

  const getHoverStyles = (index: number) => {
    const isAnswered = userAnswers[index] !== undefined;
    const isPinned = pinnedQuestions[index];
    const isCurrent = index === currentQuestionIndex;
    const question = questions[index];
    const isCorrect = isAnswered && question.correcta !== undefined && 
                     userAnswers[index] === question.correcta;
    
    if (isCurrent) return { transform: 'scale(1.05)' };
    
    if (isPinned) {
      return { borderColor: '#9333ea' }; // Purple-600
    } else if (isAnswered) {
      if (isSubmitted) {
        return isCorrect 
          ? { borderColor: 'var(--secondary)' }
          : { borderColor: 'var(--theme-error)' };
      } else {
        return { borderColor: 'var(--primary)' };
      }
    } else {
      return { borderColor: 'var(--theme-border-secondary)' };
    }
  };

  const getNumberStyles = (index: number) => {
    const isAnswered = userAnswers[index] !== undefined;
    const isPinned = pinnedQuestions[index];
    const isCurrent = index === currentQuestionIndex;
    const question = questions[index];
    const isCorrect = isAnswered && question.correcta !== undefined && 
                     userAnswers[index] === question.correcta;
    
    if (isCurrent) {
      return {
        backgroundColor: 'var(--primary)',
        color: 'white'
      };
    } else if (isPinned) {
      return {
        backgroundColor: '#9333ea', // Purple-600 para mantener diseño original
        color: 'white'
      };
    } else if (isAnswered) {
      if (isSubmitted) {
        if (isCorrect) {
          return {
            backgroundColor: 'var(--secondary)', // Verde para correctas
            color: 'white'
          };
        } else {
          return {
            backgroundColor: 'var(--theme-error)', // Rojo para incorrectas
            color: 'white'
          };
        }
      } else {
        return {
          backgroundColor: 'var(--primary)', // Azul para contestadas
          color: 'white'
        };
      }
    } else {
      return {
        backgroundColor: 'var(--theme-text-tertiary)',
        color: 'white'
      };
    }
  };

  const handleQuestionClick = (index: number) => {
    onQuestionSelect(index);
  };

  const handlePinToggle = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    onTogglePin(index);
  };

  // Filter pinned questions
  const pinnedQuestionsList = questions.filter((_, index) => pinnedQuestions[index]);
  const pinnedIndices = Object.keys(pinnedQuestions).map(Number).filter(index => pinnedQuestions[index]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 
          className="text-lg font-semibold transition-colors duration-300"
          style={{ color: 'var(--theme-text-primary)' }}
        >
          Vista General de Preguntas
        </h3>
        <div 
          className="flex items-center space-x-4 text-sm transition-colors duration-300"
          style={{ color: 'var(--theme-text-secondary)' }}
        >
          <div className="flex items-center space-x-1">
            <div 
              className="w-3 h-3 border rounded transition-colors duration-300"
              style={{ 
                backgroundColor: 'var(--theme-info-light)', 
                borderColor: 'var(--primary)' 
              }}
            ></div>
            <span>Contestadas ({answeredCount})</span>
          </div>
          <div className="flex items-center space-x-1">
            <div 
              className="w-3 h-3 border rounded transition-colors duration-300"
              style={{ 
                backgroundColor: 'var(--theme-bg-secondary)', 
                borderColor: 'var(--theme-border-primary)' 
              }}
            ></div>
            <span>Sin contestar ({unansweredCount})</span>
          </div>
          <div className="flex items-center space-x-1">
            <div 
              className="w-3 h-3 border rounded transition-colors duration-300"
              style={{ 
                backgroundColor: 'var(--theme-bg-primary)', 
                borderColor: '#a855f7' 
              }}
            ></div>
            <span>Fijadas ({pinnedCount})</span>
          </div>
        </div>
      </div>

      {/* Pinned Questions Section */}
      {pinnedCount > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <h4 
              className="text-md font-semibold transition-colors duration-300"
              style={{ color: '#7c3aed' }}
            >
              <i className="fas fa-star mr-2" style={{ color: '#eab308' }}></i>
              Preguntas Fijadas ({pinnedCount})
            </h4>
          </div>
          
          <div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4 rounded-lg border transition-colors duration-300"
            style={{
              backgroundColor: 'var(--theme-bg-secondary)',
              borderColor: '#a855f7' // Purple-500 para mantener identidad visual
            }}
          >
            {pinnedIndices.map((originalIndex) => {
              const question = questions[originalIndex];
              const isAnswered = userAnswers[originalIndex] !== undefined;
              const isPinned = true; // Always true in this section
              const isCurrent = originalIndex === currentQuestionIndex;
              const isCorrect = isAnswered && question.correcta !== undefined && 
                               userAnswers[originalIndex] === question.correcta;
              const hasFeedback = feedback[originalIndex] || (question.id && feedback[question.id]);

              return (
                <div
                  key={originalIndex}
                  style={getCardStyles(originalIndex)}
                  onClick={() => handleQuestionClick(originalIndex)}
                  data-question-index={originalIndex}
                  onMouseEnter={(e) => {
                    const hoverStyles = getHoverStyles(originalIndex);
                    Object.assign(e.currentTarget.style, hoverStyles);
                  }}
                  onMouseLeave={(e) => {
                    Object.assign(e.currentTarget.style, getCardStyles(originalIndex));
                  }}
                >
                  {/* Question Number and Pin Button */}
                  <div className="flex items-center justify-between mb-2">
                    <span 
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors duration-300"
                      style={getNumberStyles(originalIndex)}
                    >
                      {originalIndex + 1}
                    </span>
                    
                    {/* Pin Button - Always filled in pinned section */}
                    <button
                      onClick={(e) => handlePinToggle(e, originalIndex)}
                      className="w-8 h-8 rounded-full text-sm bg-yellow-500 text-white hover:bg-yellow-600 flex items-center justify-center transition-colors"
                      title="Desfijar pregunta"
                    >
                      <i className="fas fa-star"></i>
                    </button>
                  </div>

                  {/* Question Preview */}
                  <div className="space-y-2">
                    <p 
                      className="text-xs line-clamp-2 leading-relaxed transition-colors duration-300"
                      style={{ color: 'var(--theme-text-primary)' }}
                    >
                      {question.pregunta.substring(0, 80)}
                      {question.pregunta.length > 80 ? '...' : ''}
                    </p>
                    
                    {/* Answer Preview */}
                    {isAnswered && (
                      <div className="text-xs">
                        <span 
                          className="transition-colors duration-300"
                          style={{ color: 'var(--theme-text-secondary)' }}
                        >
                          Respuesta: 
                        </span>
                        <span 
                          className="font-medium transition-colors duration-300"
                          style={{
                            color: isSubmitted 
                              ? isCorrect ? 'var(--secondary)' : 'var(--theme-error)'
                              : 'var(--primary)'
                          }}
                        >
                          {question.opciones?.[userAnswers[originalIndex]]?.substring(0, 30) || 'N/A'}
                          {(question.opciones?.[userAnswers[originalIndex]]?.length || 0) > 30 ? '...' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Questions Section */}
      <div className="space-y-4">
        <h4 
          className="text-md font-semibold transition-colors duration-300"
          style={{ color: 'var(--theme-text-primary)' }}
        >
          <i 
            className="fas fa-list mr-2 transition-colors duration-300"
            style={{ color: 'var(--theme-text-secondary)' }}
          ></i>
          Todas las Preguntas ({questions.length})
        </h4>

        {/* Question Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {questions.map((question, index) => {
          const isAnswered = userAnswers[index] !== undefined;
          const isPinned = pinnedQuestions[index];
          const isCurrent = index === currentQuestionIndex;
          const isCorrect = isAnswered && question.correcta !== undefined && 
                           userAnswers[index] === question.correcta;
          const hasFeedback = feedback[index] || (question.id && feedback[question.id]);

          return (
            <div
              key={index}
              style={getCardStyles(index)}
              onClick={() => handleQuestionClick(index)}
              data-question-index={index}
              onMouseEnter={(e) => {
                const hoverStyles = getHoverStyles(index);
                Object.assign(e.currentTarget.style, hoverStyles);
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, getCardStyles(index));
              }}
            >
              {/* Question Number and Pin Button */}
              <div className="flex items-center justify-between mb-2">
                <span 
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors duration-300"
                  style={getNumberStyles(index)}
                >
                  {index + 1}
                </span>
                
                {/* Pin Button - More prominent */}
                <button
                  onClick={(e) => handlePinToggle(e, index)}
                  className={`w-8 h-8 rounded-full text-sm ${
                    isPinned
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                      : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                  } flex items-center justify-center transition-colors`}
                  title={isPinned ? 'Desfijar pregunta' : 'Fijar pregunta'}
                >
                  <i className={isPinned ? 'fas fa-star' : 'far fa-star'}></i>
                </button>
              </div>

              {/* Question Preview */}
              <div className="space-y-2">
                <p 
                  className="text-xs line-clamp-2 leading-relaxed transition-colors duration-300"
                  style={{ color: 'var(--theme-text-primary)' }}
                >
                  {question.pregunta.substring(0, 80)}
                  {question.pregunta.length > 80 ? '...' : ''}
                </p>
                
                {/* Answer Preview */}
                {isAnswered && (
                  <div className="text-xs">
                    <span 
                      className="transition-colors duration-300"
                      style={{ color: 'var(--theme-text-secondary)' }}
                    >
                      Respuesta: 
                    </span>
                    <span 
                      className="font-medium transition-colors duration-300"
                      style={{
                        color: isSubmitted 
                          ? isCorrect ? 'var(--secondary)' : 'var(--theme-error)'
                          : 'var(--primary)'
                      }}
                    >
                      {question.opciones?.[userAnswers[index]]?.substring(0, 30) || 'N/A'}
                      {(question.opciones?.[userAnswers[index]]?.length || 0) > 30 ? '...' : ''}
                    </span>
                  </div>
                )}

              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* Quick Stats */}
      <div 
        className="grid grid-cols-3 gap-4 p-4 rounded-lg transition-colors duration-300"
        style={{ backgroundColor: 'var(--theme-bg-secondary)' }}
      >
        <div className="text-center">
          <div 
            className="text-2xl font-bold transition-colors duration-300"
            style={{ color: 'var(--theme-text-primary)' }}
          >
            {answeredCount}
          </div>
          <div 
            className="text-sm transition-colors duration-300"
            style={{ color: 'var(--theme-text-secondary)' }}
          >
            Contestadas
          </div>
        </div>
        <div className="text-center">
          <div 
            className="text-2xl font-bold transition-colors duration-300"
            style={{ color: 'var(--theme-text-primary)' }}
          >
            {unansweredCount}
          </div>
          <div 
            className="text-sm transition-colors duration-300"
            style={{ color: 'var(--theme-text-secondary)' }}
          >
            Pendientes
          </div>
        </div>
        <div className="text-center">
          <div 
            className="text-2xl font-bold transition-colors duration-300"
            style={{ color: '#7c3aed' }}
          >
            {pinnedCount}
          </div>
          <div 
            className="text-sm transition-colors duration-300"
            style={{ color: 'var(--theme-text-secondary)' }}
          >
            Fijadas
          </div>
        </div>
      </div>
    </div>
  );
};