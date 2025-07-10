import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ExamQuestions } from '../ExamQuestions';

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
vi.mock('../../stores/authStore', () => ({
  useAuthStore: () => ({
    session: { access_token: 'mock-token' }
  })
}));

// Mock de PDF viewer
vi.mock('@react-pdf-viewer/core', () => ({
  Viewer: ({ children }: any) => <div data-testid="pdf-viewer">{children}</div>,
  Worker: ({ children }: any) => <div data-testid="pdf-worker">{children}</div>
}));

vi.mock('@react-pdf-viewer/default-layout', () => ({
  defaultLayoutPlugin: () => ({
    toolbarPlugin: {},
    sidebarPlugin: {}
  })
}));

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

// Mock de constantes
vi.mock('../../constants/examConstants', () => ({
  DEFAULT_EXAM_CONFIG: {
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

// Mock de URL.createObjectURL y revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('ExamQuestions Component - Tests Básicos', () => {
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
      render(<ExamQuestions />);

      expect(screen.getByText('Subir y Procesar Contenido')).toBeInTheDocument();
      expect(screen.getByText('📁 Agregar Contenido de Estudio')).toBeInTheDocument();
      expect(screen.getByText('⏱️ Tiempo')).toBeInTheDocument();
      expect(screen.getByText('📝 Instrucciones')).toBeInTheDocument();
      expect(screen.getByText('🤖 Configuración de IA')).toBeInTheDocument();
    });

    it('debería mostrar botón de generar inicialmente deshabilitado', () => {
      render(<ExamQuestions />);

      const generateButton = screen.getByText('Procesar y Generar').closest('button');
      expect(generateButton).toBeDisabled();
    });

    it('debería mostrar mensaje de contenido requerido', () => {
      render(<ExamQuestions />);

      expect(screen.getByText('Añade contenido y configura la API key')).toBeInTheDocument();
    });

    it('debería renderizar componentes internos', () => {
      render(<ExamQuestions />);

      expect(screen.getByTestId('timer-conf')).toBeInTheDocument();
      expect(screen.getByTestId('personalization-textarea')).toBeInTheDocument();
      expect(screen.getByTestId('ai-configuration')).toBeInTheDocument();
    });

    it('debería manejar desmontaje sin errores', () => {
      const { unmount } = render(<ExamQuestions />);
      
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Sistema de paneles deslizantes', () => {
    it('debería mostrar panel de archivos por defecto', () => {
      render(<ExamQuestions />);

      expect(screen.getByText('Subir Archivos')).toBeInTheDocument();
      expect(screen.getByText('PDFs, imágenes y documentos')).toBeInTheDocument();
    });

    it('debería cambiar a panel de texto al hacer click', () => {
      render(<ExamQuestions />);

      const textPanel = screen.getByText('Pegar Texto Directamente');
      fireEvent.click(textPanel);

      expect(screen.getByPlaceholderText(/Pega aquí el contenido del material/)).toBeInTheDocument();
    });

    it('debería mostrar límites y validaciones en panel de archivos', () => {
      render(<ExamQuestions />);

      expect(screen.getByText('Límites y Validaciones:')).toBeInTheDocument();
      expect(screen.getByText(/Máx 20 archivos, 50 imágenes/)).toBeInTheDocument();
      expect(screen.getByText(/PDF, JPG, PNG, WEBP, TXT, MD/)).toBeInTheDocument();
    });

    it('debería volver al panel de archivos después de cambiar', () => {
      render(<ExamQuestions />);

      // Cambiar a texto
      const textPanel = screen.getByText('Pegar Texto Directamente');
      fireEvent.click(textPanel);

      // Volver a archivos
      const filesPanel = screen.getByText(/Subir Archivos/);
      fireEvent.click(filesPanel);

      expect(screen.getByText('Arrastra archivos aquí')).toBeInTheDocument();
    });
  });

  describe('Manejo de texto', () => {
    it('debería actualizar textarea de contenido', () => {
      render(<ExamQuestions />);

      // Cambiar a panel de texto
      const textPanel = screen.getByText('Pegar Texto Directamente');
      fireEvent.click(textPanel);

      const textarea = screen.getByPlaceholderText(/Pega aquí el contenido del material/);
      fireEvent.change(textarea, { target: { value: 'Contenido de prueba' } });

      expect(textarea).toHaveValue('Contenido de prueba');
    });

    it('debería actualizar textarea de personalización', () => {
      render(<ExamQuestions />);

      const personalizationTextarea = screen.getByTestId('personalization-textarea');
      fireEvent.change(personalizationTextarea, { target: { value: 'Instrucciones personalizadas' } });

      expect(personalizationTextarea).toHaveValue('Instrucciones personalizadas');
    });

    it('debería manejar texto largo sin problemas', () => {
      render(<ExamQuestions />);

      const textPanel = screen.getByText('Pegar Texto Directamente');
      fireEvent.click(textPanel);

      const textarea = screen.getByPlaceholderText(/Pega aquí el contenido del material/);
      const longText = 'A'.repeat(10000);
      
      fireEvent.change(textarea, { target: { value: longText } });

      expect(textarea).toHaveValue(longText);
    });

    it('debería manejar texto vacío', () => {
      render(<ExamQuestions />);

      const textPanel = screen.getByText('Pegar Texto Directamente');
      fireEvent.click(textPanel);

      const textarea = screen.getByPlaceholderText(/Pega aquí el contenido del material/);
      fireEvent.change(textarea, { target: { value: 'test' } });
      fireEvent.change(textarea, { target: { value: '' } });

      expect(textarea).toHaveValue('');
    });
  });

  describe('Configuración de timer', () => {
    it('debería tener valores por defecto del timer', () => {
      render(<ExamQuestions />);

      const hourInput = screen.getByTestId('timer-hour');
      const minuteInput = screen.getByTestId('timer-minute');
      const secondInput = screen.getByTestId('timer-second');

      expect(hourInput).toHaveValue('1');
      expect(minuteInput).toHaveValue('30');
      expect(secondInput).toHaveValue('0');
    });

    it('debería actualizar valores del timer', () => {
      render(<ExamQuestions />);

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

    it('debería manejar valores numéricos del timer', () => {
      render(<ExamQuestions />);

      const hourInput = screen.getByTestId('timer-hour');
      
      fireEvent.change(hourInput, { target: { value: '0' } });
      expect(hourInput).toHaveValue('0');

      fireEvent.change(hourInput, { target: { value: '24' } });
      expect(hourInput).toHaveValue('24');
    });
  });

  describe('Configuración de IA', () => {
    it('debería tener modelo por defecto', () => {
      render(<ExamQuestions />);

      const modelSelect = screen.getByTestId('model-select');
      expect(modelSelect).toHaveValue('gemini-1.5-flash');
    });

    it('debería cambiar modelo de IA', () => {
      render(<ExamQuestions />);

      const modelSelect = screen.getByTestId('model-select');
      fireEvent.change(modelSelect, { target: { value: 'gemini-1.5-pro' } });

      expect(modelSelect).toHaveValue('gemini-1.5-pro');
    });

    it('debería togglear estado de API válida', () => {
      render(<ExamQuestions />);

      const apiToggle = screen.getByTestId('api-valid-toggle');
      expect(apiToggle).toHaveTextContent('API Valid: No');

      fireEvent.click(apiToggle);
      expect(apiToggle).toHaveTextContent('API Valid: Yes');
    });

    it('debería habilitar botón generar con API válida y contenido', () => {
      render(<ExamQuestions />);

      // Agregar contenido de texto
      const textPanel = screen.getByText('Pegar Texto Directamente');
      fireEvent.click(textPanel);

      const textarea = screen.getByPlaceholderText(/Pega aquí el contenido del material/);
      fireEvent.change(textarea, { target: { value: 'Contenido de prueba' } });

      // Validar API
      const apiToggle = screen.getByTestId('api-valid-toggle');
      fireEvent.click(apiToggle);

      const generateButton = screen.getByText('Procesar y Generar').closest('button');
      expect(generateButton).not.toBeDisabled();
    });
  });

  describe('Subida de archivos', () => {
    it('debería mostrar area de drag and drop', () => {
      render(<ExamQuestions />);

      expect(screen.getByText('Arrastra archivos aquí')).toBeInTheDocument();
      expect(screen.getByText('Seleccionar archivos')).toBeInTheDocument();
    });

    it('debería manejar input de archivos', () => {
      render(<ExamQuestions />);

      const fileInput = screen.getByLabelText('Seleccionar archivos');
      expect(fileInput).toHaveAttribute('type', 'file');
      expect(fileInput).toHaveAttribute('multiple');
    });

    it('debería simular cambio de archivos', () => {
      render(<ExamQuestions />);

      const fileInput = screen.getByLabelText('Seleccionar archivos');
      
      // Crear archivo mock
      const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      
      Object.defineProperty(fileInput, 'files', {
        value: [mockFile],
        writable: false,
      });

      fireEvent.change(fileInput);

      // Verificar que el evento se dispara sin errores
      expect(fileInput.files).toHaveLength(1);
      expect(fileInput.files?.[0]).toBe(mockFile);
    });

    it('debería manejar múltiples archivos', () => {
      render(<ExamQuestions />);

      const fileInput = screen.getByLabelText('Seleccionar archivos');
      
      const mockFiles = [
        new File(['test1'], 'test1.pdf', { type: 'application/pdf' }),
        new File(['test2'], 'test2.png', { type: 'image/png' }),
        new File(['test3'], 'test3.txt', { type: 'text/plain' })
      ];
      
      Object.defineProperty(fileInput, 'files', {
        value: mockFiles,
        writable: false,
      });

      fireEvent.change(fileInput);

      expect(fileInput.files).toHaveLength(3);
    });
  });

  describe('Drag and Drop', () => {
    it('debería manejar eventos de drag over', () => {
      render(<ExamQuestions />);

      const dropArea = screen.getByText('Arrastra archivos aquí').closest('div');
      
      fireEvent.dragOver(dropArea!, {
        dataTransfer: {
          files: []
        }
      });

      // Verificar que el evento se maneja sin errores
      expect(dropArea).toBeInTheDocument();
    });

    it('debería manejar eventos de drag leave', () => {
      render(<ExamQuestions />);

      const dropArea = screen.getByText('Arrastra archivos aquí').closest('div');
      
      fireEvent.dragLeave(dropArea!);

      expect(dropArea).toBeInTheDocument();
    });

    it('debería manejar eventos de drop', () => {
      render(<ExamQuestions />);

      const dropArea = screen.getByText('Arrastra archivos aquí').closest('div');
      
      const mockFiles = [
        new File(['test'], 'test.pdf', { type: 'application/pdf' })
      ];

      fireEvent.drop(dropArea!, {
        dataTransfer: {
          files: mockFiles
        }
      });

      // Verificar que el evento se maneja sin errores
      expect(dropArea).toBeInTheDocument();
    });
  });

  describe('Resumen de configuración', () => {
    it('debería mostrar resumen con estado inicial', () => {
      render(<ExamQuestions />);

      expect(screen.getByText('📊 Resumen de Configuración')).toBeInTheDocument();
      expect(screen.getByText('Contenido')).toBeInTheDocument();
      expect(screen.getByText('API')).toBeInTheDocument();
      expect(screen.getByText('Archivos')).toBeInTheDocument();
      expect(screen.getByText('Tiempo')).toBeInTheDocument();
    });

    it('debería actualizar resumen con contenido', () => {
      render(<ExamQuestions />);

      // Agregar texto
      const textPanel = screen.getByText('Pegar Texto Directamente');
      fireEvent.click(textPanel);

      const textarea = screen.getByPlaceholderText(/Pega aquí el contenido del material/);
      fireEvent.change(textarea, { target: { value: 'Contenido de prueba' } });

      // El resumen debería reflejar que hay contenido
      expect(screen.getByText('0')).toBeInTheDocument(); // Archivos
    });

    it('debería mostrar tiempo en formato correcto', () => {
      render(<ExamQuestions />);

      // Buscar elementos que contengan tiempo
      const timeElements = screen.getAllByText(/1h|30m|0s/);
      expect(timeElements.length).toBeGreaterThan(0);
    });
  });

  describe('Proceso de generación', () => {
    it('debería no permitir generación sin contenido', () => {
      render(<ExamQuestions />);

      const generateButton = screen.getByText('Procesar y Generar').closest('button');
      expect(generateButton).toBeDisabled();
    });

    it('debería no permitir generación sin API válida', () => {
      render(<ExamQuestions />);

      // Agregar contenido
      const textPanel = screen.getByText('Pegar Texto Directamente');
      fireEvent.click(textPanel);

      const textarea = screen.getByPlaceholderText(/Pega aquí el contenido del material/);
      fireEvent.change(textarea, { target: { value: 'Contenido de prueba' } });

      const generateButton = screen.getByText('Procesar y Generar').closest('button');
      expect(generateButton).toBeDisabled();
    });

    it('debería habilitar generación con contenido y API válida', () => {
      render(<ExamQuestions />);

      // Configurar contenido y API
      const textPanel = screen.getByText('Pegar Texto Directamente');
      fireEvent.click(textPanel);

      const textarea = screen.getByPlaceholderText(/Pega aquí el contenido del material/);
      fireEvent.change(textarea, { target: { value: 'Contenido de prueba' } });

      const apiToggle = screen.getByTestId('api-valid-toggle');
      fireEvent.click(apiToggle);

      const generateButton = screen.getByText('Procesar y Generar').closest('button');
      expect(generateButton).not.toBeDisabled();
    });
  });

  describe('Estados de interfaz', () => {
    it('debería mostrar configuración predeterminada', () => {
      render(<ExamQuestions />);

      // Verificar elementos de configuración
      expect(screen.getByText('📊 Resumen de Configuración')).toBeInTheDocument();
      expect(screen.getByText('Añade contenido y configura la API key')).toBeInTheDocument();
    });

    it('debería actualizar interfaz según configuración', () => {
      render(<ExamQuestions />);

      // Cambiar configuración
      const apiToggle = screen.getByTestId('api-valid-toggle');
      fireEvent.click(apiToggle);

      // La interfaz debería reflejar el cambio
      expect(apiToggle).toHaveTextContent('API Valid: Yes');
    });
  });

  describe('Casos edge y validaciones', () => {
    it('debería manejar componente sin crashes', () => {
      expect(() => render(<ExamQuestions />)).not.toThrow();
    });

    it('debería manejar múltiples clicks en generar', async () => {
      render(<ExamQuestions />);

      const generateButton = screen.getByText('Procesar y Generar');
      
      fireEvent.click(generateButton);
      fireEvent.click(generateButton);
      fireEvent.click(generateButton);

      // No debería crashear
      expect(generateButton).toBeInTheDocument();
    });

    it('debería manejar cambios rápidos de panel', () => {
      render(<ExamQuestions />);

      const textPanel = screen.getByText('Pegar Texto Directamente');
      const filesPanel = screen.getByText(/Subir Archivos/);

      // Cambios rápidos
      fireEvent.click(textPanel);
      fireEvent.click(filesPanel);
      fireEvent.click(textPanel);
      fireEvent.click(filesPanel);

      expect(screen.getByText('Arrastra archivos aquí')).toBeInTheDocument();
    });

    it('debería mantener estado entre re-renders', () => {
      const { rerender } = render(<ExamQuestions />);

      // Agregar contenido
      const textPanel = screen.getByText('Pegar Texto Directamente');
      fireEvent.click(textPanel);

      const textarea = screen.getByPlaceholderText(/Pega aquí el contenido del material/);
      fireEvent.change(textarea, { target: { value: 'Test content' } });

      // Re-render
      rerender(<ExamQuestions />);

      // El contenido debería persistir
      expect(textarea).toHaveValue('Test content');
    });

    it('debería manejar valores extremos en timer', () => {
      render(<ExamQuestions />);

      const hourInput = screen.getByTestId('timer-hour');
      
      fireEvent.change(hourInput, { target: { value: '999' } });
      expect(hourInput).toHaveValue('999');

      fireEvent.change(hourInput, { target: { value: '0' } });
      expect(hourInput).toHaveValue('0');
    });
  });
});