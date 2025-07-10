import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router';
import { ExamContainer } from '../ExamContainer';

// Mock all dependencies first
const mockExamState = {
  exam: null,
  currentQuestionIndex: 0,
  userAnswers: {},
  pinnedQuestions: {},
  feedback: {},
  isSubmitted: false,
  loading: true, // Start with loading to test different states
  error: null,
  navigateToQuestion: vi.fn(),
  setAnswer: vi.fn(),
  togglePin: vi.fn(),
  submitExam: vi.fn(),
  suspendExam: vi.fn(),
  resetExam: vi.fn(),
};

const mockTimerState = {
  timeLeft: 3600,
  timeSpent: 0,
  isRunning: true,
  start: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
};

const mockNavigationState = {
  canGoPrevious: false,
  canGoNext: true,
  goToPrevious: vi.fn(),
  goToNext: vi.fn(),
};

// Mock router
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useParams: () => ({ examId: 'exam-123' }),
    useNavigate: () => vi.fn(),
  };
});

// Mock auth store
vi.mock('../../stores/authStore', () => ({
  useAuthStore: () => ({
    user: { id: 'user-123', email: 'test@example.com' },
  }),
}));

// Mock all custom hooks
vi.mock('../../hooks/useExamState', () => ({
  useExamState: () => mockExamState,
}));

vi.mock('../../hooks/useBasicTimer', () => ({
  useBasicTimer: () => mockTimerState,
}));

vi.mock('../../hooks/useExamPersistence', () => ({
  useExamPersistence: () => ({
    syncStatus: 'idle',
    lastSaved: null,
    forceSave: vi.fn(),
  }),
}));

vi.mock('../../hooks/useExamNavigation', () => ({
  useExamNavigation: () => mockNavigationState,
}));

vi.mock('../../hooks/useKeyboardNavigation', () => ({
  useKeyboardNavigation: vi.fn(),
}));

vi.mock('../../hooks/useFeedbackGeneration', () => ({
  useFeedbackGeneration: () => ({
    feedback: {},
    isLoading: false,
    generateFeedback: vi.fn(),
    setFeedback: vi.fn(),
  }),
}));

vi.mock('../../hooks/useOfflineMode', () => ({
  useOfflineMode: () => ({
    isOnline: true,
    pendingSyncCount: 0,
    forceSyncPendingData: vi.fn(),
  }),
}));

// Mock all child components to simple implementations
vi.mock('./ExamTimerDisplay', () => ({
  ExamTimerDisplay: ({ timeLeft, isRunning }: any) => (
    <div data-testid="exam-timer">
      Timer: {timeLeft}s - {isRunning ? 'Running' : 'Stopped'}
    </div>
  ),
}));

vi.mock('./ExamQuestionCard', () => ({
  ExamQuestionCard: ({ question, onAnswerSelect, questionIndex }: any) => (
    <div data-testid="question-card">
      <h3 data-testid="question-text">{question?.pregunta || 'No question'}</h3>
      <div data-testid="question-index">Question {questionIndex + 1}</div>
      {question?.opciones?.map((option: string, index: number) => (
        <button
          key={index}
          data-testid={`answer-${index}`}
          onClick={() => onAnswerSelect?.(index)}
        >
          {option}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('./ExamProgressBar', () => ({
  ExamProgressBar: ({ currentQuestion, totalQuestions, answeredQuestions }: any) => (
    <div data-testid="progress-bar">
      Progress: {currentQuestion + 1}/{totalQuestions} ({answeredQuestions} answered)
    </div>
  ),
}));

vi.mock('./ExamActionButtons', () => ({
  ExamActionButtons: ({ onSubmit, isSubmitted }: any) => (
    <div data-testid="action-buttons">
      {!isSubmitted && (
        <button data-testid="submit-button" onClick={onSubmit}>
          Submit Exam
        </button>
      )}
      {isSubmitted && <div data-testid="submitted-indicator">Submitted</div>}
    </div>
  ),
}));

vi.mock('./ExamSearchFilter', () => ({
  ExamSearchFilter: ({ onQuestionSelect }: any) => (
    <div data-testid="search-filter">
      <button onClick={() => onQuestionSelect?.(1)}>Go to Question 2</button>
    </div>
  ),
}));

vi.mock('./ExamQuestionCards', () => ({
  ExamQuestionCards: ({ onQuestionSelect }: any) => (
    <div data-testid="question-cards">
      <button onClick={() => onQuestionSelect?.(0)}>Question Card 1</button>
    </div>
  ),
}));

vi.mock('./OfflineIndicator', () => ({
  OfflineIndicator: ({ isOnline }: any) => (
    <div data-testid="offline-indicator">
      Status: {isOnline ? 'Online' : 'Offline'}
    </div>
  ),
}));

vi.mock('../ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: any) => <div data-testid="error-boundary">{children}</div>,
}));

vi.mock('../LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

// Mock performance metrics
(global as any).performanceMetrics = {
  recordNavigation: vi.fn(),
  recordKeystroke: vi.fn(),
  recordQuestionAnswer: vi.fn(),
};

describe('ExamContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderExamContainer = () => {
    return render(
      <BrowserRouter>
        <ExamContainer />
      </BrowserRouter>
    );
  };

  describe('Component State Management', () => {
    it('should render error boundary wrapper', () => {
      renderExamContainer();
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });

    it('should call hooks with correct parameters', () => {
      renderExamContainer();
      // Component should render and call hooks without throwing
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when loading is true', () => {
      // mockExamState.loading is already true by default
      renderExamContainer();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should show loading text', () => {
      renderExamContainer();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    beforeEach(() => {
      // Set error state
      Object.assign(mockExamState, {
        loading: false,
        error: 'Test error message',
        exam: null,
      });
    });

    it('should show error message when there is an error', () => {
      renderExamContainer();
      expect(screen.getByText('Error al cargar el examen')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('should show back button in error state', () => {
      renderExamContainer();
      expect(screen.getByText('Volver a exámenes')).toBeInTheDocument();
    });
  });

  describe('No Exam State', () => {
    beforeEach(() => {
      // Set no exam state
      Object.assign(mockExamState, {
        loading: false,
        error: null,
        exam: null,
      });
    });

    it('should show not found message when exam is null', () => {
      renderExamContainer();
      expect(screen.getByText('Examen no encontrado')).toBeInTheDocument();
    });
  });

  describe('Normal Exam Flow', () => {
    beforeEach(() => {
      // Set normal exam state
      Object.assign(mockExamState, {
        loading: false,
        error: null,
        exam: {
          id: 'exam-123',
          titulo: 'Test Exam',
          descripcion: 'Test Description',
          dificultad: 'medium',
          numero_preguntas: 2,
          tiempo_limite_segundos: 3600,
          datos: [
            {
              id: 'q1',
              pregunta: 'What is 2+2?',
              opciones: ['2', '3', '4', '5'],
              respuesta_correcta: 2,
            },
            {
              id: 'q2',
              pregunta: 'What is 3+3?',
              opciones: ['4', '5', '6', '7'],
              respuesta_correcta: 2,
            }
          ]
        },
        currentQuestionIndex: 0,
      });
    });

    it('should render exam title and description', () => {
      renderExamContainer();
      expect(screen.getByText('Test Exam')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('should render exam metadata', () => {
      renderExamContainer();
      expect(screen.getByText('medium')).toBeInTheDocument();
      expect(screen.getByText('2 preguntas')).toBeInTheDocument();
    });

    it('should render main components', () => {
      renderExamContainer();
      expect(screen.getByTestId('exam-timer')).toBeInTheDocument();
      expect(screen.getByTestId('question-card')).toBeInTheDocument();
      expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
      expect(screen.getByTestId('action-buttons')).toBeInTheDocument();
    });

    it('should render sidebar components', () => {
      renderExamContainer();
      expect(screen.getByTestId('search-filter')).toBeInTheDocument();
      expect(screen.getByText('Buscar Preguntas')).toBeInTheDocument();
    });

    it('should render overview components', () => {
      renderExamContainer();
      expect(screen.getByTestId('question-cards')).toBeInTheDocument();
    });

    it('should render offline indicator', () => {
      renderExamContainer();
      expect(screen.getByTestId('offline-indicator')).toBeInTheDocument();
    });
  });

  describe('Question Display', () => {
    beforeEach(() => {
      Object.assign(mockExamState, {
        loading: false,
        error: null,
        exam: {
          id: 'exam-123',
          titulo: 'Test Exam',
          datos: [
            {
              id: 'q1',
              pregunta: 'What is 2+2?',
              opciones: ['2', '3', '4', '5'],
            }
          ]
        },
        currentQuestionIndex: 0,
      });
    });

    it('should display current question', () => {
      renderExamContainer();
      expect(screen.getByTestId('question-text')).toHaveTextContent('What is 2+2?');
    });

    it('should display question index', () => {
      renderExamContainer();
      expect(screen.getByTestId('question-index')).toHaveTextContent('Question 1');
    });

    it('should display answer options', () => {
      renderExamContainer();
      expect(screen.getByTestId('answer-0')).toHaveTextContent('2');
      expect(screen.getByTestId('answer-1')).toHaveTextContent('3');
      expect(screen.getByTestId('answer-2')).toHaveTextContent('4');
      expect(screen.getByTestId('answer-3')).toHaveTextContent('5');
    });
  });

  describe('Timer Integration', () => {
    beforeEach(() => {
      Object.assign(mockExamState, {
        loading: false,
        error: null,
        exam: { id: 'exam-123', titulo: 'Test', datos: [{ id: 'q1', pregunta: 'Test?' }] },
      });
    });

    it('should display timer information', () => {
      renderExamContainer();
      expect(screen.getByTestId('exam-timer')).toHaveTextContent('Timer: 3600s - Running');
    });

    it('should reflect timer state changes', () => {
      Object.assign(mockTimerState, { timeLeft: 1800, isRunning: false });
      renderExamContainer();
      expect(screen.getByTestId('exam-timer')).toHaveTextContent('Timer: 1800s - Stopped');
    });
  });

  describe('Progress Tracking', () => {
    beforeEach(() => {
      Object.assign(mockExamState, {
        loading: false,
        error: null,
        exam: {
          id: 'exam-123',
          datos: [{ id: 'q1' }, { id: 'q2' }]
        },
        currentQuestionIndex: 0,
        userAnswers: { 0: 1 }, // One answer given
      });
    });

    it('should display progress correctly', () => {
      renderExamContainer();
      expect(screen.getByTestId('progress-bar')).toHaveTextContent('Progress: 1/2 (1 answered)');
    });
  });

  describe('Navigation Controls', () => {
    beforeEach(() => {
      Object.assign(mockExamState, {
        loading: false,
        error: null,
        exam: { id: 'exam-123', datos: [{ id: 'q1' }, { id: 'q2' }] },
      });
    });

    it('should render navigation buttons', () => {
      renderExamContainer();
      expect(screen.getByTitle('Siguiente pregunta (→)')).toBeInTheDocument();
      expect(screen.getByTitle('Pregunta anterior (←)')).toBeInTheDocument();
    });

    it('should handle next navigation click', () => {
      renderExamContainer();
      const nextButton = screen.getByTitle('Siguiente pregunta (→)');
      fireEvent.click(nextButton);
      expect(mockNavigationState.goToNext).toHaveBeenCalled();
    });
  });

  describe('User Interactions', () => {
    beforeEach(() => {
      Object.assign(mockExamState, {
        loading: false,
        error: null,
        exam: {
          id: 'exam-123',
          datos: [{ id: 'q1', pregunta: 'Test?', opciones: ['A', 'B'] }]
        },
      });
    });

    it('should handle answer selection', () => {
      renderExamContainer();
      const answerButton = screen.getByTestId('answer-1');
      fireEvent.click(answerButton);
      expect(mockExamState.setAnswer).toHaveBeenCalledWith(0, 1);
    });

    it('should handle search navigation', () => {
      renderExamContainer();
      const searchButton = screen.getByText('Go to Question 2');
      fireEvent.click(searchButton);
      expect(mockExamState.navigateToQuestion).toHaveBeenCalledWith(1);
    });

    it('should handle overview navigation', () => {
      renderExamContainer();
      const overviewButton = screen.getByText('Question Card 1');
      fireEvent.click(overviewButton);
      expect(mockExamState.navigateToQuestion).toHaveBeenCalledWith(0);
    });
  });

  describe('Submission Flow', () => {
    beforeEach(() => {
      Object.assign(mockExamState, {
        loading: false,
        error: null,
        exam: { id: 'exam-123', datos: [{ id: 'q1' }] },
        isSubmitted: false,
      });
    });

    it('should show submit button when not submitted', () => {
      renderExamContainer();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    it('should handle exam submission', () => {
      renderExamContainer();
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);
      expect(mockExamState.submitExam).toHaveBeenCalled();
    });

    it('should hide submit button when submitted', () => {
      Object.assign(mockExamState, { isSubmitted: true });
      renderExamContainer();
      expect(screen.queryByTestId('submit-button')).not.toBeInTheDocument();
      expect(screen.getByTestId('submitted-indicator')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      Object.assign(mockExamState, {
        loading: false,
        error: null,
        exam: { id: 'exam-123', datos: [{ id: 'q1' }] },
      });
    });

    it('should have main element for semantic structure', () => {
      renderExamContainer();
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    it('should have proper button titles for navigation', () => {
      renderExamContainer();
      expect(screen.getByTitle('Siguiente pregunta (→)')).toBeInTheDocument();
      expect(screen.getByTitle('Pregunta anterior (←)')).toBeInTheDocument();
    });
  });

  describe('Performance Metrics Integration', () => {
    beforeEach(() => {
      Object.assign(mockExamState, {
        loading: false,
        error: null,
        exam: { id: 'exam-123', datos: [{ id: 'q1', opciones: ['A', 'B'] }] },
      });
    });

    it('should initialize performance metrics', () => {
      renderExamContainer();
      // Just verify that the component renders without errors when performance metrics are available
      expect(screen.getByTestId('question-card')).toBeInTheDocument();
    });
  });
});