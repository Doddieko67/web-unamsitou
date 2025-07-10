import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExamConf } from '../ExamConf';

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
vi.mock('../../../stores/authStore', () => ({
  useAuthStore: () => ({
    session: { access_token: 'mock-token' }
  })
}));

// Mock de componentes internos
vi.mock('../DifficultExam', () => ({
  DifficultExam: ({ selectedDifficulty, onDifficultySelect }: any) => (
    <div data-testid="difficulty-exam">
      <button 
        data-testid="easy-difficulty"
        onClick={() => onDifficultySelect('easy')}
        className={selectedDifficulty === 'easy' ? 'selected' : ''}
      >
        Easy
      </button>
      <button 
        data-testid="medium-difficulty"
        onClick={() => onDifficultySelect('medium')}
        className={selectedDifficulty === 'medium' ? 'selected' : ''}
      >
        Medium
      </button>
      <button 
        data-testid="hard-difficulty"
        onClick={() => onDifficultySelect('hard')}
        className={selectedDifficulty === 'hard' ? 'selected' : ''}
      >
        Hard
      </button>
      <button 
        data-testid="mixed-difficulty"
        onClick={() => onDifficultySelect('mixed')}
        className={selectedDifficulty === 'mixed' ? 'selected' : ''}
      >
        Mixed
      </button>
    </div>
  )
}));

vi.mock('../Personalization', () => ({
  Personalization: ({ fineTuning, onFineTuningChange }: any) => (
    <textarea 
      data-testid="personalization-textarea"
      value={fineTuning}
      onChange={(e) => onFineTuningChange(e.target.value)}
      placeholder="Define el tema y contenido del examen"
    />
  )
}));

vi.mock('../QuestionConf', () => ({
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

vi.mock('../../TimerConf', () => ({
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

vi.mock('../../shared/AIConfiguration', () => ({
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

// Mock de constantes
vi.mock('../../../constants/examConstants', () => ({
  DEFAULT_EXAM_CONFIG: {
    QUESTION_COUNT: 10,
    FINE_TUNING: '',
    TIMER_HOUR: 1,
    TIMER_MINUTE: 30,
    TIMER_SECOND: 0
  }
}));

vi.mock('../../../constants/geminiModels', () => ({
  DEFAULT_MODEL: 'gemini-1.5-flash'
}));

vi.mock('../../../url_backend', () => ({
  url_backend: 'http://localhost:3001'
}));

// Mock de fetch
global.fetch = vi.fn();

describe('ExamConf Component - Tests Básicos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ examId: 'test-exam-123' })
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Estructura y renderizado básico', () => {
    it('debería renderizar correctamente con elementos principales', () => {
      render(<ExamConf />);

      expect(screen.getByRole('heading', { name: 'Crear Examen Inteligente' })).toBeInTheDocument();
      expect(screen.getByText('🔢 Preguntas')).toBeInTheDocument();
      expect(screen.getByText('📊 Dificultad')).toBeInTheDocument();
      expect(screen.getByText('⏱️ Tiempo')).toBeInTheDocument();
      expect(screen.getByText('🎨 Personalización')).toBeInTheDocument();
      expect(screen.getByText('🤖 Configuración de IA')).toBeInTheDocument();
    });

    it('debería mostrar botón de generar inicialmente deshabilitado', () => {
      render(<ExamConf />);

      const generateButton = screen.getByRole('button', { name: /Generar Examen/ });
      expect(generateButton).toBeDisabled();
    });

    it('debería mostrar mensaje de ayuda cuando esté deshabilitado', () => {
      render(<ExamConf />);

      expect(screen.getByText('Completa el tema y selecciona la dificultad')).toBeInTheDocument();
    });

    it('debería renderizar componentes internos', () => {
      render(<ExamConf />);

      expect(screen.getByTestId('question-conf')).toBeInTheDocument();
      expect(screen.getByTestId('difficulty-exam')).toBeInTheDocument();
      expect(screen.getByTestId('timer-conf')).toBeInTheDocument();
      expect(screen.getByTestId('personalization-textarea')).toBeInTheDocument();
      expect(screen.getByTestId('ai-configuration')).toBeInTheDocument();
    });

    it('debería manejar desmontaje sin errores', () => {
      const { unmount } = render(<ExamConf />);
      
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Configuración de preguntas', () => {
    it('debería tener valor por defecto de preguntas', () => {
      render(<ExamConf />);

      const questionCount = screen.getByTestId('question-count');
      expect(questionCount).toHaveValue(10);
    });

    it('debería actualizar número de preguntas', () => {
      render(<ExamConf />);

      const questionCount = screen.getByTestId('question-count');
      fireEvent.change(questionCount, { target: { value: '15' } });

      expect(questionCount).toHaveValue(15);
    });

    it('debería mostrar número de preguntas en el resumen', () => {
      render(<ExamConf />);

      const questionCount = screen.getByTestId('question-count');
      fireEvent.change(questionCount, { target: { value: '20' } });

      expect(screen.getByText('20')).toBeInTheDocument();
    });
  });

  describe('Selección de dificultad', () => {
    it('debería no tener dificultad seleccionada inicialmente', () => {
      render(<ExamConf />);

      expect(screen.getByText('No sel.')).toBeInTheDocument();
    });

    it('debería seleccionar dificultad fácil', () => {
      render(<ExamConf />);

      const easyButton = screen.getByTestId('easy-difficulty');
      fireEvent.click(easyButton);

      expect(easyButton).toHaveClass('selected');
    });

    it('debería seleccionar dificultad media', () => {
      render(<ExamConf />);

      const mediumButton = screen.getByTestId('medium-difficulty');
      fireEvent.click(mediumButton);

      expect(mediumButton).toHaveClass('selected');
    });

    it('debería seleccionar dificultad difícil', () => {
      render(<ExamConf />);

      const hardButton = screen.getByTestId('hard-difficulty');
      fireEvent.click(hardButton);

      expect(hardButton).toHaveClass('selected');
    });

    it('debería seleccionar dificultad mixta', () => {
      render(<ExamConf />);

      const mixedButton = screen.getByTestId('mixed-difficulty');
      fireEvent.click(mixedButton);

      expect(mixedButton).toHaveClass('selected');
    });

    it('debería cambiar entre dificultades', () => {
      render(<ExamConf />);

      const easyButton = screen.getByTestId('easy-difficulty');
      const hardButton = screen.getByTestId('hard-difficulty');

      fireEvent.click(easyButton);
      expect(easyButton).toHaveClass('selected');

      fireEvent.click(hardButton);
      expect(hardButton).toHaveClass('selected');
      expect(easyButton).not.toHaveClass('selected');
    });
  });

  describe('Configuración de timer', () => {
    it('debería tener valores por defecto del timer', () => {
      render(<ExamConf />);

      const hourInput = screen.getByTestId('timer-hour');
      const minuteInput = screen.getByTestId('timer-minute');
      const secondInput = screen.getByTestId('timer-second');

      expect(hourInput).toHaveValue('1');
      expect(minuteInput).toHaveValue('30');
      expect(secondInput).toHaveValue('0');
    });

    it('debería actualizar valores del timer', () => {
      render(<ExamConf />);

      const hourInput = screen.getByTestId('timer-hour');
      const minuteInput = screen.getByTestId('timer-minute');
      const secondInput = screen.getByTestId('timer-second');

      fireEvent.change(hourInput, { target: { value: '2' } });
      fireEvent.change(minuteInput, { target: { value: '45' } });
      fireEvent.change(secondInput, { target: { value: '30' } });

      expect(hourInput).toHaveValue('2');
      expect(minuteInput).toHaveValue('45');
      expect(secondInput).toHaveValue('30');
    });

    it('debería mostrar tiempo en el resumen', () => {
      render(<ExamConf />);

      const hourInput = screen.getByTestId('timer-hour');
      const minuteInput = screen.getByTestId('timer-minute');

      fireEvent.change(hourInput, { target: { value: '2' } });
      fireEvent.change(minuteInput, { target: { value: '0' } });

      expect(screen.getByText('2h')).toBeInTheDocument();
    });
  });

  describe('Personalización del tema', () => {
    it('debería tener textarea de personalización vacía inicialmente', () => {
      render(<ExamConf />);

      const textarea = screen.getByTestId('personalization-textarea');
      expect(textarea).toHaveValue('');
    });

    it('debería actualizar contenido de personalización', () => {
      render(<ExamConf />);

      const textarea = screen.getByTestId('personalization-textarea');
      fireEvent.change(textarea, { target: { value: 'Matemáticas avanzadas' } });

      expect(textarea).toHaveValue('Matemáticas avanzadas');
    });

    it('debería mostrar estado del tema en el resumen', () => {
      render(<ExamConf />);

      const textarea = screen.getByTestId('personalization-textarea');
      
      // Sin tema - deberían haber múltiples ✗ (tema y API)
      expect(screen.getAllByText('✗')).toHaveLength(2);

      // Con tema
      fireEvent.change(textarea, { target: { value: 'Física cuántica' } });
      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('debería manejar texto largo en personalización', () => {
      render(<ExamConf />);

      const textarea = screen.getByTestId('personalization-textarea');
      const longText = 'A'.repeat(1000);
      
      fireEvent.change(textarea, { target: { value: longText } });
      expect(textarea).toHaveValue(longText);
    });
  });

  describe('Configuración de IA', () => {
    it('debería tener modelo por defecto', () => {
      render(<ExamConf />);

      const modelSelect = screen.getByTestId('model-select');
      expect(modelSelect).toHaveValue('gemini-1.5-flash');
    });

    it('debería cambiar modelo de IA', () => {
      render(<ExamConf />);

      const modelSelect = screen.getByTestId('model-select');
      fireEvent.change(modelSelect, { target: { value: 'gemini-1.5-pro' } });

      expect(modelSelect).toHaveValue('gemini-1.5-pro');
    });

    it('debería tener API inválida inicialmente', () => {
      render(<ExamConf />);

      const apiToggle = screen.getByTestId('api-valid-toggle');
      expect(apiToggle).toHaveTextContent('API Valid: No');
    });

    it('debería togglear validez de API', () => {
      render(<ExamConf />);

      const apiToggle = screen.getByTestId('api-valid-toggle');
      fireEvent.click(apiToggle);

      expect(apiToggle).toHaveTextContent('API Valid: Yes');
    });

    it('debería mostrar estado de API en el resumen', () => {
      render(<ExamConf />);

      const apiToggle = screen.getByTestId('api-valid-toggle');
      
      // API inválida inicialmente
      expect(screen.getAllByText('✗')).toHaveLength(2); // Tema y API

      // API válida
      fireEvent.click(apiToggle);
      expect(screen.getByText('✓')).toBeInTheDocument();
    });
  });

  describe('Resumen de configuración', () => {
    it('debería mostrar resumen con estado inicial', () => {
      render(<ExamConf />);

      expect(screen.getByText('📊 Resumen de Configuración')).toBeInTheDocument();
      expect(screen.getByText('Tema')).toBeInTheDocument();
      expect(screen.getByText('Dificultad')).toBeInTheDocument();
      expect(screen.getByText('API')).toBeInTheDocument();
      expect(screen.getByText('Preguntas')).toBeInTheDocument();
      expect(screen.getByText('Tiempo')).toBeInTheDocument();
    });

    it('debería actualizar resumen cuando se completa configuración', () => {
      render(<ExamConf />);

      // Completar configuración
      const textarea = screen.getByTestId('personalization-textarea');
      fireEvent.change(textarea, { target: { value: 'Biología' } });

      const easyButton = screen.getByTestId('easy-difficulty');
      fireEvent.click(easyButton);

      const apiToggle = screen.getByTestId('api-valid-toggle');
      fireEvent.click(apiToggle);

      // Verificar estados en resumen
      expect(screen.getAllByText('✓')).toHaveLength(2); // Tema y API
      expect(screen.getByTestId('easy-difficulty')).toHaveClass('selected');
    });

    it('debería mostrar formato de tiempo correcto', () => {
      render(<ExamConf />);

      // Cambiar timer
      const hourInput = screen.getByTestId('timer-hour');
      const minuteInput = screen.getByTestId('timer-minute');
      const secondInput = screen.getByTestId('timer-second');

      fireEvent.change(hourInput, { target: { value: '0' } });
      fireEvent.change(minuteInput, { target: { value: '45' } });
      fireEvent.change(secondInput, { target: { value: '30' } });

      expect(screen.getByText('45m 30s')).toBeInTheDocument();
    });
  });

  describe('Validaciones y botón de generar', () => {
    it('debería estar deshabilitado sin configuración completa', () => {
      render(<ExamConf />);

      const generateButton = screen.getByRole('button', { name: /Generar Examen/ });
      expect(generateButton).toBeDisabled();
    });

    it('debería estar deshabilitado sin tema', () => {
      render(<ExamConf />);

      // Solo configurar dificultad y API
      const easyButton = screen.getByTestId('easy-difficulty');
      fireEvent.click(easyButton);

      const apiToggle = screen.getByTestId('api-valid-toggle');
      fireEvent.click(apiToggle);

      const generateButton = screen.getByRole('button', { name: /Generar Examen/ });
      expect(generateButton).toBeDisabled();
    });

    it('debería estar deshabilitado sin dificultad', () => {
      render(<ExamConf />);

      // Solo configurar tema y API
      const textarea = screen.getByTestId('personalization-textarea');
      fireEvent.change(textarea, { target: { value: 'Historia' } });

      const apiToggle = screen.getByTestId('api-valid-toggle');
      fireEvent.click(apiToggle);

      const generateButton = screen.getByRole('button', { name: /Generar Examen/ });
      expect(generateButton).toBeDisabled();
    });

    it('debería estar deshabilitado sin API válida', () => {
      render(<ExamConf />);

      // Solo configurar tema y dificultad
      const textarea = screen.getByTestId('personalization-textarea');
      fireEvent.change(textarea, { target: { value: 'Literatura' } });

      const easyButton = screen.getByTestId('easy-difficulty');
      fireEvent.click(easyButton);

      const generateButton = screen.getByRole('button', { name: /Generar Examen/ });
      expect(generateButton).toBeDisabled();
    });

    it('debería estar habilitado con configuración completa', () => {
      render(<ExamConf />);

      // Configuración completa
      const textarea = screen.getByTestId('personalization-textarea');
      fireEvent.change(textarea, { target: { value: 'Química' } });

      const mediumButton = screen.getByTestId('medium-difficulty');
      fireEvent.click(mediumButton);

      const apiToggle = screen.getByTestId('api-valid-toggle');
      fireEvent.click(apiToggle);

      const generateButton = screen.getByRole('button', { name: /Generar Examen/ });
      expect(generateButton).not.toBeDisabled();
    });
  });

  describe('Proceso de generación', () => {
    it('debería mostrar alerta si falta configuración', async () => {
      const Swal = (await import('sweetalert2')).default;
      
      render(<ExamConf />);

      // Configurar parcialmente para que el botón se habilite pero falte algo
      const textarea = screen.getByTestId('personalization-textarea');
      fireEvent.change(textarea, { target: { value: 'Test' } });
      
      // Sin dificultad ni API - el botón sigue deshabilitado por useMemo
      // Necesitamos hacer que la función se ejecute directamente
      const generateButton = screen.getByRole('button', { name: /Generar Examen/ });
      
      // Forzar la ejecución a pesar de estar deshabilitado
      generateButton.onclick?.({} as any);

      expect(vi.mocked(Swal.fire)).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: 'warning',
          title: 'Configuración Incompleta'
        })
      );
    });

    it('debería procesar generación exitosa', async () => {
      render(<ExamConf />);

      // Configuración completa
      const textarea = screen.getByTestId('personalization-textarea');
      fireEvent.change(textarea, { target: { value: 'Geografía' } });

      const hardButton = screen.getByTestId('hard-difficulty');
      fireEvent.click(hardButton);

      const apiToggle = screen.getByTestId('api-valid-toggle');
      fireEvent.click(apiToggle);

      const generateButton = screen.getByRole('button', { name: /Generar Examen/ });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/examen/test-exam-123');
      });
    });

    it('debería mostrar estado de carga durante generación', async () => {
      // Mock delayed response
      (global.fetch as any).mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ examId: 'test-exam-123' })
          }), 100)
        )
      );

      render(<ExamConf />);

      // Configuración completa
      const textarea = screen.getByTestId('personalization-textarea');
      fireEvent.change(textarea, { target: { value: 'Arte' } });

      const mixedButton = screen.getByTestId('mixed-difficulty');
      fireEvent.click(mixedButton);

      const apiToggle = screen.getByTestId('api-valid-toggle');
      fireEvent.click(apiToggle);

      const generateButton = screen.getByRole('button', { name: /Generar Examen/ });
      fireEvent.click(generateButton);

      // Verificar estado de carga
      expect(screen.getByText('Generando examen con IA...')).toBeInTheDocument();
      expect(screen.getByText('Esto puede tardar unos momentos')).toBeInTheDocument();
    });

    it('debería manejar error de generación', async () => {
      const Swal = (await import('sweetalert2')).default;
      
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      render(<ExamConf />);

      // Configuración completa
      const textarea = screen.getByTestId('personalization-textarea');
      fireEvent.change(textarea, { target: { value: 'Música' } });

      const easyButton = screen.getByTestId('easy-difficulty');
      fireEvent.click(easyButton);

      const apiToggle = screen.getByTestId('api-valid-toggle');
      fireEvent.click(apiToggle);

      const generateButton = screen.getByRole('button', { name: /Generar Examen/ });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(vi.mocked(Swal.fire)).toHaveBeenCalledWith(
          expect.objectContaining({
            icon: 'error',
            title: 'Error al Generar Examen'
          })
        );
      });
    });

    it('debería enviar payload correcto al backend', async () => {
      render(<ExamConf />);

      // Configuración específica
      const textarea = screen.getByTestId('personalization-textarea');
      fireEvent.change(textarea, { target: { value: 'Estadística aplicada' } });

      const questionCount = screen.getByTestId('question-count');
      fireEvent.change(questionCount, { target: { value: '25' } });

      const hourInput = screen.getByTestId('timer-hour');
      const minuteInput = screen.getByTestId('timer-minute');
      fireEvent.change(hourInput, { target: { value: '2' } });
      fireEvent.change(minuteInput, { target: { value: '30' } });

      const hardButton = screen.getByTestId('hard-difficulty');
      fireEvent.click(hardButton);

      const modelSelect = screen.getByTestId('model-select');
      fireEvent.change(modelSelect, { target: { value: 'gemini-1.5-pro' } });

      const apiToggle = screen.getByTestId('api-valid-toggle');
      fireEvent.click(apiToggle);

      const generateButton = screen.getByRole('button', { name: /Generar Examen/ });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/generate-content',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              authorization: 'Bearer mock-token'
            }),
            body: JSON.stringify({
              prompt: 'Genera un examen de 25 preguntas sobre el siguiente tema:\nTema y contenido: Estadística aplicada\nNivel de dificultad: hard\n',
              dificultad: 'hard',
              tiempo_limite_segundos: 9000, // 2h 30m = 9000s
              modelo: 'gemini-1.5-pro'
            })
          })
        );
      });
    });
  });

  describe('Casos edge y validaciones', () => {
    it('debería manejar componente sin crashes', () => {
      expect(() => render(<ExamConf />)).not.toThrow();
    });

    it('debería manejar múltiples clicks en generar', async () => {
      render(<ExamConf />);

      const generateButton = screen.getByRole('button', { name: /Generar Examen/ });
      
      fireEvent.click(generateButton);
      fireEvent.click(generateButton);
      fireEvent.click(generateButton);

      // No debería crashear
      expect(generateButton).toBeInTheDocument();
    });

    it('debería manejar cambios rápidos de configuración', () => {
      render(<ExamConf />);

      const easyButton = screen.getByTestId('easy-difficulty');
      const mediumButton = screen.getByTestId('medium-difficulty');
      const hardButton = screen.getByTestId('hard-difficulty');

      // Cambios rápidos
      fireEvent.click(easyButton);
      fireEvent.click(mediumButton);
      fireEvent.click(hardButton);
      fireEvent.click(easyButton);

      expect(easyButton).toHaveClass('selected');
    });

    it('debería mantener estado entre re-renders', () => {
      const { rerender } = render(<ExamConf />);

      // Configurar estado
      const textarea = screen.getByTestId('personalization-textarea');
      fireEvent.change(textarea, { target: { value: 'Test content' } });

      const easyButton = screen.getByTestId('easy-difficulty');
      fireEvent.click(easyButton);

      // Re-render
      rerender(<ExamConf />);

      // El estado debería persistir
      expect(textarea).toHaveValue('Test content');
      expect(easyButton).toHaveClass('selected');
    });

    it('debería manejar valores extremos en configuración', () => {
      render(<ExamConf />);

      const questionCount = screen.getByTestId('question-count');
      const hourInput = screen.getByTestId('timer-hour');

      fireEvent.change(questionCount, { target: { value: '999' } });
      fireEvent.change(hourInput, { target: { value: '24' } });

      expect(questionCount).toHaveValue(999);
      expect(hourInput).toHaveValue('24');
    });

    it('debería manejar texto vacío en personalización', () => {
      render(<ExamConf />);

      const textarea = screen.getByTestId('personalization-textarea');
      
      fireEvent.change(textarea, { target: { value: 'test' } });
      fireEvent.change(textarea, { target: { value: '' } });

      expect(textarea).toHaveValue('');
      expect(screen.getAllByText('✗')).toHaveLength(2); // Tema y API no válidos
    });

    it('debería manejar respuesta del servidor sin examId', async () => {
      const Swal = (await import('sweetalert2')).default;
      
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}) // Sin examId
      });

      render(<ExamConf />);

      // Configuración completa
      const textarea = screen.getByTestId('personalization-textarea');
      fireEvent.change(textarea, { target: { value: 'Test subject' } });

      const easyButton = screen.getByTestId('easy-difficulty');
      fireEvent.click(easyButton);

      const apiToggle = screen.getByTestId('api-valid-toggle');
      fireEvent.click(apiToggle);

      const generateButton = screen.getByRole('button', { name: /Generar Examen/ });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(vi.mocked(Swal.fire)).toHaveBeenCalledWith(
          expect.objectContaining({
            icon: 'error',
            title: 'Error al Generar Examen'
          })
        );
      });
    });
  });
});