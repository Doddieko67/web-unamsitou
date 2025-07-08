import React, { useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuthStore } from '../../stores/authStore';

// Custom hooks
import { useExamState } from '../../hooks/useExamState';
import { useExamTimer } from '../../hooks/useExamTimer';
import { useExamPersistence } from '../../hooks/useExamPersistence';
import { useExamNavigation } from '../../hooks/useExamNavigation';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { useFeedbackGeneration } from '../../hooks/useFeedbackGeneration';
import { useOfflineMode } from '../../hooks/useOfflineMode';
import { usePerformanceMetrics } from '../../hooks/usePerformanceMetrics';

// Components
import { ExamTimerDisplay } from './ExamTimerDisplay';
import { ExamQuestionCard } from './ExamQuestionCard';
import { ExamProgressBar } from './ExamProgressBar';
import { ExamActionButtons } from './ExamActionButtons';
import { ExamSearchFilter } from './ExamSearchFilter';
import { ExamQuestionCards } from './ExamQuestionCards';
import { OfflineIndicator } from './OfflineIndicator';
import { PerformanceDashboard } from './PerformanceDashboard';
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
  
  // Initialize feedback generation
  const feedbackState = useFeedbackGeneration();
  
  // Initialize offline mode
  const offlineState = useOfflineMode();
  
  // Initialize performance monitoring
  const performanceMetrics = usePerformanceMetrics();
  
  // Initialize timer
  const timer = useExamTimer(
    examState.exam?.tiempo_limite_segundos,
    () => examState.submitExam(timer.timeSpent), // Pass time spent on auto-submit
    examState.exam?.tiempo_tomado_segundos // Pass initial time spent for resumed exams
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

  // Keyboard navigation with performance tracking
  useKeyboardNavigation({
    onPrevious: () => {
      navigation.goToPrevious();
      performanceMetrics.recordNavigation();
    },
    onNext: () => {
      navigation.goToNext();
      performanceMetrics.recordNavigation();
    },
    onAnswer1: () => {
      if (currentQuestion) {
        examState.setAnswer(examState.currentQuestionIndex, 0);
        performanceMetrics.recordKeystroke();
        performanceMetrics.recordQuestionAnswer();
      }
    },
    onAnswer2: () => {
      if (currentQuestion) {
        examState.setAnswer(examState.currentQuestionIndex, 1);
        performanceMetrics.recordKeystroke();
        performanceMetrics.recordQuestionAnswer();
      }
    },
    onAnswer3: () => {
      if (currentQuestion) {
        examState.setAnswer(examState.currentQuestionIndex, 2);
        performanceMetrics.recordKeystroke();
        performanceMetrics.recordQuestionAnswer();
      }
    },
    onAnswer4: () => {
      if (currentQuestion) {
        examState.setAnswer(examState.currentQuestionIndex, 3);
        performanceMetrics.recordKeystroke();
        performanceMetrics.recordQuestionAnswer();
      }
    },
    isSubmitted: examState.isSubmitted,
  });

  // Start timer when exam loads and not submitted
  React.useEffect(() => {
    if (examState.exam && !examState.isSubmitted && !timer.isRunning) {
      timer.start();
    }
  }, [examState.exam, examState.isSubmitted, timer]);

  // Load feedback when exam loads
  React.useEffect(() => {
    if (examState.exam?.feedback) {
      feedbackState.setFeedback(examState.exam.feedback);
    }
  }, [examState.exam?.feedback, feedbackState.setFeedback]);

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
        
        {/* Offline/Online Indicator */}
        <OfflineIndicator
          isOnline={offlineState.isOnline}
          pendingSyncCount={offlineState.pendingSyncCount}
          onForcSync={offlineState.forceSyncPendingData}
        />
        
        {/* Header with Exam Info */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {examState.exam.titulo}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {examState.exam.descripcion}
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {examState.exam.dificultad}
                  </span>
                  <span className="text-sm text-gray-500">
                    {examState.exam.numero_preguntas} preguntas
                  </span>
                </div>
              </div>
              
              {/* Timer Display */}
              <ExamTimerDisplay
                timeLeft={timer.timeLeft}
                timeSpent={timer.timeSpent}
                isRunning={timer.isRunning}
                isSubmitted={examState.isSubmitted}
                formatTime={formatTime}
                onPause={timer.pause}
                onResume={timer.start}
              />
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Left Sidebar - Search and Pinned Questions */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Search and Filter */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  <i className="fas fa-search mr-2"></i>
                  Buscar Preguntas
                </h3>
                <ExamSearchFilter
                  questions={examState.exam.datos}
                  userAnswers={examState.userAnswers}
                  onQuestionSelect={examState.navigateToQuestion}
                  currentQuestionIndex={examState.currentQuestionIndex}
                  isSubmitted={examState.isSubmitted}
                />
              </div>

              {/* Pinned Questions */}
              {Object.keys(examState.pinnedQuestions).length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    <i className="fas fa-thumbtack mr-2"></i>
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
              )}

              {/* Action Buttons */}
              <ExamActionButtons
                isSubmitted={examState.isSubmitted}
                onSubmit={examState.submitExam}
                onSuspend={examState.suspendExam}
                onReset={examState.isSubmitted ? examState.resetExam : undefined}
                timeSpent={timer.timeSpent}
                onGenerateFeedback={() => feedbackState.generateFeedback(examId!)}
                isFeedbackLoading={feedbackState.isLoading}
                hasFeedback={Object.keys(feedbackState.feedback).length > 0}
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

              {/* Current Question with Integrated Navigation */}
              <ExamQuestionCard
                question={currentQuestion}
                questionIndex={examState.currentQuestionIndex}
                totalQuestions={examState.exam.datos.length}
                selectedAnswer={examState.userAnswers[examState.currentQuestionIndex]}
                isSubmitted={examState.isSubmitted}
                feedback={
                  currentQuestion?.id && feedbackState.feedback[currentQuestion.id] 
                    ? feedbackState.feedback[currentQuestion.id]
                    : examState.feedback[examState.currentQuestionIndex]
                }
                isPinned={examState.pinnedQuestions[examState.currentQuestionIndex] || false}
                showFeedback={examState.isSubmitted}
                onAnswerSelect={(answerIndex) => 
                  examState.setAnswer(examState.currentQuestionIndex, answerIndex)
                }
                onTogglePin={() => examState.togglePin(examState.currentQuestionIndex)}
                onPrevious={navigation.canGoPrevious ? navigation.goToPrevious : undefined}
                onNext={navigation.canGoNext ? navigation.goToNext : undefined}
                canGoPrevious={navigation.canGoPrevious}
                canGoNext={navigation.canGoNext}
              />

              {/* All Questions Overview */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <ExamQuestionCards
                  questions={examState.exam.datos}
                  currentQuestionIndex={examState.currentQuestionIndex}
                  userAnswers={examState.userAnswers}
                  pinnedQuestions={examState.pinnedQuestions}
                  feedback={{
                    ...examState.feedback,
                    ...feedbackState.feedback,
                  }}
                  isSubmitted={examState.isSubmitted}
                  onQuestionSelect={examState.navigateToQuestion}
                  onTogglePin={examState.togglePin}
                />
              </div>
            </div>
          </div>
        </main>

        {/* Performance Dashboard (Development Only) */}
        <PerformanceDashboard
          metrics={performanceMetrics}
          onExportReport={performanceMetrics.getMetricsReport}
        />
      </div>
    </ErrorBoundary>
  );
};