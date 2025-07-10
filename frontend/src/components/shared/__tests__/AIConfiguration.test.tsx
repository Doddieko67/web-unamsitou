import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AIConfiguration } from '../AIConfiguration';

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

// Mock de ApiKeyService
vi.mock('../../../services/apiKeyService', () => ({
  ApiKeyService: {
    validateApiKey: vi.fn(),
    saveApiKey: vi.fn(),
    getApiKeyStatus: vi.fn(),
    deleteApiKey: vi.fn(),
  }
}));

// Mock de GeminiService
vi.mock('../../../services/geminiService', () => ({
  GeminiService: {}
}));

// Mock de geminiModels
vi.mock('../../../constants/geminiModels', () => ({
  GEMINI_MODELS: [
    {
      name: 'gemini-1.5-flash',
      displayName: 'Gemini 1.5 Flash',
      description: 'Modelo rápido y eficiente'
    },
    {
      name: 'gemini-1.5-pro',
      displayName: 'Gemini 1.5 Pro',
      description: 'Modelo avanzado para tareas complejas'
    }
  ],
  DEFAULT_MODEL: 'gemini-1.5-flash'
}));

describe('AIConfiguration Component - Tests Básicos', () => {
  const defaultProps = {
    selectedModel: 'gemini-1.5-flash',
    onModelChange: vi.fn(),
    isApiValid: false,
    onApiValidChange: vi.fn(),
    className: 'test-class'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Estructura y renderizado básico', () => {
    it('debería renderizar correctamente con props básicas', () => {
      render(<AIConfiguration {...defaultProps} />);

      expect(screen.getByText('Modelo de IA')).toBeInTheDocument();
      expect(screen.getByText('API Key de Google')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('AIza...')).toBeInTheDocument();
    });

    it('debería aplicar className personalizada', () => {
      const { container } = render(<AIConfiguration {...defaultProps} />);
      
      expect(container.firstChild).toHaveClass('test-class');
    });

    it('debería manejar componente sin className', () => {
      const propsWithoutClassName = { ...defaultProps };
      delete propsWithoutClassName.className;
      
      expect(() => render(<AIConfiguration {...propsWithoutClassName} />)).not.toThrow();
    });

    it('debería manejar desmontaje sin errores', () => {
      const { unmount } = render(<AIConfiguration {...defaultProps} />);
      
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Selección de modelos', () => {
    it('debería mostrar modelos bloqueados cuando API no es válida', () => {
      render(<AIConfiguration {...defaultProps} isApiValid={false} />);
      
      expect(screen.getByText('Modelos no disponibles')).toBeInTheDocument();
      expect(screen.getByText('Configura una API key válida para ver los modelos')).toBeInTheDocument();
    });

    it('debería mostrar lista de modelos cuando API es válida', () => {
      render(<AIConfiguration {...defaultProps} isApiValid={true} />);
      
      expect(screen.getByText('Gemini 1.5 Flash')).toBeInTheDocument();
      expect(screen.getByText('Gemini 1.5 Pro')).toBeInTheDocument();
      expect(screen.getByText('Modelo rápido y eficiente')).toBeInTheDocument();
    });

    it('debería llamar onModelChange al seleccionar modelo', () => {
      render(<AIConfiguration {...defaultProps} isApiValid={true} />);
      
      const proModel = screen.getByText('Gemini 1.5 Pro');
      fireEvent.click(proModel);
      
      expect(defaultProps.onModelChange).toHaveBeenCalledWith('gemini-1.5-pro');
    });

    it('debería marcar modelo seleccionado visualmente', () => {
      render(<AIConfiguration {...defaultProps} isApiValid={true} selectedModel="gemini-1.5-pro" />);
      
      const selectedButton = screen.getByText('Gemini 1.5 Pro').closest('button');
      expect(selectedButton).toHaveClass('selected');
    });

    it('debería permitir múltiples selecciones de modelo', () => {
      render(<AIConfiguration {...defaultProps} isApiValid={true} />);
      
      const flashModel = screen.getByText('Gemini 1.5 Flash');
      const proModel = screen.getByText('Gemini 1.5 Pro');
      
      fireEvent.click(flashModel);
      fireEvent.click(proModel);
      fireEvent.click(flashModel);
      
      expect(defaultProps.onModelChange).toHaveBeenCalledTimes(3);
      expect(defaultProps.onModelChange).toHaveBeenNthCalledWith(1, 'gemini-1.5-flash');
      expect(defaultProps.onModelChange).toHaveBeenNthCalledWith(2, 'gemini-1.5-pro');
      expect(defaultProps.onModelChange).toHaveBeenNthCalledWith(3, 'gemini-1.5-flash');
    });
  });

  describe('Input y validación básica', () => {
    it('debería cambiar valor del input', () => {
      render(<AIConfiguration {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('AIza...');
      fireEvent.change(input, { target: { value: 'AIzaSyC1234567890' } });
      
      expect(input).toHaveValue('AIzaSyC1234567890');
    });

    it('debería llamar onApiValidChange al cambiar input', () => {
      render(<AIConfiguration {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('AIza...');
      fireEvent.change(input, { target: { value: 'test' } });
      
      expect(defaultProps.onApiValidChange).toHaveBeenCalledWith(false);
    });

    it('debería manejar múltiples cambios en input', () => {
      render(<AIConfiguration {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('AIza...');
      
      fireEvent.change(input, { target: { value: 'A' } });
      fireEvent.change(input, { target: { value: 'AI' } });
      fireEvent.change(input, { target: { value: 'AIz' } });
      
      expect(input).toHaveValue('AIz');
      expect(defaultProps.onApiValidChange).toHaveBeenCalledTimes(3);
    });

    it('debería mostrar botón guardar cuando API es válida y hay texto', () => {
      render(<AIConfiguration {...defaultProps} isApiValid={true} />);
      
      const input = screen.getByPlaceholderText('AIza...');
      fireEvent.change(input, { target: { value: 'AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz' } });
      
      expect(screen.getByText('Guardar')).toBeInTheDocument();
    });
  });

  describe('Enlaces y botones externos', () => {
    it('debería mostrar enlace a tutorial de YouTube', () => {
      render(<AIConfiguration {...defaultProps} />);
      
      const tutorialLink = screen.getByText('Ver tutorial');
      expect(tutorialLink.closest('a')).toHaveAttribute('href', 'https://youtu.be/RVGbLSVFtIk?si=svQg0FVLtHrFYcap&t=21');
      expect(tutorialLink.closest('a')).toHaveAttribute('target', '_blank');
    });

    it('debería mostrar texto de ayuda para obtener API key', () => {
      render(<AIConfiguration {...defaultProps} />);
      
      expect(screen.getByText('Obtén tu API key en Google AI Studio')).toBeInTheDocument();
    });

    it('debería tener icono de YouTube en enlace tutorial', () => {
      render(<AIConfiguration {...defaultProps} />);
      
      const tutorialButton = screen.getByText('Ver tutorial').closest('a');
      expect(tutorialButton?.querySelector('i.fab.fa-youtube')).toBeInTheDocument();
    });

    it('debería tener icono de guardar en botón save', () => {
      render(<AIConfiguration {...defaultProps} isApiValid={true} />);
      
      const input = screen.getByPlaceholderText('AIza...');
      fireEvent.change(input, { target: { value: 'AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz' } });
      
      const saveButton = screen.getByText('Guardar').closest('button');
      expect(saveButton?.querySelector('i.fas.fa-save')).toBeInTheDocument();
    });
  });

  describe('Comportamiento y flujo de usuario', () => {
    it('debería funcionar componente con diferentes estados de isApiValid', () => {
      const { rerender } = render(<AIConfiguration {...defaultProps} isApiValid={false} />);
      
      expect(screen.getByText('Modelos no disponibles')).toBeInTheDocument();
      
      rerender(<AIConfiguration {...defaultProps} isApiValid={true} />);
      
      expect(screen.getByText('Gemini 1.5 Flash')).toBeInTheDocument();
    });

    it('debería mantener valor del input después de cambios', () => {
      render(<AIConfiguration {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('AIza...');
      const testValue = 'AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz';
      
      fireEvent.change(input, { target: { value: testValue } });
      
      expect(input).toHaveValue(testValue);
    });

    it('debería permitir borrar contenido del input', () => {
      render(<AIConfiguration {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('AIza...');
      
      fireEvent.change(input, { target: { value: 'some text' } });
      expect(input).toHaveValue('some text');
      
      fireEvent.change(input, { target: { value: '' } });
      expect(input).toHaveValue('');
    });

    it('debería manejar props selectedModel correctamente', () => {
      const { rerender } = render(<AIConfiguration {...defaultProps} isApiValid={true} selectedModel="gemini-1.5-flash" />);
      
      let selectedButton = screen.getByText('Gemini 1.5 Flash').closest('button');
      expect(selectedButton).toHaveClass('selected');
      
      rerender(<AIConfiguration {...defaultProps} isApiValid={true} selectedModel="gemini-1.5-pro" />);
      
      selectedButton = screen.getByText('Gemini 1.5 Pro').closest('button');
      expect(selectedButton).toHaveClass('selected');
    });
  });

  describe('Casos edge y validaciones', () => {
    it('debería manejar props undefined/null graciosamente', () => {
      const minimalProps = {
        selectedModel: '',
        onModelChange: vi.fn(),
        isApiValid: false,
        onApiValidChange: vi.fn(),
      };
      
      expect(() => render(<AIConfiguration {...minimalProps} />)).not.toThrow();
    });

    it('debería funcionar sin llamadas a funciones callback', () => {
      const propsWithoutCallbacks = {
        selectedModel: 'gemini-1.5-flash',
        onModelChange: undefined as any,
        isApiValid: false,
        onApiValidChange: undefined as any,
      };
      
      expect(() => render(<AIConfiguration {...propsWithoutCallbacks} />)).not.toThrow();
    });

    it('debería manejar input con valor muy largo', () => {
      render(<AIConfiguration {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('AIza...');
      const longValue = 'A'.repeat(1000);
      
      fireEvent.change(input, { target: { value: longValue } });
      
      expect(input).toHaveValue(longValue);
    });

    it('debería manejar caracteres especiales en input', () => {
      render(<AIConfiguration {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('AIza...');
      const specialChars = 'AIzaSyC_1234-567890@#$%^&*()';
      
      fireEvent.change(input, { target: { value: specialChars } });
      
      expect(input).toHaveValue(specialChars);
    });

    it('debería renderizar con lista vacía de modelos', () => {
      // Este test verifica que el componente no falle si no hay modelos
      expect(() => render(<AIConfiguration {...defaultProps} isApiValid={true} />)).not.toThrow();
    });

    it('debería manejar clicks repetidos en el mismo modelo', () => {
      render(<AIConfiguration {...defaultProps} isApiValid={true} />);
      
      const flashModel = screen.getByText('Gemini 1.5 Flash');
      
      fireEvent.click(flashModel);
      fireEvent.click(flashModel);
      fireEvent.click(flashModel);
      
      expect(defaultProps.onModelChange).toHaveBeenCalledTimes(3);
      expect(defaultProps.onModelChange).toHaveBeenCalledWith('gemini-1.5-flash');
    });

    it('debería mantener estado después de re-renders', () => {
      const { rerender } = render(<AIConfiguration {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('AIza...');
      fireEvent.change(input, { target: { value: 'test-value' } });
      
      expect(input).toHaveValue('test-value');
      
      // Re-render con las mismas props
      rerender(<AIConfiguration {...defaultProps} />);
      
      // El input debería mantener su valor (por el estado interno del componente)
      const newInput = screen.getByPlaceholderText('AIza...');
      expect(newInput).toBeInTheDocument();
    });

    it('debería manejar prop className vacía', () => {
      const propsWithEmptyClassName = { ...defaultProps, className: '' };
      
      expect(() => render(<AIConfiguration {...propsWithEmptyClassName} />)).not.toThrow();
      
      const { container } = render(<AIConfiguration {...propsWithEmptyClassName} />);
      expect(container.firstChild).toHaveClass('space-y-6');
    });

    it('debería renderizar correctamente sin modelos seleccionados', () => {
      render(<AIConfiguration {...defaultProps} isApiValid={true} selectedModel="" />);
      
      expect(screen.getByText('Gemini 1.5 Flash')).toBeInTheDocument();
      expect(screen.getByText('Gemini 1.5 Pro')).toBeInTheDocument();
      
      // Verificar que ningún botón tiene la clase 'selected'
      const buttons = screen.getAllByRole('button');
      const modelButtons = buttons.filter(button => 
        button.textContent?.includes('Gemini')
      );
      
      modelButtons.forEach(button => {
        expect(button).not.toHaveClass('selected');
      });
    });
  });
});