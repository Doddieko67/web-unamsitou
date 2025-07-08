import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

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
 * Grid of question cards for visual navigation
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
  
  // Group questions by status for better organization
  const questionGroups = useMemo(() => {
    const answered: number[] = [];
    const unanswered: number[] = [];
    const pinned: number[] = [];

    questions.forEach((_, index) => {
      if (pinnedQuestions[index]) {
        pinned.push(index);
      } else if (userAnswers[index] !== undefined) {
        answered.push(index);
      } else {
        unanswered.push(index);
      }
    });

    return { answered, unanswered, pinned };
  }, [questions, userAnswers, pinnedQuestions]);

  const getQuestionStatus = (index: number) => {
    const isAnswered = userAnswers[index] !== undefined;
    const isPinned = pinnedQuestions[index];
    const isCurrent = index === currentQuestionIndex;
    const question = questions[index];
    const isCorrect = isAnswered && question.correcta !== undefined && 
                     userAnswers[index] === question.correcta;
    const hasFeedback = feedback[index] || (question.id && feedback[question.id]);

    return {
      isAnswered,
      isPinned,
      isCurrent,
      isCorrect,
      hasFeedback,
    };
  };

  const getCardClass = (index: number) => {
    const { isAnswered, isPinned, isCurrent, isCorrect } = getQuestionStatus(index);
    
    let baseClass = "relative p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer transform hover:scale-105 hover:shadow-md";
    
    if (isCurrent) {
      baseClass += " border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200";
    } else if (isPinned) {
      baseClass += " border-purple-300 bg-purple-50 hover:border-purple-400";
    } else if (isAnswered) {
      if (isSubmitted) {
        baseClass += isCorrect 
          ? " border-green-300 bg-green-50 hover:border-green-400"
          : " border-red-300 bg-red-50 hover:border-red-400";
      } else {
        baseClass += " border-blue-300 bg-blue-50 hover:border-blue-400";
      }
    } else {
      baseClass += " border-gray-300 bg-gray-50 hover:border-gray-400";
    }
    
    return baseClass;
  };

  const getNumberClass = (index: number) => {
    const { isAnswered, isPinned, isCurrent, isCorrect } = getQuestionStatus(index);
    
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

  const QuestionCard: React.FC<{ index: number }> = ({ index }) => {
    const question = questions[index];
    const { isAnswered, isPinned, isCurrent, isCorrect, hasFeedback } = getQuestionStatus(index);
    
    return (
      <motion.div
        key={index}
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        className={getCardClass(index)}
        onClick={() => onQuestionSelect(index)}
      >
        {/* Pin Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(index);
          }}
          className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs ${
            isPinned
              ? 'bg-purple-600 text-white'
              : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
          } flex items-center justify-center transition-colors`}
          title={isPinned ? 'Desfijar pregunta' : 'Fijar pregunta'}
        >
          <i className={isPinned ? 'fas fa-thumbtack' : 'far fa-thumbtack'}></i>
        </button>

        {/* Question Number */}
        <div className="flex items-center justify-between mb-2">
          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getNumberClass(index)}`}>
            {index + 1}
          </span>
          
          {/* Status Indicators */}
          <div className="flex items-center space-x-1">
            {isAnswered && (
              <i className={`fas fa-check text-xs ${
                isSubmitted 
                  ? isCorrect ? 'text-green-600' : 'text-red-600'
                  : 'text-blue-600'
              }`}></i>
            )}
            {hasFeedback && (
              <i className="fas fa-lightbulb text-xs text-yellow-600"></i>
            )}
            {isCurrent && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <i className="fas fa-eye text-xs text-blue-600"></i>
              </motion.div>
            )}
          </div>
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

          {/* Feedback Preview */}
          {hasFeedback && isSubmitted && (
            <div className="text-xs">
              <span className="text-yellow-600 font-medium">
                <i className="fas fa-lightbulb mr-1"></i>
                Tiene retroalimentación
              </span>
            </div>
          )}
        </div>

        {/* Current Question Pulse */}
        {isCurrent && (
          <motion.div
            className="absolute inset-0 border-2 border-blue-400 rounded-lg pointer-events-none"
            animate={{ 
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.02, 1] 
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Vista General de Preguntas
        </h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
            <span>Contestadas ({questionGroups.answered.length})</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
            <span>Sin contestar ({questionGroups.unanswered.length})</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></div>
            <span>Fijadas ({questionGroups.pinned.length})</span>
          </div>
        </div>
      </div>

      {/* Question Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        <AnimatePresence>
          {questions.map((_, index) => (
            <QuestionCard key={index} index={index} />
          ))}
        </AnimatePresence>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {Object.keys(userAnswers).length}
          </div>
          <div className="text-sm text-gray-600">Contestadas</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {questions.length - Object.keys(userAnswers).length}
          </div>
          <div className="text-sm text-gray-600">Pendientes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {Object.keys(pinnedQuestions).length}
          </div>
          <div className="text-sm text-gray-600">Fijadas</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {Object.keys(feedback).length}
          </div>
          <div className="text-sm text-gray-600">Con feedback</div>
        </div>
      </div>
    </div>
  );
};