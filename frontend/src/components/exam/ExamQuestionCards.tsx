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
  const feedbackCount = Object.keys(feedback).length;

  const getCardClass = (index: number) => {
    const isAnswered = userAnswers[index] !== undefined;
    const isPinned = pinnedQuestions[index];
    const isCurrent = index === currentQuestionIndex;
    const question = questions[index];
    const isCorrect = isAnswered && question.correcta !== undefined && 
                     userAnswers[index] === question.correcta;
    
    let classes = "relative px-4 py-3 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-md";
    
    if (isCurrent) {
      classes += " border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200";
    } else if (isPinned) {
      classes += " border-purple-300 bg-purple-50 hover:border-purple-400";
    } else if (isAnswered) {
      if (isSubmitted) {
        classes += isCorrect 
          ? " border-green-300 bg-green-50 hover:border-green-400"
          : " border-red-300 bg-red-50 hover:border-red-400";
      } else {
        classes += " border-blue-300 bg-blue-50 hover:border-blue-400";
      }
    } else {
      classes += " border-gray-300 bg-gray-50 hover:border-gray-400";
    }
    
    return classes;
  };

  const getNumberClass = (index: number) => {
    const isAnswered = userAnswers[index] !== undefined;
    const isPinned = pinnedQuestions[index];
    const isCurrent = index === currentQuestionIndex;
    const question = questions[index];
    const isCorrect = isAnswered && question.correcta !== undefined && 
                     userAnswers[index] === question.correcta;
    
    if (isCurrent) {
      return "bg-blue-600 text-white";
    } else if (isPinned) {
      return "bg-purple-600 text-white";
    } else if (isAnswered) {
      if (isSubmitted) {
        return isCorrect 
          ? "bg-green-600 text-white"
          : "bg-red-600 text-white";
      } else {
        return "bg-blue-600 text-white";
      }
    } else {
      return "bg-gray-400 text-white";
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
        <h3 className="text-lg font-semibold text-gray-900">
          Vista General de Preguntas
        </h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
            <span>Contestadas ({answeredCount})</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
            <span>Sin contestar ({unansweredCount})</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></div>
            <span>Fijadas ({pinnedCount})</span>
          </div>
        </div>
      </div>

      {/* Pinned Questions Section */}
      {pinnedCount > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <h4 className="text-md font-semibold text-purple-800">
              <i className="fas fa-star mr-2 text-yellow-500"></i>
              Preguntas Fijadas ({pinnedCount})
            </h4>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
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
                  className={getCardClass(originalIndex)}
                  onClick={() => handleQuestionClick(originalIndex)}
                  data-question-index={originalIndex}
                >
                  {/* Question Number and Pin Button */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getNumberClass(originalIndex)}`}>
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
                    <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
                      {question.pregunta.substring(0, 80)}
                      {question.pregunta.length > 80 ? '...' : ''}
                    </p>
                    
                    {/* Answer Preview */}
                    {isAnswered && (
                      <div className="text-xs">
                        <span className="text-gray-500">Respuesta: </span>
                        <span className={`font-medium ${
                          isSubmitted 
                            ? isCorrect ? 'text-green-600' : 'text-red-600'
                            : 'text-blue-600'
                        }`}>
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
        <h4 className="text-md font-semibold text-gray-800">
          <i className="fas fa-list mr-2"></i>
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
              className={getCardClass(index)}
              onClick={() => handleQuestionClick(index)}
              data-question-index={index}
            >
              {/* Question Number and Pin Button */}
              <div className="flex items-center justify-between mb-2">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getNumberClass(index)}`}>
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
                <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
                  {question.pregunta.substring(0, 80)}
                  {question.pregunta.length > 80 ? '...' : ''}
                </p>
                
                {/* Answer Preview */}
                {isAnswered && (
                  <div className="text-xs">
                    <span className="text-gray-500">Respuesta: </span>
                    <span className={`font-medium ${
                      isSubmitted 
                        ? isCorrect ? 'text-green-600' : 'text-red-600'
                        : 'text-blue-600'
                    }`}>
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {answeredCount}
          </div>
          <div className="text-sm text-gray-600">Contestadas</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {unansweredCount}
          </div>
          <div className="text-sm text-gray-600">Pendientes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {pinnedCount}
          </div>
          <div className="text-sm text-gray-600">Fijadas</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {feedbackCount}
          </div>
          <div className="text-sm text-gray-600">Con feedback</div>
        </div>
      </div>
    </div>
  );
};