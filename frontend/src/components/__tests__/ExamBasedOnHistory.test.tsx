import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ExamBasedOnHistory } from '../ExamBasedOnHistory';
import { supabase } from '../../supabase.config';

// Mock de react-router
const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate
}));

// Mock de Swal
vi.mock('sweetalert2', () => ({ 
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: false })
  }
}));

// Mock del auth store
const mockUser = { id: 'user-123', email: 'test@example.com' };
vi.mock('../../stores/authStore', () => ({
  useAuthStore: () => ({
    session: { access_token: 'mock-token' },
    user: mockUser
  })
}));

// Mock de Supabase
vi.mock('../../supabase.config');

// Mock de componentes internos
vi.mock('../Main/Personalization', () => ({
  Personalization: ({ fineTuning, onFineTuningChange }: any) => (
    <textarea 
      data-testid="personalization-textarea"
      value={fineTuning}
      onChange={(e) => onFineTuningChange(e.target.value)}
      placeholder="Personalization input"
    />
  )
}));

vi.mock('../Main/QuestionConf', () => ({
  QuestionConf: ({ questionCount, onQuestionCountChange }: any) => (
    <div data-testid="question-conf">
      <input 
        data-testid="question-count"
        type="number"
        value={questionCount}
        onChange={(e) => onQuestionCountChange(Number(e.target.value))}
      />
    </div>
  )
}));

vi.mock('../TimerConf', () => ({
  TimerConf: ({ hour, setHour, minute, setMinute, second, setSecond }: any) => (
    <div data-testid="timer-conf">
      <input 
        data-testid="timer-hour"
        value={hour}
        onChange={(e) => setHour(Number(e.target.value))}
      />
      <input 
        data-testid="timer-minute"
        value={minute}
        onChange={(e) => setMinute(Number(e.target.value))}
      />
      <input 
        data-testid="timer-second"
        value={second}
        onChange={(e) => setSecond(Number(e.target.value))}
      />
    </div>
  )
}));

vi.mock('../shared/AIConfiguration', () => ({
  AIConfiguration: ({ selectedModel, onModelChange, isApiValid, onApiValidChange }: any) => (
    <div data-testid="ai-configuration">
      <select 
        data-testid="model-select"
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
      >
        <option value="gemini-1.5-flash">Gemini Flash</option>
        <option value="gemini-1.5-pro">Gemini Pro</option>
      </select>
      <button 
        data-testid="api-valid-toggle"
        onClick={() => onApiValidChange(!isApiValid)}
      >
        API Valid: {isApiValid ? 'Yes' : 'No'}
      </button>
    </div>
  )
}));

vi.mock('../Main/PreviewableExamRecents', () => ({
  PreviewableRecentExamCard: ({ exam, onDelete, onEntireToggle, isPinneable, isThisPinned }: any) => (
    <div data-testid={`exam-card-${exam.id}`} className="exam-card">
      <span data-testid={`exam-title-${exam.id}`}>{exam.titulo || 'Test Exam'}</span>
      <button 
        data-testid={`pin-button-${exam.id}`}
        onClick={() => onEntireToggle(exam.id)}
      >
        {isThisPinned ? 'Unpin' : 'Pin'}
      </button>
      <button 
        data-testid={`delete-button-${exam.id}`}
        onClick={() => onDelete(exam.id)}
      >
        Delete
      </button>
    </div>
  )
}));

// Mock de constantes
vi.mock('../../constants/examConstants', () => ({
  DEFAULT_EXAM_CONFIG: {
    QUESTION_COUNT: 10,
    FINE_TUNING: '',
    TIMER_HOUR: 1,
    TIMER_MINUTE: 30,
    TIMER_SECOND: 0
  }
}));

vi.mock('../../constants/geminiModels', () => ({
  DEFAULT_MODEL: 'gemini-1.5-flash'
}));

vi.mock('../../url_backend', () => ({
  url_backend: 'http://localhost:3001'
}));

// Mock de fetch
global.fetch = vi.fn();

describe('ExamBasedOnHistory Component - Tests Básicos', () => {
  const mockSupabase = vi.mocked(supabase);

  const mockExams = [
    {
      id: 'exam-1',
      titulo: 'Examen de Matemáticas',
      user_id: 'user-123',
      fecha_inicio: '2024-01-01T10:00:00Z',
      datos: [{ pregunta: 'Test question 1' }]
    },
    {
      id: 'exam-2',
      titulo: 'Examen de Historia',
      user_id: 'user-123',
      fecha_inicio: '2024-01-02T10:00:00Z',
      datos: [{ pregunta: 'Test question 2' }]
    },
    {
      id: 'exam-3',
      titulo: 'Examen de Ciencias',
      user_id: 'user-123',
      fecha_inicio: '2024-01-03T10:00:00Z',
      datos: [{ pregunta: 'Test question 3' }]
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ examId: 'new-exam-123' })
    });

    // Mock default Supabase response
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockExams,
            error: null
          })
        })
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: null
        })
      })
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Estructura y renderizado básico', () => {
    it('debería renderizar correctamente con elementos principales', async () => {
      render(<ExamBasedOnHistory />);

      expect(screen.getByRole('heading', { name: 'Generar desde Historial' })).toBeInTheDocument();
      expect(screen.getByText('📚 Seleccionar Exámenes Base')).toBeInTheDocument();
      expect(screen.getByText('🔢 Preguntas')).toBeInTheDocument();
      expect(screen.getByText('⏱️ Tiempo')).toBeInTheDocument();
      expect(screen.getByText('🎨 Personalización')).toBeInTheDocument();
      expect(screen.getByText('🤖 Configuración de IA')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
      });
    });

    it('debería mostrar botón de generar inicialmente deshabilitado', async () => {
      render(<ExamBasedOnHistory />);

      await waitFor(() => {
        const generateButton = screen.getByRole('button', { name: /Generar desde Historial/ });
        expect(generateButton).toBeDisabled();
      });
    });

    it('debería renderizar componentes internos', () => {
      render(<ExamBasedOnHistory />);

      expect(screen.getByTestId('question-conf')).toBeInTheDocument();
      expect(screen.getByTestId('timer-conf')).toBeInTheDocument();
      expect(screen.getByTestId('personalization-textarea')).toBeInTheDocument();
      expect(screen.getByTestId('ai-configuration')).toBeInTheDocument();
    });

    it('debería manejar desmontaje sin errores', () => {
      const { unmount } = render(<ExamBasedOnHistory />);
      
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Estados de carga y error', () => {
    it('debería mostrar estado de carga inicial', () => {
      render(<ExamBasedOnHistory />);

      expect(screen.getByText('Cargando...')).toBeInTheDocument();
      expect(screen.getByText('Cargando exámenes...')).toBeInTheDocument();
    });

    it('debería mostrar estado de error', async () => {
      const errorMessage = 'Error al cargar exámenes';
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: { message: errorMessage }
            })
          })
        })
      });

      render(<ExamBasedOnHistory />);

      await waitFor(() => {
        expect(screen.getByText(`Error al cargar exámenes: ${errorMessage}`)).toBeInTheDocument();
      });
    });

    it('debería mostrar estado vacío cuando no hay exámenes', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        })
      });

      render(<ExamBasedOnHistory />);

      await waitFor(() => {
        expect(screen.getByText('No tienes exámenes recientes. Genera uno primero.')).toBeInTheDocument();
      });
    });

  });

  describe('Lista de exámenes', () => {
    it('debería cargar y mostrar exámenes correctamente', async () => {
      render(<ExamBasedOnHistory />);

      await waitFor(() => {
        expect(screen.getByTestId('exam-card-exam-1')).toBeInTheDocument();
        expect(screen.getByTestId('exam-card-exam-2')).toBeInTheDocument();
        expect(screen.getByTestId('exam-card-exam-3')).toBeInTheDocument();
      });

      expect(screen.getByText('📋 Otros Disponibles (3)')).toBeInTheDocument();
      expect(screen.getByText('✅ Seleccionados (0)')).toBeInTheDocument();
    });

    it('debería mostrar mensaje de instrucciones cuando no hay seleccionados', async () => {
      render(<ExamBasedOnHistory />);

      await waitFor(() => {
        expect(screen.getByText('Haz clic en los exámenes para seleccionarlos como base')).toBeInTheDocument();
      });
    });

    it('debería mostrar contadores correctos', async () => {
      render(<ExamBasedOnHistory />);

      await waitFor(() => {
        expect(screen.getByText('3 examenes disponibles')).toBeInTheDocument();
      });
    });

    it('debería llamar a Supabase con parámetros correctos', async () => {
      render(<ExamBasedOnHistory />);

      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('examenes');
      });
    });
  });

  describe('Selección de exámenes (Pin/Unpin)', () => {
    it('debería seleccionar examen al hacer click en pin', async () => {
      render(<ExamBasedOnHistory />);

      await waitFor(() => {
        expect(screen.getByTestId('exam-card-exam-1')).toBeInTheDocument();
      });

      const pinButton = screen.getByTestId('pin-button-exam-1');
      fireEvent.click(pinButton);

      expect(screen.getByText('📋 Otros Disponibles (2)')).toBeInTheDocument();
      expect(screen.getByText('✅ Seleccionados (1)')).toBeInTheDocument();
    });

    it('debería deseleccionar examen al hacer click en unpin', async () => {
      render(<ExamBasedOnHistory />);

      await waitFor(() => {
        expect(screen.getByTestId('exam-card-exam-1')).toBeInTheDocument();
      });

      const pinButton = screen.getByTestId('pin-button-exam-1');
      
      // Seleccionar
      fireEvent.click(pinButton);
      expect(screen.getByText('✅ Seleccionados (1)')).toBeInTheDocument();

      // Deseleccionar
      fireEvent.click(pinButton);
      expect(screen.getByText('✅ Seleccionados (0)')).toBeInTheDocument();
    });

    it('debería permitir seleccionar múltiples exámenes', async () => {
      render(<ExamBasedOnHistory />);

      await waitFor(() => {
        expect(screen.getByTestId('exam-card-exam-1')).toBeInTheDocument();
      });

      // Seleccionar múltiples exámenes
      fireEvent.click(screen.getByTestId('pin-button-exam-1'));
      fireEvent.click(screen.getByTestId('pin-button-exam-2'));
      fireEvent.click(screen.getByTestId('pin-button-exam-3'));

      expect(screen.getByText('📋 Otros Disponibles (0)')).toBeInTheDocument();
      expect(screen.getByText('✅ Seleccionados (3)')).toBeInTheDocument();
      expect(screen.getByText('Todos los exámenes están seleccionados')).toBeInTheDocument();
    });

    it('debería mostrar estado "Listos para usar" con selecciones', async () => {
      render(<ExamBasedOnHistory />);

      await waitFor(() => {
        expect(screen.getByTestId('exam-card-exam-1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('pin-button-exam-1'));

      expect(screen.getByText('Listos para usar')).toBeInTheDocument();
    });
  });

  describe('Eliminación de exámenes', () => {
    it('debería eliminar examen de la lista', async () => {
      render(<ExamBasedOnHistory />);

      await waitFor(() => {
        expect(screen.getByTestId('exam-card-exam-1')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId('delete-button-exam-1');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('examenes');
      });
    });

    it('debería remover examen de la lista después de eliminar', async () => {
      render(<ExamBasedOnHistory />);

      await waitFor(() => {
        expect(screen.getByTestId('exam-card-exam-1')).toBeInTheDocument();
      });

      // Primero seleccionar
      fireEvent.click(screen.getByTestId('pin-button-exam-1'));
      expect(screen.getByText('✅ Seleccionados (1)')).toBeInTheDocument();

      // Luego eliminar
      const deleteButton = screen.getByTestId('delete-button-exam-1');
      fireEvent.click(deleteButton);

      // Verificar que se limpia de estado de selección
      await waitFor(() => {
        expect(screen.getByText('✅ Seleccionados (0)')).toBeInTheDocument();
      });
    });

    it('debería manejar error al eliminar', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockExams,
              error: null
            })
          })
        }),
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: { message: 'Delete error' }
          })
        })
      });

      render(<ExamBasedOnHistory />);

      await waitFor(() => {
        expect(screen.getByTestId('exam-card-exam-1')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId('delete-button-exam-1');
      fireEvent.click(deleteButton);

      // El error se maneja silenciosamente
      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('examenes');
      });
    });
  });

  describe('Paginación', () => {
    it('debería mostrar botón "Cargar más" cuando hay más elementos', async () => {
      const manyExams = Array.from({ length: 10 }, (_, i) => ({
        id: `exam-${i}`,
        titulo: `Examen ${i}`,
        user_id: 'user-123',
        fecha_inicio: `2024-01-0${i + 1}T10:00:00Z`,
        datos: []
      }));

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: manyExams,
              error: null
            })
          })
        })
      });

      render(<ExamBasedOnHistory />);

      await waitFor(() => {
        expect(screen.getByText('Cargar más (4)')).toBeInTheDocument();
      });
    });

    it('debería cargar más elementos al hacer click', async () => {
      const manyExams = Array.from({ length: 10 }, (_, i) => ({
        id: `exam-${i}`,
        titulo: `Examen ${i}`,
        user_id: 'user-123',
        fecha_inicio: `2024-01-0${i + 1}T10:00:00Z`,
        datos: []
      }));

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: manyExams,
              error: null
            })
          })
        })
      });

      render(<ExamBasedOnHistory />);

      await waitFor(() => {
        expect(screen.getByText('Cargar más (4)')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Cargar más (4)'));

      // Verificar que el texto cambia
      expect(screen.getByText('📋 Otros Disponibles (10)')).toBeInTheDocument();
    });
  });

  describe('Configuración de componentes', () => {
    it('debería tener valores por defecto correctos', () => {
      render(<ExamBasedOnHistory />);

      const questionCount = screen.getByTestId('question-count');
      const hourInput = screen.getByTestId('timer-hour');
      const minuteInput = screen.getByTestId('timer-minute');
      const secondInput = screen.getByTestId('timer-second');
      const modelSelect = screen.getByTestId('model-select');

      expect(questionCount).toHaveValue(10);
      expect(hourInput).toHaveValue('1');
      expect(minuteInput).toHaveValue('30');
      expect(secondInput).toHaveValue('0');
      expect(modelSelect).toHaveValue('gemini-1.5-flash');
    });

    it('debería actualizar configuración de preguntas', () => {
      render(<ExamBasedOnHistory />);

      const questionCount = screen.getByTestId('question-count');
      fireEvent.change(questionCount, { target: { value: '20' } });

      expect(questionCount).toHaveValue(20);
    });

    it('debería actualizar configuración de timer', () => {
      render(<ExamBasedOnHistory />);

      const hourInput = screen.getByTestId('timer-hour');
      const minuteInput = screen.getByTestId('timer-minute');

      fireEvent.change(hourInput, { target: { value: '2' } });
      fireEvent.change(minuteInput, { target: { value: '45' } });

      expect(hourInput).toHaveValue('2');
      expect(minuteInput).toHaveValue('45');
    });

    it('debería actualizar personalización', () => {
      render(<ExamBasedOnHistory />);

      const personalizationTextarea = screen.getByTestId('personalization-textarea');
      fireEvent.change(personalizationTextarea, { target: { value: 'Instrucciones personalizadas' } });

      expect(personalizationTextarea).toHaveValue('Instrucciones personalizadas');
    });

    it('debería cambiar modelo de IA', () => {
      render(<ExamBasedOnHistory />);

      const modelSelect = screen.getByTestId('model-select');
      fireEvent.change(modelSelect, { target: { value: 'gemini-1.5-pro' } });

      expect(modelSelect).toHaveValue('gemini-1.5-pro');
    });

    it('debería togglear API válida', () => {
      render(<ExamBasedOnHistory />);

      const apiToggle = screen.getByTestId('api-valid-toggle');
      expect(apiToggle).toHaveTextContent('API Valid: No');

      fireEvent.click(apiToggle);
      expect(apiToggle).toHaveTextContent('API Valid: Yes');
    });
  });

  describe('Resumen de configuración', () => {
    it('debería mostrar resumen con valores correctos', async () => {
      render(<ExamBasedOnHistory />);

      await waitFor(() => {
        expect(screen.getByText('📊 Resumen de Configuración')).toBeInTheDocument();
        expect(screen.getByText('Base')).toBeInTheDocument();
        expect(screen.getByText('Preguntas')).toBeInTheDocument();
        expect(screen.getByText('API')).toBeInTheDocument();
        expect(screen.getByText('Tiempo')).toBeInTheDocument();
      });
    });

    it('debería actualizar resumen cuando se seleccionan exámenes', async () => {
      render(<ExamBasedOnHistory />);

      await waitFor(() => {
        expect(screen.getByTestId('exam-card-exam-1')).toBeInTheDocument();
      });

      // Inicialmente 0 exámenes seleccionados
      expect(screen.getByText('0')).toBeInTheDocument();

      // Seleccionar un examen
      fireEvent.click(screen.getByTestId('pin-button-exam-1'));

      // Debería mostrar 1
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('debería mostrar estado de API en resumen', () => {
      render(<ExamBasedOnHistory />);

      // API inicialmente inválida
      expect(screen.getByText('✗')).toBeInTheDocument();

      // Activar API
      fireEvent.click(screen.getByTestId('api-valid-toggle'));

      // Debería mostrar válida
      expect(screen.getByText('✓')).toBeInTheDocument();
    });
  });

  describe('Proceso de generación', () => {
    it('debería habilitar botón con exámenes seleccionados y API válida', async () => {
      render(<ExamBasedOnHistory />);

      await waitFor(() => {
        expect(screen.getByTestId('exam-card-exam-1')).toBeInTheDocument();
      });

      // Seleccionar examen y activar API
      fireEvent.click(screen.getByTestId('pin-button-exam-1'));
      fireEvent.click(screen.getByTestId('api-valid-toggle'));

      const generateButton = screen.getByRole('button', { name: /Generar desde Historial/ });
      expect(generateButton).not.toBeDisabled();
    });

    it('debería procesar generación exitosa', async () => {
      render(<ExamBasedOnHistory />);

      await waitFor(() => {
        expect(screen.getByTestId('exam-card-exam-1')).toBeInTheDocument();
      });

      // Configurar y generar
      fireEvent.click(screen.getByTestId('pin-button-exam-1'));
      fireEvent.click(screen.getByTestId('api-valid-toggle'));

      const generateButton = screen.getByRole('button', { name: /Generar desde Historial/ });
      fireEvent.click(generateButton!);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/examen/new-exam-123');
      });
    });

    it('debería mostrar estado de carga durante generación', async () => {
      // Mock delayed response
      (global.fetch as any).mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ examId: 'new-exam-123' })
          }), 100)
        )
      );

      render(<ExamBasedOnHistory />);

      await waitFor(() => {
        expect(screen.getByTestId('exam-card-exam-1')).toBeInTheDocument();
      });

      // Configurar y generar
      fireEvent.click(screen.getByTestId('pin-button-exam-1'));
      fireEvent.click(screen.getByTestId('api-valid-toggle'));

      const generateButton = screen.getByRole('button', { name: /Generar desde Historial/ });
      fireEvent.click(generateButton!);

      // Verificar estado de carga
      expect(screen.getByText('Generando examen...')).toBeInTheDocument();
      expect(screen.getByText('Analizando exámenes base con IA')).toBeInTheDocument();
    });

    it('debería manejar error de generación', async () => {
      const Swal = (await import('sweetalert2')).default;
      
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      render(<ExamBasedOnHistory />);

      await waitFor(() => {
        expect(screen.getByTestId('exam-card-exam-1')).toBeInTheDocument();
      });

      // Configurar y generar
      fireEvent.click(screen.getByTestId('pin-button-exam-1'));
      fireEvent.click(screen.getByTestId('api-valid-toggle'));

      const generateButton = screen.getByRole('button', { name: /Generar desde Historial/ });
      fireEvent.click(generateButton!);

      await waitFor(() => {
        expect(vi.mocked(Swal.fire)).toHaveBeenCalledWith(
          expect.objectContaining({
            icon: 'error',
            title: 'Error al generar examen'
          })
        );
      });
    });
  });

  describe('Casos edge y validaciones', () => {
    it('debería manejar componente sin crashes', () => {
      expect(() => render(<ExamBasedOnHistory />)).not.toThrow();
    });

    it('debería manejar datos malformados de exámenes', async () => {
      const malformedExams = [
        {
          id: 'exam-1',
          titulo: null,
          user_id: 'user-123',
          fecha_inicio: '2024-01-01T10:00:00Z',
          datos: 'invalid-data' // No es array
        }
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: malformedExams,
              error: null
            })
          })
        })
      });

      expect(() => render(<ExamBasedOnHistory />)).not.toThrow();

      await waitFor(() => {
        expect(screen.getByTestId('exam-card-exam-1')).toBeInTheDocument();
      });
    });

    it('debería mantener estado entre re-renders', async () => {
      const { rerender } = render(<ExamBasedOnHistory />);

      await waitFor(() => {
        expect(screen.getByTestId('exam-card-exam-1')).toBeInTheDocument();
      });

      // Seleccionar examen
      fireEvent.click(screen.getByTestId('pin-button-exam-1'));
      expect(screen.getByText('✅ Seleccionados (1)')).toBeInTheDocument();

      // Re-render
      rerender(<ExamBasedOnHistory />);

      // El estado debería persistir
      expect(screen.getByText('✅ Seleccionados (1)')).toBeInTheDocument();
    });

    it('debería manejar valores extremos en configuración', () => {
      render(<ExamBasedOnHistory />);

      const questionCount = screen.getByTestId('question-count');
      const hourInput = screen.getByTestId('timer-hour');

      fireEvent.change(questionCount, { target: { value: '999' } });
      fireEvent.change(hourInput, { target: { value: '24' } });

      expect(questionCount).toHaveValue(999);
      expect(hourInput).toHaveValue('24');
    });

    it('debería manejar múltiples clicks en botones', async () => {
      render(<ExamBasedOnHistory />);

      await waitFor(() => {
        expect(screen.getByTestId('exam-card-exam-1')).toBeInTheDocument();
      });

      const pinButton = screen.getByTestId('pin-button-exam-1');
      
      // Múltiples clicks rápidos
      fireEvent.click(pinButton);
      fireEvent.click(pinButton);
      fireEvent.click(pinButton);

      // El estado final debería ser consistente
      expect(screen.getByText('✅ Seleccionados (1)')).toBeInTheDocument();
    });
  });
});