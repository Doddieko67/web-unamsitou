import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSimpleTimer } from '../useSimpleTimer';

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

describe('useSimpleTimer - Tests Básicos', () => {
  describe('Inicialización y estado inicial', () => {
    it('debería inicializar con estado por defecto sin límite de tiempo', () => {
      const { result } = renderHook(() => useSimpleTimer(undefined));

      expect(result.current.timeLeft).toBeUndefined();
      expect(result.current.timeSpent).toBe(0);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isTimeUp).toBe(false);
    });

    it('debería inicializar con límite de tiempo válido', () => {
      const { result } = renderHook(() => useSimpleTimer(300)); // 5 minutos

      expect(result.current.timeLeft).toBe(300);
      expect(result.current.timeSpent).toBe(0);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isTimeUp).toBe(false);
    });

    it('debería inicializar con tiempo ya gastado', () => {
      const { result } = renderHook(() => useSimpleTimer(300, undefined, 120));

      expect(result.current.timeLeft).toBe(180);
      expect(result.current.timeSpent).toBe(120);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isTimeUp).toBe(false);
    });

    it('debería marcar como tiempo agotado si tiempo inicial >= límite', () => {
      const { result } = renderHook(() => useSimpleTimer(300, undefined, 300));

      expect(result.current.timeLeft).toBe(0);
      expect(result.current.timeSpent).toBe(300);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isTimeUp).toBe(true);
    });

    it('debería marcar como tiempo agotado si tiempo inicial > límite', () => {
      const { result } = renderHook(() => useSimpleTimer(300, undefined, 350));

      expect(result.current.timeLeft).toBe(0);
      expect(result.current.timeSpent).toBe(350);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isTimeUp).toBe(true);
    });

    it('debería proporcionar todas las funciones requeridas', () => {
      const { result } = renderHook(() => useSimpleTimer(300));

      expect(typeof result.current.start).toBe('function');
      expect(typeof result.current.togglePause).toBe('function');
      expect(typeof result.current.stop).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });

    it('debería manejar límite de tiempo de 0', () => {
      const { result } = renderHook(() => useSimpleTimer(0));

      expect(result.current.timeLeft).toBeUndefined();
      expect(result.current.timeSpent).toBe(0);
      expect(result.current.isTimeUp).toBe(false);
    });

    it('debería manejar límite de tiempo negativo', () => {
      const { result } = renderHook(() => useSimpleTimer(-100));

      expect(result.current.timeLeft).toBeUndefined();
      expect(result.current.timeSpent).toBe(0);
      expect(result.current.isTimeUp).toBe(false);
    });
  });

  describe('Operaciones básicas del timer', () => {
    it('debería iniciar el timer correctamente', () => {
      const { result } = renderHook(() => useSimpleTimer(300));

      act(() => {
        result.current.start();
      });

      expect(result.current.isRunning).toBe(true);
    });

    it('debería detener el timer correctamente', () => {
      const { result } = renderHook(() => useSimpleTimer(300));

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
      const { result } = renderHook(() => useSimpleTimer(300));

      act(() => {
        result.current.start();
      });

      expect(result.current.isRunning).toBe(true);

      act(() => {
        result.current.togglePause();
      });

      expect(result.current.isRunning).toBe(false);

      act(() => {
        result.current.togglePause();
      });

      expect(result.current.isRunning).toBe(true);
    });

    it('no debería iniciar si no hay tiempo restante', () => {
      const { result } = renderHook(() => useSimpleTimer(300, undefined, 300));

      expect(result.current.timeLeft).toBe(0);

      act(() => {
        result.current.start();
      });

      expect(result.current.isRunning).toBe(false);
    });

    it('no debería iniciar sin límite de tiempo', () => {
      const { result } = renderHook(() => useSimpleTimer(undefined));

      act(() => {
        result.current.start();
      });

      expect(result.current.isRunning).toBe(false);
    });

    it('debería resetear el timer con nuevo límite', () => {
      const { result } = renderHook(() => useSimpleTimer(300));

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.timeSpent).toBeGreaterThan(0);

      act(() => {
        result.current.reset(600);
      });

      expect(result.current.timeLeft).toBe(600);
      expect(result.current.timeSpent).toBe(0);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isTimeUp).toBe(false);
    });
  });

  describe('Funcionalidad de conteo', () => {
    it('debería decrementar timeLeft cada segundo', () => {
      const { result } = renderHook(() => useSimpleTimer(10));

      act(() => {
        result.current.start();
      });

      expect(result.current.timeLeft).toBe(10);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.timeLeft).toBe(9);

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.timeLeft).toBe(6);
    });

    it('debería incrementar timeSpent cada segundo', () => {
      const { result } = renderHook(() => useSimpleTimer(300));

      act(() => {
        result.current.start();
      });

      expect(result.current.timeSpent).toBe(0);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.timeSpent).toBe(1);

      act(() => {
        vi.advanceTimersByTime(4000);
      });

      expect(result.current.timeSpent).toBe(5);
    });

    it('no debería contar cuando está pausado', () => {
      const { result } = renderHook(() => useSimpleTimer(300));

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.timeLeft).toBe(298);
      expect(result.current.timeSpent).toBe(2);

      act(() => {
        result.current.togglePause();
      });

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.timeLeft).toBe(298); // No debe cambiar cuando está pausado
      expect(result.current.timeSpent).toBe(2);
    });

    it('no debería contar cuando está detenido', () => {
      const { result } = renderHook(() => useSimpleTimer(300));

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.timeLeft).toBe(297);
      expect(result.current.timeSpent).toBe(3);

      act(() => {
        result.current.stop();
      });

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.timeLeft).toBe(297); // No debe cambiar cuando está detenido
      expect(result.current.timeSpent).toBe(3);
    });

    it('debería reanudar conteo después de pausa', () => {
      const { result } = renderHook(() => useSimpleTimer(300));

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
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.timeSpent).toBe(2); // No cambió durante pausa

      act(() => {
        result.current.togglePause();
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.timeSpent).toBe(4); // Se reanudó correctamente
    });
  });

  describe('Manejo de tiempo agotado', () => {
    it('debería detectar cuando el tiempo se agota', () => {
      const { result } = renderHook(() => useSimpleTimer(3));

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.timeLeft).toBe(0);
      expect(result.current.timeSpent).toBe(3);
      expect(result.current.isTimeUp).toBe(true);
      expect(result.current.isRunning).toBe(false);
    });

    it('debería llamar callback onTimeUp cuando se agota el tiempo', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() => useSimpleTimer(2, onTimeUp));

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.isTimeUp).toBe(true);
      
      // Wait for setTimeout callback
      act(() => {
        vi.runAllTimers();
      });

      expect(onTimeUp).toHaveBeenCalledTimes(1);
    });

    it('debería parar automáticamente cuando se agota el tiempo', () => {
      const { result } = renderHook(() => useSimpleTimer(2));

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.isRunning).toBe(false);
      expect(result.current.isTimeUp).toBe(true);
    });

    it('no debería continuar después de que se agote el tiempo', () => {
      const { result } = renderHook(() => useSimpleTimer(2));

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(3000); // Más tiempo del límite
      });

      expect(result.current.timeLeft).toBe(0);
      expect(result.current.timeSpent).toBe(2);
      expect(result.current.isTimeUp).toBe(true);
    });

    it('no debería reiniciar después de que se agote el tiempo', () => {
      const { result } = renderHook(() => useSimpleTimer(2));

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.isTimeUp).toBe(true);

      act(() => {
        result.current.start();
      });

      expect(result.current.isRunning).toBe(false);
    });
  });

  describe('Funcionalidad de reset', () => {
    it('debería resetear completamente el timer', () => {
      const { result } = renderHook(() => useSimpleTimer(300));

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.timeSpent).toBe(5);
      expect(result.current.isRunning).toBe(true);

      act(() => {
        result.current.reset(600);
      });

      expect(result.current.timeLeft).toBe(600);
      expect(result.current.timeSpent).toBe(0);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isTimeUp).toBe(false);
    });

    it('debería permitir resetear con tiempo menor', () => {
      const { result } = renderHook(() => useSimpleTimer(300));

      act(() => {
        result.current.reset(60);
      });

      expect(result.current.timeLeft).toBe(60);
      expect(result.current.timeSpent).toBe(0);
    });

    it('debería permitir resetear múltiples veces', () => {
      const { result } = renderHook(() => useSimpleTimer(300));

      act(() => {
        result.current.reset(100);
      });

      expect(result.current.timeLeft).toBe(100);

      act(() => {
        result.current.reset(200);
      });

      expect(result.current.timeLeft).toBe(200);

      act(() => {
        result.current.reset(50);
      });

      expect(result.current.timeLeft).toBe(50);
    });

    it('debería limpiar interval al resetear', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      const { result } = renderHook(() => useSimpleTimer(300));

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.reset(600);
      });

      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('debería permitir iniciar después de reset', () => {
      const { result } = renderHook(() => useSimpleTimer(300));

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      act(() => {
        result.current.reset(100);
      });

      act(() => {
        result.current.start();
      });

      expect(result.current.isRunning).toBe(true);

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.timeLeft).toBe(98);
      expect(result.current.timeSpent).toBe(2);
    });
  });

  describe('Actualización de parámetros', () => {
    it('debería actualizar cuando cambia el límite de tiempo', () => {
      const { result, rerender } = renderHook(
        ({ limit, initial }) => useSimpleTimer(limit, undefined, initial),
        { initialProps: { limit: 300, initial: 0 } }
      );

      expect(result.current.timeLeft).toBe(300);

      rerender({ limit: 600, initial: 0 });

      expect(result.current.timeLeft).toBe(600);
      expect(result.current.timeSpent).toBe(0);
    });

    it('debería actualizar cuando cambia el tiempo inicial gastado', () => {
      const { result, rerender } = renderHook(
        ({ limit, initial }) => useSimpleTimer(limit, undefined, initial),
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
        ({ callback }) => useSimpleTimer(3, callback),
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
        ({ limit }) => useSimpleTimer(limit),
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

      expect(result.current.timeLeft).toBe(600);
      expect(result.current.timeSpent).toBe(0);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isTimeUp).toBe(false);
    });
  });

  describe('Casos edge y validaciones', () => {
    it('debería manejar múltiples inicios consecutivos', () => {
      const { result } = renderHook(() => useSimpleTimer(300));

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
      const { result } = renderHook(() => useSimpleTimer(300));

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.togglePause();
        result.current.togglePause();
        result.current.togglePause();
      });

      expect(result.current.isRunning).toBe(false);
    });

    it('debería manejar múltiples paradas consecutivas', () => {
      const { result } = renderHook(() => useSimpleTimer(300));

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
      const { result, unmount } = renderHook(() => useSimpleTimer(300));

      act(() => {
        result.current.start();
      });

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('debería manejar callback onTimeUp undefined', () => {
      const { result } = renderHook(() => useSimpleTimer(2, undefined));

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.isTimeUp).toBe(true);
      expect(() => vi.runAllTimers()).not.toThrow();
    });

    it('debería manejar cambio de callback a undefined', () => {
      const onTimeUp = vi.fn();
      const { result, rerender } = renderHook(
        ({ callback }) => useSimpleTimer(2, callback),
        { initialProps: { callback: onTimeUp } }
      );

      rerender({ callback: undefined });

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.isTimeUp).toBe(true);
      expect(() => vi.runAllTimers()).not.toThrow();
    });

    it('debería manejar límites de tiempo muy grandes', () => {
      const { result } = renderHook(() => useSimpleTimer(999999999));

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
      const { result } = renderHook(() => useSimpleTimer(100, undefined, 200));

      expect(result.current.timeSpent).toBe(200);
      expect(result.current.timeLeft).toBe(0);
      expect(result.current.isTimeUp).toBe(true);
    });

    it('debería manejar operaciones rápidas de start/stop', () => {
      const { result } = renderHook(() => useSimpleTimer(300));

      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.start();
          result.current.stop();
        });
      }

      expect(result.current.isRunning).toBe(false);
      expect(result.current.timeSpent).toBe(0);
    });

    it('debería manejar reset con tiempo 0', () => {
      const { result } = renderHook(() => useSimpleTimer(300));

      act(() => {
        result.current.reset(0);
      });

      expect(result.current.timeLeft).toBe(0);
      expect(result.current.timeSpent).toBe(0);
      expect(result.current.isTimeUp).toBe(false);
    });

    it('debería manejar reset con tiempo negativo', () => {
      const { result } = renderHook(() => useSimpleTimer(300));

      act(() => {
        result.current.reset(-100);
      });

      expect(result.current.timeLeft).toBe(-100);
      expect(result.current.timeSpent).toBe(0);
    });
  });

  describe('Estados de interval', () => {
    it('debería crear interval solo cuando isRunning y timeLeft > 0', () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval');
      const { result } = renderHook(() => useSimpleTimer(10));

      // No debería crear interval inicialmente
      expect(setIntervalSpy).not.toHaveBeenCalled();

      act(() => {
        result.current.start();
      });

      // Debería crear interval al iniciar
      expect(setIntervalSpy).toHaveBeenCalled();
    });

    it('debería limpiar interval cuando se pausa', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      const { result } = renderHook(() => useSimpleTimer(300));

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.togglePause();
      });

      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('debería limpiar interval cuando se detiene', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      const { result } = renderHook(() => useSimpleTimer(300));

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.stop();
      });

      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('Logging y debugging', () => {
    it('debería hacer log de inicialización', () => {
      renderHook(() => useSimpleTimer(300, undefined, 120));

      expect(console.log).toHaveBeenCalledWith(
        '⏱️ SimpleTimer: Initializing with time limit:',
        300,
        'initial time spent:',
        120
      );
    });

    it('debería hacer log de operaciones principales', () => {
      const { result } = renderHook(() => useSimpleTimer(300));

      act(() => {
        result.current.start();
      });

      expect(console.log).toHaveBeenCalledWith('⏱️ SimpleTimer: Starting');

      act(() => {
        result.current.togglePause();
      });

      expect(console.log).toHaveBeenCalledWith(
        '⏱️ SimpleTimer: Toggling pause - currently running:',
        true
      );

      act(() => {
        result.current.stop();
      });

      expect(console.log).toHaveBeenCalledWith('⏱️ SimpleTimer: Stopping');

      act(() => {
        result.current.reset(600);
      });

      expect(console.log).toHaveBeenCalledWith(
        '⏱️ SimpleTimer: Resetting with new time limit:',
        600
      );
    });

    it('debería hacer log cuando no puede iniciar', () => {
      const { result } = renderHook(() => useSimpleTimer(300, undefined, 300));

      act(() => {
        result.current.start();
      });

      expect(console.log).toHaveBeenCalledWith(
        '⏱️ SimpleTimer: Cannot start - no time left'
      );
    });

    it('debería hacer log de inicio de interval', () => {
      const { result } = renderHook(() => useSimpleTimer(300));

      act(() => {
        result.current.start();
      });

      expect(console.log).toHaveBeenCalledWith('⏱️ SimpleTimer: Starting interval');
    });
  });
});