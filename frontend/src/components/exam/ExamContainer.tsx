import React, { useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuthStore } from '../../stores/authStore';

// Custom hooks
import { useExamState } from '../../hooks/useExamState';
import { useExamTimer } from '../../hooks/useExamTimer';
import { useExamPersistence } from '../../hooks/useExamPersistence';
import { useExamNavigation } from '../../hooks/useExamNavigation';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';

// Components
import { ExamTimerDisplay } from './ExamTimerDisplay';
import { ExamQuestionCard } from './ExamQuestionCard';
import { ExamProgressBar } from './ExamProgressBar';
import { ExamNavigationPanel } from './ExamNavigationPanel';
import { ExamActionButtons } from './ExamActionButtons';
import { QuestionSelector } from '../../Examen/QuestionSelector';
import { ErrorBoundary } from '../ErrorBoundary';
import { LoadingSpinner } from '../LoadingSpinner';

/**
 * Modern refactored exam container component
 * Uses composition and custom hooks for clean separation of concerns
 */
export const ExamContainer: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Initialize exam state
  const examState = useExamState(examId!);
  
  // Initialize timer
  const timer = useExamTimer(
    examState.exam?.tiempo_limite_segundos || 0,
    () => examState.submitExam(timer.timeSpent) // Pass time spent on auto-submit
  );

  // Initialize persistence
  const persistence = useExamPersistence(
    examId!,
    {
      tiempo_tomado_segundos: timer.timeSpent,
      respuestas_usuario: examState.userAnswers,
      questions_pinned: examState.pinnedQuestions,
      currentQuestionIndex: examState.currentQuestionIndex,
      timeLeft: timer.timeLeft,
      isSubmitted: examState.isSubmitted,
    },
    user?.id
  );

  // Initialize navigation
  const navigation = useExamNavigation(
    examState.exam?.datos || [],
    examState.currentQuestionIndex,
    examState.navigateToQuestion
  );

  // Format time utility
  const formatTime = useCallback((totalSeconds: number | undefined): string => {
    if (totalSeconds === undefined || totalSeconds < 0) totalSeconds = 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Current question
  const currentQuestion = useMemo(() => {
    if (!examState.exam?.datos) return null;
    return examState.exam.datos[examState.currentQuestionIndex];
  }, [examState.exam?.datos, examState.currentQuestionIndex]);

  // Answer count
  const answeredCount = useMemo(() => {
    return Object.keys(examState.userAnswers).length;
  }, [examState.userAnswers]);

  // Keyboard navigation
  useKeyboardNavigation({
    onPrevious: navigation.goToPrevious,
    onNext: navigation.goToNext,
    onAnswer1: () => currentQuestion && examState.setAnswer(examState.currentQuestionIndex, 0),
    onAnswer2: () => currentQuestion && examState.setAnswer(examState.currentQuestionIndex, 1),
    onAnswer3: () => currentQuestion && examState.setAnswer(examState.currentQuestionIndex, 2),
    onAnswer4: () => currentQuestion && examState.setAnswer(examState.currentQuestionIndex, 3),
    isSubmitted: examState.isSubmitted,
  });

  // Start timer when exam loads and not submitted
  React.useEffect(() => {
    if (examState.exam && !examState.isSubmitted && !timer.isRunning) {
      timer.start();
    }
  }, [examState.exam, examState.isSubmitted, timer]);

  // Stop timer when submitted
  React.useEffect(() => {
    if (examState.isSubmitted && timer.isRunning) {
      timer.stop();
    }
  }, [examState.isSubmitted, timer]);

  // Handle loading state
  if (examState.loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Handle error state
  if (examState.error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error al cargar el examen
            </h2>
            <p className="text-gray-600 mb-4">{examState.error}</p>
            <button
              onClick={() => navigate('/examenes')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver a exámenes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle no exam data
  if (!examState.exam || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="text-center">
            <i className="fas fa-file-alt text-gray-400 text-4xl mb-4"></i>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Examen no encontrado
            </h2>
            <p className="text-gray-600 mb-4">
              No se pudo cargar el examen solicitado.
            </p>
            <button
              onClick={() => navigate('/examenes')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver a exámenes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar - Timer and Pinned Questions */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Timer */}
              <ExamTimerDisplay
                timeLeft={timer.timeLeft}
                timeSpent={timer.timeSpent}
                isRunning={timer.isRunning}
                isSubmitted={examState.isSubmitted}
                formatTime={formatTime}
                onPause={timer.pause}
                onResume={timer.start}
              />

              {/* Pinned Questions */}
              {Object.keys(examState.pinnedQuestions).length > 0 ? (
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Preguntas Fijadas
                  </h3>
                  <QuestionSelector
                    totalQuestions={examState.exam.datos.length}
                    currentQuestionIndex={examState.currentQuestionIndex}
                    answeredQuestions={examState.userAnswers}
                    preguntas={examState.exam.datos}
                    onQuestionSelect={examState.navigateToQuestion}
                    isSubmitted={examState.isSubmitted}
                    title="Fijadas"
                    pinnedQuestions={examState.pinnedQuestions}
                    pinnedMode={true}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <i className="fas fa-thumbtack text-gray-300 text-2xl mb-3"></i>
                  <h3 className="text-lg font-medium text-gray-500 mb-2">
                    Fija una pregunta
                  </h3>
                  <p className="text-sm text-gray-400">
                    Haz clic en el ícono de fijado para marcar preguntas importantes
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <ExamActionButtons
                isSubmitted={examState.isSubmitted}
                onSubmit={examState.submitExam}
                onSuspend={examState.suspendExam}
                timeSpent={timer.timeSpent}
                syncStatus={persistence.syncStatus}
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Progress Bar */}
              <ExamProgressBar
                currentQuestion={examState.currentQuestionIndex}
                totalQuestions={examState.exam.datos.length}
                answeredQuestions={answeredCount}
              />

              {/* Question Card */}
              <ExamQuestionCard
                question={currentQuestion}
                questionIndex={examState.currentQuestionIndex}
                totalQuestions={examState.exam.datos.length}
                selectedAnswer={examState.userAnswers[examState.currentQuestionIndex]}
                isSubmitted={examState.isSubmitted}
                feedback={examState.feedback[examState.currentQuestionIndex]}
                isPinned={examState.pinnedQuestions[examState.currentQuestionIndex] || false}
                onAnswerSelect={(answerIndex) => 
                  examState.setAnswer(examState.currentQuestionIndex, answerIndex)
                }
                onTogglePin={() => examState.togglePin(examState.currentQuestionIndex)}
              />

              {/* Navigation Panel */}
              <ExamNavigationPanel
                canGoPrevious={navigation.canGoPrevious}
                canGoNext={navigation.canGoNext}
                onPrevious={navigation.goToPrevious}
                onNext={navigation.goToNext}
                isSubmitted={examState.isSubmitted}
                currentIndex={examState.currentQuestionIndex}
                totalQuestions={examState.exam.datos.length}
              />
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
};