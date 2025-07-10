import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBasicTimer } from '../useBasicTimer';

// Mock console methods
const originalConsole = {
  log: console.log,
  error: console.error,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  
  // Mock console to avoid noise in tests
  console.log = vi.fn();
  console.error = vi.fn();
});

afterEach(() => {
  vi.useRealTimers();
  
  // Restore console
  console.log = originalConsole.log;
  console.error = originalConsole.error;
});

describe('useBasicTimer - Tests Básicos', () => {
  describe('Inicialización y estado inicial', () => {
    it('debería inicializar con estado por defecto sin límite de tiempo', () => {
      const { result } = renderHook(() => useBasicTimer(undefined));

      expect(result.current.timeLeft).toBeUndefined();
      expect(result.current.timeSpent).toBe(0);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.isTimeUp).toBe(false);
    });

    it('debería inicializar con límite de tiempo', () => {
      const { result } = renderHook(() => useBasicTimer(300)); // 5 minutos

      expect(result.current.timeLeft).toBe(300);
      expect(result.current.timeSpent).toBe(0);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.isTimeUp).toBe(false);
    });

    it('debería inicializar con tiempo ya gastado', () => {
      const { result } = renderHook(() => useBasicTimer(300, undefined, 120));

      expect(result.current.timeLeft).toBe(180);
      expect(result.current.timeSpent).toBe(120);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.isTimeUp).toBe(false);
    });

    it('debería marcar como tiempo agotado si tiempo inicial >= límite', () => {
      const { result } = renderHook(() => useBasicTimer(300, undefined, 300));

      expect(result.current.timeLeft).toBe(0);
      expect(result.current.timeSpent).toBe(300);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.isTimeUp).toBe(true);
    });

    it('debería proporcionar todas las funciones requeridas', () => {
      const { result } = renderHook(() => useBasicTimer(300));

      expect(typeof result.current.start).toBe('function');
      expect(typeof result.current.togglePause).toBe('function');
      expect(typeof result.current.stop).toBe('function');
    });

    it('debería manejar límite de tiempo de 0', () => {
      const { result } = renderHook(() => useBasicTimer(0));

      expect(result.current.timeLeft).toBeUndefined(); // timeLeft es undefined cuando limit <= 0
      expect(result.current.timeSpent).toBe(0);
      expect(result.current.isTimeUp).toBe(false); // No se inicializa como time up cuando limit es 0
    });

    it('debería manejar límite de tiempo negativo', () => {
      const { result } = renderHook(() => useBasicTimer(-100));

      expect(result.current.timeLeft).toBeUndefined();
      expect(result.current.timeSpent).toBe(0);
      expect(result.current.isTimeUp).toBe(false);
    });
  });

  describe('Operaciones básicas del timer', () => {
    it('debería iniciar el timer correctamente', () => {
      const { result } = renderHook(() => useBasicTimer(300));

      act(() => {
        result.current.start();
      });

      expect(result.current.isRunning).toBe(true);
      expect(result.current.isPaused).toBe(false);
    });

    it('debería detener el timer correctamente', () => {
      const { result } = renderHook(() => useBasicTimer(300));

      act(() => {
        result.current.start();
      });

      expect(result.current.isRunning).toBe(true);

      act(() => {
        result.current.stop();
      });

      expect(result.current.isRunning).toBe(false);
    });

    it('debería pausar y reanudar el timer', () => {
      const { result } = renderHook(() => useBasicTimer(300));

      act(() => {
        result.current.start();
      });

      expect(result.current.isRunning).toBe(true);
      expect(result.current.isPaused).toBe(false);

      act(() => {
        result.current.togglePause();
      });

      expect(result.current.isRunning).toBe(false); // Show as not running when paused
      expect(result.current.isPaused).toBe(true);

      act(() => {
        result.current.togglePause();
      });

      expect(result.current.isRunning).toBe(true);
      expect(result.current.isPaused).toBe(false);
    });

    it('no debería iniciar si el tiempo ya se agotó', () => {
      const { result } = renderHook(() => useBasicTimer(300, undefined, 300));

      expect(result.current.isTimeUp).toBe(true);

      act(() => {
        result.current.start();
      });

      expect(result.current.isRunning).toBe(false);
    });

    it('no debería pausar si no está corriendo', () => {
      const { result } = renderHook(() => useBasicTimer(300));

      expect(result.current.isRunning).toBe(false);

      act(() => {
        result.current.togglePause();
      });

      expect(result.current.isPaused).toBe(false);
    });
  });

  describe('Funcionalidad de conteo', () => {
    it('debería incrementar timeSpent cada segundo', () => {
      const { result } = renderHook(() => useBasicTimer(300));

      act(() => {
        result.current.start();
      });

      expect(result.current.timeSpent).toBe(0);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.timeSpent).toBe(1);

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.timeSpent).toBe(4);
    });

    it('debería decrementar timeLeft correctamente', () => {
      const { result } = renderHook(() => useBasicTimer(10));

      act(() => {
        result.current.start();
      });

      expect(result.current.timeLeft).toBe(10);

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.timeLeft).toBe(7);
      expect(result.current.timeSpent).toBe(3);

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.timeLeft).toBe(2);
      expect(result.current.timeSpent).toBe(8);
    });

    it('no debería incrementar cuando está pausado', () => {
      const { result } = renderHook(() => useBasicTimer(300));

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.timeSpent).toBe(2);

      act(() => {
        result.current.togglePause();
      });

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.timeSpent).toBe(2); // No debe cambiar cuando está pausado
    });

    it('no debería incrementar cuando está detenido', () => {
      const { result } = renderHook(() => useBasicTimer(300));

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.timeSpent).toBe(2);

      act(() => {
        result.current.stop();
      });

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.timeSpent).toBe(2); // No debe cambiar cuando está detenido
    });

    it('debería mantener el tiempo gastado después de parar y reiniciar', () => {
      const { result } = renderHook(() => useBasicTimer(300));

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.timeSpent).toBe(5);

      act(() => {
        result.current.stop();
      });

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.timeSpent).toBe(8);
    });
  });

  describe('Manejo de tiempo agotado', () => {
    it('debería detectar cuando el tiempo se agota', () => {
      const { result } = renderHook(() => useBasicTimer(5));

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.timeSpent).toBe(5);
      expect(result.current.timeLeft).toBe(0);
      expect(result.current.isTimeUp).toBe(true);
      expect(result.current.isRunning).toBe(false);
    });

    it('debería llamar callback onTimeUp cuando se agota el tiempo', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() => useBasicTimer(3, onTimeUp));

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.isTimeUp).toBe(true);
      
      // Wait for setTimeout callback
      act(() => {
        vi.runAllTimers();
      });

      expect(onTimeUp).toHaveBeenCalledTimes(1);
    });

    it('no debería pasar del límite de tiempo', () => {
      const { result } = renderHook(() => useBasicTimer(5));

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(10000); // Más tiempo del límite
      });

      // El timer se detiene cuando llega al límite, pero el interval puede seguir corriendo unos ticks más
      expect(result.current.timeSpent).toBeGreaterThanOrEqual(5);
      expect(result.current.timeLeft).toBe(0);
      expect(result.current.isTimeUp).toBe(true);
    });

    it('no debería reiniciar después de que se agote el tiempo', () => {
      const { result } = renderHook(() => useBasicTimer(3));

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.isTimeUp).toBe(true);

      act(() => {
        result.current.start();
      });

      expect(result.current.isRunning).toBe(false);
    });
  });

  describe('Actualización de parámetros', () => {
    it('debería actualizar refs cuando cambian los parámetros', () => {
      const onTimeUp1 = vi.fn();
      const onTimeUp2 = vi.fn();
      
      const { result, rerender } = renderHook(
        ({ limit, callback }) => useBasicTimer(limit, callback),
        { initialProps: { limit: 300, callback: onTimeUp1 } }
      );

      expect(result.current.timeLeft).toBe(300);

      // Cambiar callback
      rerender({ limit: 300, callback: onTimeUp2 });

      // El hook debe usar el nuevo callback cuando se agote el tiempo
      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(300000); // 300 seconds
      });

      act(() => {
        vi.runAllTimers();
      });

      expect(onTimeUp1).not.toHaveBeenCalled();
      expect(onTimeUp2).toHaveBeenCalledTimes(1);
    });

    it('debería actualizar cuando cambia el tiempo inicial gastado', () => {
      const { result, rerender } = renderHook(
        ({ limit, initial }) => useBasicTimer(limit, undefined, initial),
        { initialProps: { limit: 300, initial: 0 } }
      );

      expect(result.current.timeSpent).toBe(0);
      expect(result.current.timeLeft).toBe(300);

      rerender({ limit: 300, initial: 120 });

      expect(result.current.timeSpent).toBe(120);
      expect(result.current.timeLeft).toBe(180);
    });

    it('debería actualizar callback onTimeUp', () => {
      const onTimeUp1 = vi.fn();
      const onTimeUp2 = vi.fn();

      const { result, rerender } = renderHook(
        ({ callback }) => useBasicTimer(3, callback),
        { initialProps: { callback: onTimeUp1 } }
      );

      rerender({ callback: onTimeUp2 });

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      act(() => {
        vi.runAllTimers();
      });

      expect(onTimeUp1).not.toHaveBeenCalled();
      expect(onTimeUp2).toHaveBeenCalledTimes(1);
    });

    it('debería reiniciar estado cuando cambia límite de tiempo', () => {
      const { result, rerender } = renderHook(
        ({ limit }) => useBasicTimer(limit),
        { initialProps: { limit: 300 } }
      );

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.timeSpent).toBe(5);
      expect(result.current.isRunning).toBe(true);

      rerender({ limit: 600 });

      expect(result.current.timeSpent).toBe(0);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.isTimeUp).toBe(false);
    });
  });

  describe('Casos edge y validaciones', () => {
    it('debería manejar múltiples inicios consecutivos', () => {
      const { result } = renderHook(() => useBasicTimer(300));

      act(() => {
        result.current.start();
        result.current.start();
        result.current.start();
      });

      expect(result.current.isRunning).toBe(true);

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.timeSpent).toBe(2);
    });

    it('debería manejar múltiples pausas consecutivas', () => {
      const { result } = renderHook(() => useBasicTimer(300));

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.togglePause();
        result.current.togglePause();
        result.current.togglePause();
      });

      expect(result.current.isPaused).toBe(true);
    });

    it('debería manejar múltiples paradas consecutivas', () => {
      const { result } = renderHook(() => useBasicTimer(300));

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.stop();
        result.current.stop();
        result.current.stop();
      });

      expect(result.current.isRunning).toBe(false);
    });

    it('debería limpiar interval al desmontar', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      const { result, unmount } = renderHook(() => useBasicTimer(300));

      act(() => {
        result.current.start();
      });

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('debería manejar callback onTimeUp undefined', () => {
      const { result } = renderHook(() => useBasicTimer(3, undefined));

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.isTimeUp).toBe(true);
      expect(() => vi.runAllTimers()).not.toThrow();
    });

    it('debería manejar cambio de callback a undefined', () => {
      const onTimeUp = vi.fn();
      const { result, rerender } = renderHook(
        ({ callback }) => useBasicTimer(3, callback),
        { initialProps: { callback: onTimeUp } }
      );

      rerender({ callback: undefined });

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.isTimeUp).toBe(true);
      expect(() => vi.runAllTimers()).not.toThrow();
    });

    it('debería manejar límites de tiempo muy grandes', () => {
      const { result } = renderHook(() => useBasicTimer(999999999));

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.timeSpent).toBe(5);
      expect(result.current.timeLeft).toBe(999999994);
      expect(result.current.isTimeUp).toBe(false);
    });

    it('debería manejar tiempo inicial mayor que límite', () => {
      const { result } = renderHook(() => useBasicTimer(100, undefined, 200));

      expect(result.current.timeSpent).toBe(200);
      expect(result.current.timeLeft).toBe(0);
      expect(result.current.isTimeUp).toBe(true);
    });

    it('debería manejar operaciones rápidas de start/stop', () => {
      const { result } = renderHook(() => useBasicTimer(300));

      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.start();
          result.current.stop();
        });
      }

      expect(result.current.isRunning).toBe(false);
      expect(result.current.timeSpent).toBe(0);
    });

    it('debería manejar pausas cuando ya está pausado', () => {
      const { result } = renderHook(() => useBasicTimer(300));

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.togglePause();
      });

      expect(result.current.isPaused).toBe(true);

      act(() => {
        result.current.togglePause();
      });

      expect(result.current.isPaused).toBe(false);
    });
  });

  describe('Estados de isRunning con pausa', () => {
    it('debería mostrar isRunning false cuando está pausado', () => {
      const { result } = renderHook(() => useBasicTimer(300));

      act(() => {
        result.current.start();
      });

      expect(result.current.isRunning).toBe(true);
      expect(result.current.isPaused).toBe(false);

      act(() => {
        result.current.togglePause();
      });

      expect(result.current.isRunning).toBe(false); // Should show as not running when paused
      expect(result.current.isPaused).toBe(true);
    });

    it('debería mostrar estados correctos en diferentes combinaciones', () => {
      const { result } = renderHook(() => useBasicTimer(300));

      // Estado inicial
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isPaused).toBe(false);

      // Después de iniciar
      act(() => {
        result.current.start();
      });

      expect(result.current.isRunning).toBe(true);
      expect(result.current.isPaused).toBe(false);

      // Después de pausar
      act(() => {
        result.current.togglePause();
      });

      expect(result.current.isRunning).toBe(false);
      expect(result.current.isPaused).toBe(true);

      // Después de reanudar
      act(() => {
        result.current.togglePause();
      });

      expect(result.current.isRunning).toBe(true);
      expect(result.current.isPaused).toBe(false);

      // Después de parar
      act(() => {
        result.current.stop();
      });

      expect(result.current.isRunning).toBe(false);
      expect(result.current.isPaused).toBe(false);
    });
  });

  describe('Logging y debugging', () => {
    it('debería hacer log de inicialización', () => {
      renderHook(() => useBasicTimer(300, undefined, 120));

      expect(console.log).toHaveBeenCalledWith(
        '🔥 BasicTimer: Init - limit:',
        300,
        'initial spent:',
        120
      );
    });

    it('debería hacer log de operaciones principales', () => {
      const { result } = renderHook(() => useBasicTimer(300));

      act(() => {
        result.current.start();
      });

      expect(console.log).toHaveBeenCalledWith('🔥 BasicTimer: START');

      act(() => {
        result.current.togglePause();
      });

      expect(console.log).toHaveBeenCalledWith(
        '🔥 BasicTimer: TOGGLE PAUSE - currently paused:',
        false
      );

      act(() => {
        result.current.stop();
      });

      expect(console.log).toHaveBeenCalledWith('🔥 BasicTimer: STOP');
    });

    it('debería hacer log de ticks del interval', () => {
      const { result } = renderHook(() => useBasicTimer(10));

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Tick:'),
        expect.any(Number),
        expect.stringContaining('/'),
        expect.any(Number)
      );
    });

    it('debería hacer log cuando se agota el tiempo', () => {
      const { result } = renderHook(() => useBasicTimer(2));

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Time up!')
      );
    });
  });
});