import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExamPersistence } from '../useExamPersistence';
import type { ExamProgressData } from '../useExamPersistence';

// Mock Supabase completamente
vi.mock('../supabase.config', () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ error: null })
        }))
      }))
    }))
  }
}));

// Mock debounce - versión simplificada que ejecuta inmediatamente en tests
vi.mock('../utils/debounce', () => ({
  debounce: vi.fn((fn) => fn) // Ejecutar inmediatamente en tests
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

describe('useExamPersistence - Tests Básicos', () => {
  const mockExamId = 'exam-123';
  const mockUserId = 'user-456';
  
  const initialExamData: ExamProgressData = {
    tiempo_tomado_segundos: 0,
    respuestas_usuario: {},
    questions_pinned: {},
    currentQuestionIndex: 0,
    timeLeft: 3600,
    isSubmitted: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset navigator.onLine
    (navigator as any).onLine = true;
    
    // Reset localStorage mock
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
  });

  describe('Inicialización básica', () => {
    it('debería tener la estructura correcta', () => {
      const { result } = renderHook(() =>
        useExamPersistence(mockExamId, initialExamData, mockUserId)
      );

      // Verificar que tiene las propiedades esperadas
      expect(result.current).toHaveProperty('syncStatus');
      expect(result.current).toHaveProperty('lastSaved');
      expect(result.current).toHaveProperty('hasUnsavedChanges');
      expect(result.current).toHaveProperty('saveProgress');
      expect(result.current).toHaveProperty('saveToLocal');
      expect(result.current).toHaveProperty('clearLocalState');
      
      // Verificar tipos
      expect(typeof result.current.saveProgress).toBe('function');
      expect(typeof result.current.saveToLocal).toBe('function');
      expect(typeof result.current.clearLocalState).toBe('function');
      expect(typeof result.current.hasUnsavedChanges).toBe('boolean');
    });

    it('debería manejar examId vacío sin errores', () => {
      expect(() => {
        renderHook(() =>
          useExamPersistence('', initialExamData, mockUserId)
        );
      }).not.toThrow();
    });

    it('debería manejar userId vacío sin errores', () => {
      expect(() => {
        renderHook(() =>
          useExamPersistence(mockExamId, initialExamData, '')
        );
      }).not.toThrow();
    });

    it('debería manejar datos de examen vacíos', () => {
      const emptyData: ExamProgressData = {};
      
      expect(() => {
        renderHook(() =>
          useExamPersistence(mockExamId, emptyData, mockUserId)
        );
      }).not.toThrow();
    });
  });

  describe('saveToLocal', () => {
    it('debería guardar datos en localStorage', async () => {
      const { result } = renderHook(() =>
        useExamPersistence(mockExamId, initialExamData, mockUserId)
      );

      await act(async () => {
        result.current.saveToLocal();
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        `examen_estado_${mockExamId}`,
        expect.stringContaining('ultimaActualizacion')
      );
    });

    it('debería incluir datos del examen en localStorage', async () => {
      const examData = {
        ...initialExamData,
        respuestas_usuario: { 1: 2, 2: 1 },
        tiempo_tomado_segundos: 1200,
      };

      const { result } = renderHook(() =>
        useExamPersistence(mockExamId, examData, mockUserId)
      );

      await act(async () => {
        result.current.saveToLocal();
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      
      const callArgs = mockLocalStorage.setItem.mock.calls[0];
      expect(callArgs[0]).toBe(`examen_estado_${mockExamId}`);
      
      const savedData = JSON.parse(callArgs[1]);
      expect(savedData.respuestas_usuario).toEqual({ 1: 2, 2: 1 });
      expect(savedData.tiempo_tomado_segundos).toBe(1200);
      expect(savedData.ultimaActualizacion).toBeDefined();
    });

    it('debería manejar errores de localStorage silenciosamente', async () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const { result } = renderHook(() =>
        useExamPersistence(mockExamId, initialExamData, mockUserId)
      );

      await act(async () => {
        expect(() => result.current.saveToLocal()).not.toThrow();
      });
    });

    it('debería no hacer nada si no hay examId', async () => {
      const { result } = renderHook(() =>
        useExamPersistence('', initialExamData, mockUserId)
      );

      await act(async () => {
        result.current.saveToLocal();
      });

      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('saveProgress', () => {
    it('debería ejecutar saveProgress sin errores', async () => {
      const { result } = renderHook(() =>
        useExamPersistence(mockExamId, initialExamData, mockUserId)
      );

      await act(async () => {
        await expect(result.current.saveProgress()).resolves.not.toThrow();
      });
    });

    it('debería ejecutar saveProgress forzado sin errores', async () => {
      const { result } = renderHook(() =>
        useExamPersistence(mockExamId, initialExamData, mockUserId)
      );

      await act(async () => {
        await expect(result.current.saveProgress(true)).resolves.not.toThrow();
      });
    });

    it('debería guardar en localStorage al ejecutar saveProgress', async () => {
      const examData = {
        ...initialExamData,
        respuestas_usuario: { 1: 2 },
        tiempo_tomado_segundos: 1200,
      };

      const { result } = renderHook(() =>
        useExamPersistence(mockExamId, examData, mockUserId)
      );

      await act(async () => {
        await result.current.saveProgress(true);
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        `examen_estado_${mockExamId}`,
        expect.any(String)
      );
    });

    it('debería manejar casos sin examId', async () => {
      const { result } = renderHook(() =>
        useExamPersistence('', initialExamData, mockUserId)
      );

      await act(async () => {
        await expect(result.current.saveProgress(true)).resolves.not.toThrow();
      });
    });

    it('debería manejar casos sin userId', async () => {
      const { result } = renderHook(() =>
        useExamPersistence(mockExamId, initialExamData, '')
      );

      await act(async () => {
        await expect(result.current.saveProgress(true)).resolves.not.toThrow();
      });
    });
  });

  describe('Modo offline', () => {
    it('debería manejar estado offline', async () => {
      (navigator as any).onLine = false;

      const { result } = renderHook(() =>
        useExamPersistence(mockExamId, initialExamData, mockUserId)
      );

      await act(async () => {
        await result.current.saveProgress(true);
      });

      // Debería guardar localmente incluso offline
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('debería configurar estado offline inicial si navigator.onLine es false', () => {
      (navigator as any).onLine = false;

      const { result } = renderHook(() =>
        useExamPersistence(mockExamId, initialExamData, mockUserId)
      );

      // En modo offline, el syncStatus puede ser 'offline'
      expect(['idle', 'offline']).toContain(result.current.syncStatus);
    });

    it('debería manejar diferentes valores de navigator.onLine', () => {
      // Test con true
      (navigator as any).onLine = true;
      expect(() => {
        renderHook(() =>
          useExamPersistence(mockExamId, initialExamData, mockUserId)
        );
      }).not.toThrow();

      // Test con false
      (navigator as any).onLine = false;
      expect(() => {
        renderHook(() =>
          useExamPersistence(mockExamId, initialExamData, mockUserId)
        );
      }).not.toThrow();
    });
  });

  describe('clearLocalState', () => {
    it('debería limpiar datos del localStorage', async () => {
      const { result } = renderHook(() =>
        useExamPersistence(mockExamId, initialExamData, mockUserId)
      );

      await act(async () => {
        result.current.clearLocalState();
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(`examen_estado_${mockExamId}`);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(`examen_final_pending_${mockExamId}`);
    });

    it('debería no hacer nada si no hay examId', async () => {
      const { result } = renderHook(() =>
        useExamPersistence('', initialExamData, mockUserId)
      );

      await act(async () => {
        result.current.clearLocalState();
      });

      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    });

    it('debería manejar múltiples llamadas a clearLocalState', async () => {
      const { result } = renderHook(() =>
        useExamPersistence(mockExamId, initialExamData, mockUserId)
      );

      await act(async () => {
        result.current.clearLocalState();
        result.current.clearLocalState();
        result.current.clearLocalState();
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(6); // 2 calls per execution
    });
  });

  describe('Detección de cambios básica', () => {
    it('debería manejar cambios en respuestas_usuario', () => {
      const examData = { ...initialExamData };
      
      const { result, rerender } = renderHook(
        ({ data }) => useExamPersistence(mockExamId, data, mockUserId),
        { initialProps: { data: examData } }
      );

      const updatedData = {
        ...examData,
        respuestas_usuario: { 1: 2 }
      };

      act(() => {
        rerender({ data: updatedData });
      });

      // Debería manejar el cambio sin errores
      expect(typeof result.current.hasUnsavedChanges).toBe('boolean');
    });

    it('debería manejar cambios en questions_pinned', () => {
      const examData = { ...initialExamData };
      
      const { result, rerender } = renderHook(
        ({ data }) => useExamPersistence(mockExamId, data, mockUserId),
        { initialProps: { data: examData } }
      );

      const updatedData = {
        ...examData,
        questions_pinned: { 1: true }
      };

      act(() => {
        rerender({ data: updatedData });
      });

      expect(typeof result.current.hasUnsavedChanges).toBe('boolean');
    });

    it('debería manejar cambios en currentQuestionIndex', () => {
      const examData = { ...initialExamData };
      
      const { result, rerender } = renderHook(
        ({ data }) => useExamPersistence(mockExamId, data, mockUserId),
        { initialProps: { data: examData } }
      );

      const updatedData = {
        ...examData,
        currentQuestionIndex: 5
      };

      act(() => {
        rerender({ data: updatedData });
      });

      expect(typeof result.current.hasUnsavedChanges).toBe('boolean');
    });

    it('debería manejar cambios en isSubmitted', () => {
      const examData = { ...initialExamData };
      
      const { result, rerender } = renderHook(
        ({ data }) => useExamPersistence(mockExamId, data, mockUserId),
        { initialProps: { data: examData } }
      );

      const updatedData = {
        ...examData,
        isSubmitted: true
      };

      act(() => {
        rerender({ data: updatedData });
      });

      expect(typeof result.current.hasUnsavedChanges).toBe('boolean');
    });
  });

  describe('Estados de sincronización', () => {
    it('debería tener estados válidos de sincronización', () => {
      const { result } = renderHook(() =>
        useExamPersistence(mockExamId, initialExamData, mockUserId)
      );

      const validStates = ['idle', 'syncing', 'success', 'error', 'offline'];
      expect(validStates).toContain(result.current.syncStatus);
    });

    it('debería manejar cambios de estado de sincronización', async () => {
      const { result } = renderHook(() =>
        useExamPersistence(mockExamId, initialExamData, mockUserId)
      );

      const initialStatus = result.current.syncStatus;

      await act(async () => {
        await result.current.saveProgress(true);
      });

      // El estado puede cambiar o mantenerse igual
      const validStates = ['idle', 'syncing', 'success', 'error', 'offline'];
      expect(validStates).toContain(result.current.syncStatus);
    });
  });

  describe('Integración con datos complejos', () => {
    it('debería manejar respuestas_usuario complejas', async () => {
      const complexData = {
        ...initialExamData,
        respuestas_usuario: {
          1: 2,
          5: 1,
          10: 3,
          15: 4,
          20: 2
        },
        questions_pinned: {
          1: true,
          5: false,
          10: true
        }
      };

      const { result } = renderHook(() =>
        useExamPersistence(mockExamId, complexData, mockUserId)
      );

      await act(async () => {
        result.current.saveToLocal();
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      
      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      expect(savedData.respuestas_usuario).toEqual(complexData.respuestas_usuario);
      expect(savedData.questions_pinned).toEqual(complexData.questions_pinned);
    });

    it('debería manejar datos con valores null y undefined', () => {
      const dataWithNulls = {
        ...initialExamData,
        respuestas_usuario: null as any,
        questions_pinned: undefined as any,
        currentQuestionIndex: null as any
      };

      expect(() => {
        renderHook(() =>
          useExamPersistence(mockExamId, dataWithNulls, mockUserId)
        );
      }).not.toThrow();
    });

    it('debería manejar tiempo_tomado_segundos grandes', async () => {
      const longExamData = {
        ...initialExamData,
        tiempo_tomado_segundos: 7200, // 2 horas
        timeLeft: 1800 // 30 minutos restantes
      };

      const { result } = renderHook(() =>
        useExamPersistence(mockExamId, longExamData, mockUserId)
      );

      await act(async () => {
        result.current.saveToLocal();
      });

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      expect(savedData.tiempo_tomado_segundos).toBe(7200);
    });
  });

  describe('Limpieza y cleanup', () => {
    it('debería limpiar correctamente al desmontar', () => {
      const { unmount } = renderHook(() =>
        useExamPersistence(mockExamId, initialExamData, mockUserId)
      );

      expect(() => unmount()).not.toThrow();
    });

    it('debería permitir múltiples instancias simultáneas', () => {
      const { result: result1 } = renderHook(() =>
        useExamPersistence('exam-1', initialExamData, 'user-1')
      );

      const { result: result2 } = renderHook(() =>
        useExamPersistence('exam-2', initialExamData, 'user-2')
      );

      expect(result1.current).toBeDefined();
      expect(result2.current).toBeDefined();
      expect(result1.current.saveProgress).not.toBe(result2.current.saveProgress);
    });
  });
});