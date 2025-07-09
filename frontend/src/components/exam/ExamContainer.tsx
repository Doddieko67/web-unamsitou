import React, { useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuthStore } from '../../stores/authStore';

// Custom hooks
import { useExamState } from '../../hooks/useExamState';
import { useBasicTimer } from '../../hooks/useBasicTimer';
import { useExamPersistence } from '../../hooks/useExamPersistence';
import { useExamNavigation } from '../../hooks/useExamNavigation';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { useFeedbackGeneration } from '../../hooks/useFeedbackGeneration';
import { useOfflineMode } from '../../hooks/useOfflineMode';

// Components
import { ExamTimerDisplay } from './ExamTimerDisplay';
import { ExamQuestionCard } from './ExamQuestionCard';
import { ExamProgressBar } from './ExamProgressBar';
import { ExamActionButtons } from './ExamActionButtons';
import { ExamSearchFilter } from './ExamSearchFilter';
import { ExamQuestionCards } from './ExamQuestionCards';
import { OfflineIndicator } from './OfflineIndicator';
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

  // Refs for scrolling
  const overviewRef = useRef<HTMLDivElement>(null);
  const currentQuestionRef = useRef<HTMLDivElement>(null);

  // Initialize exam state
  const examState = useExamState(examId!);
  
  // Initialize feedback generation
  const feedbackState = useFeedbackGeneration();
  
  // Initialize offline mode
  const offlineState = useOfflineMode();
  
  
  // Initialize timer
  const timer = useBasicTimer(
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

  // Scroll to overview function
  const scrollToOverview = useCallback(() => {
    overviewRef.current?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
    
    // Highlight the current question card briefly
    setTimeout(() => {
      const currentCard = overviewRef.current?.querySelector(`[data-question-index="${examState.currentQuestionIndex}"]`);
      if (currentCard) {
        currentCard.classList.add('ring-4', 'ring-blue-400');
        setTimeout(() => {
          currentCard.classList.remove('ring-4', 'ring-blue-400');
        }, 2000);
      }
    }, 500);
  }, [examState.currentQuestionIndex]);

  // Navigate to question and scroll to main area
  const navigateToQuestionAndScroll = useCallback((index: number) => {
    examState.navigateToQuestion(index);
    currentQuestionRef.current?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  }, [examState.navigateToQuestion]);

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
  }, [examState.exam, examState.isSubmitted, timer.isRunning, timer.start]);

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
  }, [examState.isSubmitted, timer.isRunning, timer.stop]);

  // Handle loading state
  if (examState.loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor: 'var(--theme-bg-tertiary)' }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  // Handle error state
  if (examState.error) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor: 'var(--theme-bg-tertiary)' }}
      >
        <div 
          className="p-8 rounded-lg shadow-md max-w-md w-full mx-4 transition-colors duration-300"
          style={{ 
            backgroundColor: 'var(--theme-bg-primary)',
            boxShadow: 'var(--theme-shadow-md)'
          }}
        >
          <div className="text-center">
            <i 
              className="fas fa-exclamation-triangle text-4xl mb-4 transition-colors duration-300"
              style={{ color: 'var(--theme-error)' }}
            ></i>
            <h2 
              className="text-xl font-semibold mb-2 transition-colors duration-300"
              style={{ color: 'var(--theme-text-primary)' }}
            >
              Error al cargar el examen
            </h2>
            <p 
              className="mb-4 transition-colors duration-300"
              style={{ color: 'var(--theme-text-secondary)' }}
            >
              {examState.error}
            </p>
            <button
              onClick={() => navigate('/examenes')}
              className="text-white px-4 py-2 rounded-lg transition-all duration-300"
              style={{ backgroundColor: 'var(--primary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary-dark)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary)';
              }}
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
      <div 
        className="min-h-screen flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor: 'var(--theme-bg-tertiary)' }}
      >
        <div 
          className="p-8 rounded-lg shadow-md max-w-md w-full mx-4 transition-colors duration-300"
          style={{ 
            backgroundColor: 'var(--theme-bg-primary)',
            boxShadow: 'var(--theme-shadow-md)'
          }}
        >
          <div className="text-center">
            <i 
              className="fas fa-file-alt text-4xl mb-4 transition-colors duration-300"
              style={{ color: 'var(--theme-text-tertiary)' }}
            ></i>
            <h2 
              className="text-xl font-semibold mb-2 transition-colors duration-300"
              style={{ color: 'var(--theme-text-primary)' }}
            >
              Examen no encontrado
            </h2>
            <p 
              className="mb-4 transition-colors duration-300"
              style={{ color: 'var(--theme-text-secondary)' }}
            >
              No se pudo cargar el examen solicitado.
            </p>
            <button
              onClick={() => navigate('/examenes')}
              className="text-white px-4 py-2 rounded-lg transition-all duration-300"
              style={{ backgroundColor: 'var(--primary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary-dark)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary)';
              }}
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
      <div 
        className="min-h-screen transition-colors duration-300"
        style={{ backgroundColor: 'var(--theme-bg-tertiary)' }}
      >
        
        {/* Offline/Online Indicator */}
        <OfflineIndicator
          isOnline={offlineState.isOnline}
          pendingSyncCount={offlineState.pendingSyncCount}
          onForcSync={offlineState.forceSyncPendingData}
        />
        
        {/* Header with Exam Info - Compact Design */}
        <div 
          className="border-b transition-colors duration-300"
          style={{
            background: 'linear-gradient(135deg, var(--theme-bg-accent), var(--theme-info-light))',
            borderBottomColor: 'var(--theme-border-primary)'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center justify-center text-center flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    <i className="fas fa-clipboard-list text-white text-lg"></i>
                  </div>
                  <h1 
                    className="text-xl font-bold transition-colors duration-300"
                    style={{ color: 'var(--theme-text-primary)' }}
                  >
                    {examState.exam.titulo}
                  </h1>
                </div>
                
                {examState.exam.descripcion && (
                  <p 
                    className="text-sm mb-3 max-w-md transition-colors duration-300"
                    style={{ color: 'var(--theme-text-secondary)' }}
                  >
                    {examState.exam.descripcion}
                  </p>
                )}
                
                <div className="flex items-center space-x-3">
                  <span 
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium transition-colors duration-300"
                    style={{
                      backgroundColor: 'var(--theme-info-light)',
                      color: 'var(--theme-info-dark)'
                    }}
                  >
                    <i className="fas fa-signal mr-1"></i>
                    {examState.exam.dificultad}
                  </span>
                  <span 
                    className="inline-flex items-center text-xs transition-colors duration-300"
                    style={{ color: 'var(--theme-text-secondary)' }}
                  >
                    <i className="fas fa-list-ol mr-1"></i>
                    {examState.exam.numero_preguntas} preguntas
                  </span>
                </div>
              </div>
              
              {/* Timer Display - Fun and Colorful */}
              <div className="flex-shrink-0">
                <ExamTimerDisplay
                  timeLeft={timer.timeLeft}
                  timeSpent={timer.timeSpent}
                  isRunning={timer.isRunning}
                  isSubmitted={examState.isSubmitted}
                  formatTime={formatTime}
                />
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Action Buttons and Progress Bar - Same row */}
          <div className="flex flex-col lg:flex-row lg:items-start gap-6 mb-6">
            <div className="lg:flex-1">
              <ExamProgressBar
                currentQuestion={examState.currentQuestionIndex}
                totalQuestions={examState.exam.datos.length}
                answeredQuestions={answeredCount}
              />
            </div>
            <div className="flex-shrink-0">
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Left Sidebar - Search and Filter */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Search and Filter */}
              <div 
                className="rounded-lg shadow-md p-4 transition-colors duration-300"
                style={{
                  backgroundColor: 'var(--theme-bg-primary)',
                  boxShadow: 'var(--theme-shadow-md)'
                }}
              >
                <h3 
                  className="text-lg font-semibold mb-4 transition-colors duration-300"
                  style={{ color: 'var(--theme-text-primary)' }}
                >
                  <i 
                    className="fas fa-search mr-2 transition-colors duration-300"
                    style={{ color: 'var(--primary)' }}
                  ></i>
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
            </div>

            {/* Main Content - Optimized for Cursor Movement */}
            <div className="lg:col-span-3" ref={currentQuestionRef}>
              
              {/* Question Content with Side Navigation */}
              <div 
                className="rounded-lg transition-colors duration-300"
                style={{ backgroundColor: 'var(--theme-bg-primary)' }}
              >
                <div className="flex items-stretch">
                  
                  {/* Left Navigation Button - FULL HEIGHT for easier clicking */}
                  <div 
                    className="w-24 rounded-l-lg border-r transition-colors duration-300"
                    style={{ 
                      backgroundColor: 'var(--theme-bg-secondary)',
                      borderRightColor: 'var(--theme-border-primary)'
                    }}
                  >
                    {navigation.canGoPrevious ? (
                      <button
                        onClick={navigation.goToPrevious}
                        className="w-full h-full flex items-center justify-center rounded-l-lg transition-all duration-200"
                        style={{
                          backgroundColor: 'var(--theme-info-light)',
                          color: 'var(--primary)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.7';
                          e.currentTarget.style.transform = 'scale(0.95)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        title="Pregunta anterior (←)"
                      >
                        <i className="fas fa-chevron-left text-2xl"></i>
                      </button>
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center rounded-l-lg border transition-colors duration-300"
                        style={{
                          backgroundColor: 'var(--theme-bg-tertiary)',
                          color: 'var(--theme-text-tertiary)',
                          borderColor: 'var(--theme-border-primary)'
                        }}
                      >
                        <i className="fas fa-chevron-left text-2xl opacity-50"></i>
                      </div>
                    )}
                  </div>

                  {/* Central Question Content */}
                  <div className="flex-1 p-6">
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
                      onPrevious={undefined} // Handled by side buttons
                      onNext={undefined} // Handled by side buttons
                      canGoPrevious={navigation.canGoPrevious}
                      canGoNext={navigation.canGoNext}
                      onScrollToOverview={scrollToOverview}
                    />
                  </div>

                  {/* Right Navigation Button - FULL HEIGHT for easier clicking */}
                  <div 
                    className="w-24 rounded-r-lg border-l transition-colors duration-300"
                    style={{ 
                      backgroundColor: 'var(--theme-bg-secondary)',
                      borderLeftColor: 'var(--theme-border-primary)'
                    }}
                  >
                    {navigation.canGoNext ? (
                      <button
                        onClick={navigation.goToNext}
                        className="w-full h-full flex items-center justify-center rounded-r-lg transition-all duration-200"
                        style={{
                          backgroundColor: 'var(--theme-info-light)',
                          color: 'var(--primary)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.7';
                          e.currentTarget.style.transform = 'scale(0.95)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        title="Siguiente pregunta (→)"
                      >
                        <i className="fas fa-chevron-right text-2xl"></i>
                      </button>
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center rounded-r-lg border transition-colors duration-300"
                        style={{
                          backgroundColor: 'var(--theme-bg-tertiary)',
                          color: 'var(--theme-text-tertiary)',
                          borderColor: 'var(--theme-border-primary)'
                        }}
                      >
                        <i className="fas fa-chevron-right text-2xl opacity-50"></i>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Questions Overview - Full Width at Bottom */}
          <div 
            className="mt-8 rounded-lg shadow-md p-6 transition-colors duration-300" 
            ref={overviewRef}
            style={{
              backgroundColor: 'var(--theme-bg-primary)',
              boxShadow: 'var(--theme-shadow-md)'
            }}
          >
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
              onQuestionSelect={navigateToQuestionAndScroll}
              onTogglePin={examState.togglePin}
            />
          </div>
        </main>

      </div>
    </ErrorBoundary>
  );
};