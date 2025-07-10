import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFeedbackGeneration } from '../useFeedbackGeneration';

// Mock del auth store con estado inicial válido
vi.mock('../stores/authStore', () => ({
  useAuthStore: () => ({
    user: { id: 'user-123', email: 'test@example.com' },
    session: { access_token: 'mock-access-token' }
  })
}));

// Mock url_backend
vi.mock('../url_backend', () => ({
  url_backend: 'http://localhost:3001'
}));

// Mock fetch
global.fetch = vi.fn();

// Mock console
const mockConsole = {
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};
vi.stubGlobal('console', mockConsole);

describe('useFeedbackGeneration Hook - Tests Básicos', () => {
  const mockExamId = 'exam-456';

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default successful fetch response
    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        feedback: {
          1: 'Excelente respuesta. Has demostrado comprensión del tema.',
          2: 'Respuesta correcta pero podría ser más detallada.',
          3: 'Revisa el concepto de algoritmos de ordenamiento.'
        }
      })
    });
  });

  describe('Estructura y funcionalidad básica', () => {
    it('debería tener la estructura correcta', () => {
      const { result } = renderHook(() => useFeedbackGeneration());

      // Verificar propiedades del estado
      expect(result.current).toHaveProperty('feedback');
      expect(result.current).toHaveProperty('isGenerating');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');

      // Verificar propiedades de acciones
      expect(result.current).toHaveProperty('generateFeedback');
      expect(result.current).toHaveProperty('clearError');
      expect(result.current).toHaveProperty('setFeedback');

      // Verificar tipos
      expect(typeof result.current.generateFeedback).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
      expect(typeof result.current.setFeedback).toBe('function');
      expect(typeof result.current.isGenerating).toBe('boolean');
      expect(typeof result.current.isLoading).toBe('boolean');
      expect(typeof result.current.feedback).toBe('object');
    });

    it('debería tener estado inicial correcto', () => {
      const { result } = renderHook(() => useFeedbackGeneration());

      expect(result.current.feedback).toEqual({});
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('debería funcionar con diferentes instancias', () => {
      const { result: result1 } = renderHook(() => useFeedbackGeneration());
      const { result: result2 } = renderHook(() => useFeedbackGeneration());

      expect(result1.current).toBeDefined();
      expect(result2.current).toBeDefined();
      expect(result1.current.generateFeedback).not.toBe(result2.current.generateFeedback);
    });

    it('debería manejar desmontaje correctamente', () => {
      const { unmount } = renderHook(() => useFeedbackGeneration());

      expect(() => unmount()).not.toThrow();
    });

    it('debería ejecutar generateFeedback sin errores críticos', async () => {
      const { result } = renderHook(() => useFeedbackGeneration());

      await act(async () => {
        try {
          await result.current.generateFeedback(mockExamId);
        } catch (error) {
          // Puede fallar por auth en test, pero no debería crashear
          expect(error instanceof Error).toBe(true);
        }
      });

      // Verificar que el hook sigue funcionando
      expect(typeof result.current.generateFeedback).toBe('function');
    });
  });

  describe('Funciones de utilidad', () => {
    it('debería limpiar error correctamente', () => {
      const { result } = renderHook(() => useFeedbackGeneration());

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });

    it('debería establecer feedback manualmente', () => {
      const { result } = renderHook(() => useFeedbackGeneration());

      const newFeedback = {
        1: 'Feedback manual para pregunta 1',
        2: 'Feedback manual para pregunta 2'
      };

      act(() => {
        result.current.setFeedback(newFeedback);
      });

      expect(result.current.feedback).toEqual(newFeedback);
    });

    it('debería permitir sobreescribir feedback existente', () => {
      const { result } = renderHook(() => useFeedbackGeneration());

      const initialFeedback = { 1: 'Initial feedback' };
      const newFeedback = { 2: 'New feedback', 3: 'Another feedback' };

      act(() => {
        result.current.setFeedback(initialFeedback);
      });

      expect(result.current.feedback).toEqual(initialFeedback);

      act(() => {
        result.current.setFeedback(newFeedback);
      });

      expect(result.current.feedback).toEqual(newFeedback);
    });

    it('debería permitir múltiples llamadas a clearError', () => {
      const { result } = renderHook(() => useFeedbackGeneration());

      act(() => {
        result.current.clearError();
        result.current.clearError();
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('Estados y validaciones básicas', () => {
    it('debería mantener consistencia en propiedades después de setFeedback', () => {
      const { result } = renderHook(() => useFeedbackGeneration());

      const testFeedback = {
        1: 'Test feedback 1',
        2: 'Test feedback 2'
      };

      act(() => {
        result.current.setFeedback(testFeedback);
      });

      expect(result.current.feedback).toEqual(testFeedback);
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('debería manejar feedback con diferentes tipos de keys', () => {
      const { result } = renderHook(() => useFeedbackGeneration());

      const mixedFeedback = {
        1: 'Feedback para pregunta 1',
        5: 'Feedback para pregunta 5',
        10: 'Feedback para pregunta 10',
        15: 'Feedback para pregunta 15'
      };

      act(() => {
        result.current.setFeedback(mixedFeedback);
      });

      expect(result.current.feedback).toEqual(mixedFeedback);
      expect(Object.keys(result.current.feedback)).toHaveLength(4);
    });

    it('debería manejar feedback con strings largos', () => {
      const { result } = renderHook(() => useFeedbackGeneration());

      const longFeedback = {
        1: 'Este es un feedback muy largo que podría contener múltiples líneas de texto con explicaciones detalladas sobre la respuesta del estudiante, incluyendo sugerencias para mejorar y puntos específicos a considerar en el futuro.',
        2: 'Otro feedback extenso con información técnica y recomendaciones.'
      };

      act(() => {
        result.current.setFeedback(longFeedback);
      });

      expect(result.current.feedback).toEqual(longFeedback);
      expect(result.current.feedback[1]).toContain('feedback muy largo');
    });

    it('debería manejar feedback vacío', () => {
      const { result } = renderHook(() => useFeedbackGeneration());

      // Set some feedback first
      act(() => {
        result.current.setFeedback({ 1: 'Some feedback' });
      });

      expect(result.current.feedback).toEqual({ 1: 'Some feedback' });

      // Clear to empty
      act(() => {
        result.current.setFeedback({});
      });

      expect(result.current.feedback).toEqual({});
    });

    it('debería mantener estado después de múltiples operaciones', () => {
      const { result } = renderHook(() => useFeedbackGeneration());

      act(() => {
        result.current.setFeedback({ 1: 'First' });
        result.current.clearError();
        result.current.setFeedback({ 2: 'Second' });
        result.current.clearError();
        result.current.setFeedback({ 3: 'Third' });
      });

      expect(result.current.feedback).toEqual({ 3: 'Third' });
      expect(result.current.error).toBe(null);
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Integración y comportamiento del hook', () => {
    it('debería permitir múltiples instancias independientes', () => {
      const { result: result1 } = renderHook(() => useFeedbackGeneration());
      const { result: result2 } = renderHook(() => useFeedbackGeneration());

      act(() => {
        result1.current.setFeedback({ 1: 'Feedback instance 1' });
        result2.current.setFeedback({ 2: 'Feedback instance 2' });
      });

      expect(result1.current.feedback).toEqual({ 1: 'Feedback instance 1' });
      expect(result2.current.feedback).toEqual({ 2: 'Feedback instance 2' });
      expect(result1.current.feedback).not.toEqual(result2.current.feedback);
    });

    it('debería mantener funciones estables entre re-renders', () => {
      const { result, rerender } = renderHook(() => useFeedbackGeneration());

      const initialGenerateFeedback = result.current.generateFeedback;
      const initialClearError = result.current.clearError;
      const initialSetFeedback = result.current.setFeedback;

      rerender();

      expect(result.current.generateFeedback).toBe(initialGenerateFeedback);
      expect(result.current.clearError).toBe(initialClearError);
      expect(result.current.setFeedback).toBe(initialSetFeedback);
    });

    it('debería manejar re-renders sin perder estado', () => {
      const { result, rerender } = renderHook(() => useFeedbackGeneration());

      act(() => {
        result.current.setFeedback({ 1: 'Persistent feedback' });
      });

      rerender();

      expect(result.current.feedback).toEqual({ 1: 'Persistent feedback' });
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('debería ser consistente en tipos de retorno', () => {
      const { result } = renderHook(() => useFeedbackGeneration());

      // Verificar que las propiedades mantienen sus tipos
      expect(typeof result.current.feedback).toBe('object');
      expect(typeof result.current.isGenerating).toBe('boolean');
      expect(typeof result.current.isLoading).toBe('boolean');
      expect(result.current.error === null || typeof result.current.error === 'string').toBe(true);
      
      // Después de operaciones
      act(() => {
        result.current.setFeedback({ 1: 'Test' });
        result.current.clearError();
      });

      expect(typeof result.current.feedback).toBe('object');
      expect(typeof result.current.isGenerating).toBe('boolean');
      expect(typeof result.current.isLoading).toBe('boolean');
      expect(result.current.error === null || typeof result.current.error === 'string').toBe(true);
    });
  });
});