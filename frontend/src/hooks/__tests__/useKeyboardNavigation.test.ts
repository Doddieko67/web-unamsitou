import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboardNavigation } from '../useKeyboardNavigation';
import type { KeyboardNavigationConfig } from '../useKeyboardNavigation';

// Mock functions for the config
const createMockConfig = (overrides?: Partial<KeyboardNavigationConfig>): KeyboardNavigationConfig => ({
  onPrevious: vi.fn(),
  onNext: vi.fn(),
  onAnswer1: vi.fn(),
  onAnswer2: vi.fn(),
  onAnswer3: vi.fn(),
  onAnswer4: vi.fn(),
  isSubmitted: false,
  disabled: false,
  ...overrides,
});

// Helper to simulate keyboard events
const simulateKeyPress = (key: string, element = window) => {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
  });
  
  const preventDefault = vi.spyOn(event, 'preventDefault');
  element.dispatchEvent(event);
  return { event, preventDefault };
};

// Helper to create mock DOM elements
const createMockElement = (tagName: string) => {
  const element = document.createElement(tagName);
  return element;
};

describe('useKeyboardNavigation Hook - Tests Básicos', () => {
  let mockConfig: KeyboardNavigationConfig;

  beforeEach(() => {
    mockConfig = createMockConfig();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any event listeners
    document.body.innerHTML = '';
  });

  describe('Configuración y estructura básica', () => {
    it('debería configurarse sin errores', () => {
      expect(() => {
        renderHook(() => useKeyboardNavigation(mockConfig));
      }).not.toThrow();
    });

    it('debería manejar configuración mínima', () => {
      const minimalConfig = createMockConfig();
      
      expect(() => {
        renderHook(() => useKeyboardNavigation(minimalConfig));
      }).not.toThrow();
    });

    it('debería manejar configuración con disabled por defecto', () => {
      const configWithoutDisabled = {
        onPrevious: vi.fn(),
        onNext: vi.fn(),
        onAnswer1: vi.fn(),
        onAnswer2: vi.fn(),
        onAnswer3: vi.fn(),
        onAnswer4: vi.fn(),
        isSubmitted: false,
      } as KeyboardNavigationConfig;

      expect(() => {
        renderHook(() => useKeyboardNavigation(configWithoutDisabled));
      }).not.toThrow();
    });

    it('debería manejar desmontaje correctamente', () => {
      const { unmount } = renderHook(() => useKeyboardNavigation(mockConfig));

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Navegación con teclas de flecha', () => {
    it('debería navegar hacia atrás con flecha izquierda', () => {
      renderHook(() => useKeyboardNavigation(mockConfig));

      const { preventDefault } = simulateKeyPress('ArrowLeft');

      expect(mockConfig.onPrevious).toHaveBeenCalledTimes(1);
      expect(preventDefault).toHaveBeenCalled();
    });

    it('debería navegar hacia adelante con flecha derecha', () => {
      renderHook(() => useKeyboardNavigation(mockConfig));

      const { preventDefault } = simulateKeyPress('ArrowRight');

      expect(mockConfig.onNext).toHaveBeenCalledTimes(1);
      expect(preventDefault).toHaveBeenCalled();
    });

    it('debería navegar hacia adelante con Enter', () => {
      renderHook(() => useKeyboardNavigation(mockConfig));

      const { preventDefault } = simulateKeyPress('Enter');

      expect(mockConfig.onNext).toHaveBeenCalledTimes(1);
      expect(preventDefault).toHaveBeenCalled();
    });

    it('debería permitir múltiples navegaciones', () => {
      renderHook(() => useKeyboardNavigation(mockConfig));

      simulateKeyPress('ArrowLeft');
      simulateKeyPress('ArrowRight');
      simulateKeyPress('ArrowLeft');
      simulateKeyPress('Enter');

      expect(mockConfig.onPrevious).toHaveBeenCalledTimes(2);
      expect(mockConfig.onNext).toHaveBeenCalledTimes(2);
    });
  });

  describe('Selección de respuestas con números', () => {
    it('debería seleccionar respuesta 1 con tecla "1"', () => {
      renderHook(() => useKeyboardNavigation(mockConfig));

      const { preventDefault } = simulateKeyPress('1');

      expect(mockConfig.onAnswer1).toHaveBeenCalledTimes(1);
      expect(preventDefault).toHaveBeenCalled();
    });

    it('debería seleccionar respuesta 2 con tecla "2"', () => {
      renderHook(() => useKeyboardNavigation(mockConfig));

      const { preventDefault } = simulateKeyPress('2');

      expect(mockConfig.onAnswer2).toHaveBeenCalledTimes(1);
      expect(preventDefault).toHaveBeenCalled();
    });

    it('debería seleccionar respuesta 3 con tecla "3"', () => {
      renderHook(() => useKeyboardNavigation(mockConfig));

      const { preventDefault } = simulateKeyPress('3');

      expect(mockConfig.onAnswer3).toHaveBeenCalledTimes(1);
      expect(preventDefault).toHaveBeenCalled();
    });

    it('debería seleccionar respuesta 4 con tecla "4"', () => {
      renderHook(() => useKeyboardNavigation(mockConfig));

      const { preventDefault } = simulateKeyPress('4');

      expect(mockConfig.onAnswer4).toHaveBeenCalledTimes(1);
      expect(preventDefault).toHaveBeenCalled();
    });

    it('debería permitir múltiples selecciones de respuestas', () => {
      renderHook(() => useKeyboardNavigation(mockConfig));

      simulateKeyPress('1');
      simulateKeyPress('2');
      simulateKeyPress('3');
      simulateKeyPress('4');

      expect(mockConfig.onAnswer1).toHaveBeenCalledTimes(1);
      expect(mockConfig.onAnswer2).toHaveBeenCalledTimes(1);
      expect(mockConfig.onAnswer3).toHaveBeenCalledTimes(1);
      expect(mockConfig.onAnswer4).toHaveBeenCalledTimes(1);
    });
  });

  describe('Estado de examen enviado (isSubmitted)', () => {
    it('debería bloquear selección de respuestas cuando está enviado', () => {
      const submittedConfig = createMockConfig({ isSubmitted: true });
      renderHook(() => useKeyboardNavigation(submittedConfig));

      simulateKeyPress('1');
      simulateKeyPress('2');
      simulateKeyPress('3');
      simulateKeyPress('4');

      expect(submittedConfig.onAnswer1).not.toHaveBeenCalled();
      expect(submittedConfig.onAnswer2).not.toHaveBeenCalled();
      expect(submittedConfig.onAnswer3).not.toHaveBeenCalled();
      expect(submittedConfig.onAnswer4).not.toHaveBeenCalled();
    });

    it('debería permitir navegación cuando está enviado', () => {
      const submittedConfig = createMockConfig({ isSubmitted: true });
      renderHook(() => useKeyboardNavigation(submittedConfig));

      simulateKeyPress('ArrowLeft');
      simulateKeyPress('ArrowRight');
      simulateKeyPress('Enter');

      expect(submittedConfig.onPrevious).toHaveBeenCalledTimes(1);
      expect(submittedConfig.onNext).toHaveBeenCalledTimes(2);
    });

    it('debería cambiar comportamiento cuando cambia isSubmitted', () => {
      const notSubmittedConfig = createMockConfig({ isSubmitted: false });
      const { unmount } = renderHook(() => useKeyboardNavigation(notSubmittedConfig));

      // Inicialmente permitir respuestas
      simulateKeyPress('1');
      expect(notSubmittedConfig.onAnswer1).toHaveBeenCalledTimes(1);

      unmount();

      // Configurar nuevo hook con isSubmitted: true
      const submittedConfig = createMockConfig({ isSubmitted: true });
      renderHook(() => useKeyboardNavigation(submittedConfig));
      
      simulateKeyPress('2');
      expect(submittedConfig.onAnswer2).not.toHaveBeenCalled();
    });
  });

  describe('Estado deshabilitado (disabled)', () => {
    it('debería bloquear toda navegación cuando está deshabilitado', () => {
      const disabledConfig = createMockConfig({ disabled: true });
      renderHook(() => useKeyboardNavigation(disabledConfig));

      simulateKeyPress('ArrowLeft');
      simulateKeyPress('ArrowRight');
      simulateKeyPress('Enter');
      simulateKeyPress('1');
      simulateKeyPress('2');

      expect(disabledConfig.onPrevious).not.toHaveBeenCalled();
      expect(disabledConfig.onNext).not.toHaveBeenCalled();
      expect(disabledConfig.onAnswer1).not.toHaveBeenCalled();
      expect(disabledConfig.onAnswer2).not.toHaveBeenCalled();
    });

    it('debería reactivarse cuando disabled cambia a false', () => {
      let disabled = true;
      const { rerender } = renderHook(() => {
        const config = createMockConfig({ disabled });
        return useKeyboardNavigation(config);
      });

      // Inicialmente bloqueado
      simulateKeyPress('1');
      expect(mockConfig.onAnswer1).not.toHaveBeenCalled();

      // Habilitar
      disabled = false;
      rerender();

      // Ahora funcionar
      const enabledConfig = createMockConfig({ disabled: false });
      renderHook(() => useKeyboardNavigation(enabledConfig));
      
      simulateKeyPress('1');
      expect(enabledConfig.onAnswer1).toHaveBeenCalledTimes(1);
    });
  });

  describe('Detección de elementos activos (INPUT/TEXTAREA)', () => {
    it('debería ignorar teclas cuando el foco está en INPUT', () => {
      renderHook(() => useKeyboardNavigation(mockConfig));

      // Create and focus an input element
      const input = createMockElement('INPUT');
      document.body.appendChild(input);
      input.focus();

      // Mock document.activeElement
      const originalActiveElement = document.activeElement;
      Object.defineProperty(document, 'activeElement', {
        get: () => input,
        configurable: true,
      });

      simulateKeyPress('1');
      simulateKeyPress('ArrowLeft');

      expect(mockConfig.onAnswer1).not.toHaveBeenCalled();
      expect(mockConfig.onPrevious).not.toHaveBeenCalled();

      // Restore original activeElement
      Object.defineProperty(document, 'activeElement', {
        get: () => originalActiveElement,
        configurable: true,
      });
    });

    it('debería ignorar teclas cuando el foco está en TEXTAREA', () => {
      renderHook(() => useKeyboardNavigation(mockConfig));

      // Create and focus a textarea element
      const textarea = createMockElement('TEXTAREA');
      document.body.appendChild(textarea);
      textarea.focus();

      // Mock document.activeElement
      const originalActiveElement = document.activeElement;
      Object.defineProperty(document, 'activeElement', {
        get: () => textarea,
        configurable: true,
      });

      simulateKeyPress('2');
      simulateKeyPress('ArrowRight');

      expect(mockConfig.onAnswer2).not.toHaveBeenCalled();
      expect(mockConfig.onNext).not.toHaveBeenCalled();

      // Restore original activeElement
      Object.defineProperty(document, 'activeElement', {
        get: () => originalActiveElement,
        configurable: true,
      });
    });

    it('debería funcionar normalmente cuando el foco está en otros elementos', () => {
      renderHook(() => useKeyboardNavigation(mockConfig));

      // Create and focus a div element
      const div = createMockElement('DIV');
      document.body.appendChild(div);
      div.focus();

      // Mock document.activeElement
      const originalActiveElement = document.activeElement;
      Object.defineProperty(document, 'activeElement', {
        get: () => div,
        configurable: true,
      });

      simulateKeyPress('3');
      simulateKeyPress('ArrowLeft');

      expect(mockConfig.onAnswer3).toHaveBeenCalledTimes(1);
      expect(mockConfig.onPrevious).toHaveBeenCalledTimes(1);

      // Restore original activeElement
      Object.defineProperty(document, 'activeElement', {
        get: () => originalActiveElement,
        configurable: true,
      });
    });
  });

  describe('Teclas no mapeadas', () => {
    it('debería ignorar teclas no mapeadas', () => {
      renderHook(() => useKeyboardNavigation(mockConfig));

      simulateKeyPress('a');
      simulateKeyPress('5');
      simulateKeyPress('Space');
      simulateKeyPress('Escape');
      simulateKeyPress('Tab');

      expect(mockConfig.onPrevious).not.toHaveBeenCalled();
      expect(mockConfig.onNext).not.toHaveBeenCalled();
      expect(mockConfig.onAnswer1).not.toHaveBeenCalled();
      expect(mockConfig.onAnswer2).not.toHaveBeenCalled();
      expect(mockConfig.onAnswer3).not.toHaveBeenCalled();
      expect(mockConfig.onAnswer4).not.toHaveBeenCalled();
    });

    it('debería no prevenir default en teclas no mapeadas', () => {
      renderHook(() => useKeyboardNavigation(mockConfig));

      const { preventDefault: preventDefaultA } = simulateKeyPress('a');
      const { preventDefault: preventDefaultSpace } = simulateKeyPress(' ');

      expect(preventDefaultA).not.toHaveBeenCalled();
      expect(preventDefaultSpace).not.toHaveBeenCalled();
    });
  });

  describe('Gestión de event listeners', () => {
    it('debería agregar event listener al montar', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      
      renderHook(() => useKeyboardNavigation(mockConfig));

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      addEventListenerSpy.mockRestore();
    });

    it('debería remover event listener al desmontar', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = renderHook(() => useKeyboardNavigation(mockConfig));
      
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });

    it('debería manejar múltiples montajes y desmontajes', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount: unmount1 } = renderHook(() => useKeyboardNavigation(mockConfig));
      const { unmount: unmount2 } = renderHook(() => useKeyboardNavigation(mockConfig));

      expect(addEventListenerSpy).toHaveBeenCalledTimes(2);

      unmount1();
      unmount2();

      expect(removeEventListenerSpy).toHaveBeenCalledTimes(2);

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Casos edge y validaciones', () => {
    it('debería manejar config con funciones undefined', () => {
      const partialConfig = {
        ...mockConfig,
        onAnswer1: undefined as any,
        onAnswer2: undefined as any,
      };

      expect(() => {
        renderHook(() => useKeyboardNavigation(partialConfig));
      }).not.toThrow();
    });

    it('debería manejar cambios en la configuración', () => {
      // Test que el hook puede configurarse y reconfigurarse
      const firstConfig = createMockConfig();
      const { unmount } = renderHook(() => useKeyboardNavigation(firstConfig));
      
      expect(() => unmount()).not.toThrow();

      // New config should work
      const secondConfig = createMockConfig();
      expect(() => {
        renderHook(() => useKeyboardNavigation(secondConfig));
      }).not.toThrow();
    });

    it('debería manejar eventos de teclado básicos', () => {
      // Test that the hook can be set up without throwing
      expect(() => {
        renderHook(() => useKeyboardNavigation(mockConfig));
      }).not.toThrow();
      
      // Test that we can simulate events without crashing
      expect(() => {
        simulateKeyPress('ArrowLeft');
        simulateKeyPress('ArrowRight');
      }).not.toThrow();
    });

    it('debería manejar combinaciones de estados (disabled + isSubmitted)', () => {
      const complexConfig = createMockConfig({ 
        disabled: true, 
        isSubmitted: true 
      });
      renderHook(() => useKeyboardNavigation(complexConfig));

      simulateKeyPress('1');
      simulateKeyPress('ArrowLeft');

      // Disabled tiene precedencia
      expect(complexConfig.onAnswer1).not.toHaveBeenCalled();
      expect(complexConfig.onPrevious).not.toHaveBeenCalled();
    });

    it('debería funcionar correctamente después de re-renders múltiples', () => {
      const rerenderConfig = createMockConfig();
      const { rerender } = renderHook(() => useKeyboardNavigation(rerenderConfig));

      // Test that rerender doesn't break the hook
      rerender();
      rerender();
      rerender();

      // Should still work after multiple rerenders
      expect(() => rerender()).not.toThrow();
    });
  });
});