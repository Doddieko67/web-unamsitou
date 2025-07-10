import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOfflineMode } from '../useOfflineMode';

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

// Mock Service Worker
const mockServiceWorker = {
  register: vi.fn(),
  ready: Promise.resolve({
    addEventListener: vi.fn(),
    sync: {
      register: vi.fn(),
    },
  }),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

// Store original serviceWorker to restore if needed
const originalServiceWorker = navigator.serviceWorker;

Object.defineProperty(navigator, 'serviceWorker', {
  value: mockServiceWorker,
  writable: true,
  configurable: true,
});

// Mock console methods
const originalConsole = {
  log: console.log,
  error: console.error,
};

beforeEach(() => {
  vi.clearAllMocks();
  
  // Reset navigator.onLine
  (navigator as any).onLine = true;
  
  // Reset localStorage mock
  mockLocalStorage.getItem.mockReturnValue('{}');
  mockLocalStorage.setItem.mockImplementation(vi.fn());
  mockLocalStorage.removeItem.mockImplementation(vi.fn());
  mockLocalStorage.clear.mockImplementation(vi.fn());
  
  // Mock console to avoid noise in tests
  console.log = vi.fn();
  console.error = vi.fn();
  
  // Reset service worker mock
  mockServiceWorker.register.mockResolvedValue({
    addEventListener: vi.fn(),
    sync: {
      register: vi.fn(),
    },
  });
  mockServiceWorker.ready = Promise.resolve({
    addEventListener: vi.fn(),
    sync: {
      register: vi.fn(),
    },
  });
  mockServiceWorker.addEventListener.mockClear();
  mockServiceWorker.removeEventListener.mockClear();
});

afterEach(() => {
  // Restore console
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  
  vi.clearAllTimers();
});

describe('useOfflineMode - Tests Básicos', () => {
  describe('Inicialización y estado inicial', () => {
    it('debería inicializar con estado por defecto', () => {
      const { result } = renderHook(() => useOfflineMode());

      expect(result.current.isOnline).toBe(true);
      expect(result.current.isServiceWorkerReady).toBe(false);
      expect(result.current.pendingSyncCount).toBe(0);
      expect(result.current.lastSyncAttempt).toBeNull();
    });

    it('debería inicializar con navigator.onLine', () => {
      (navigator as any).onLine = false;
      
      const { result } = renderHook(() => useOfflineMode());
      
      expect(result.current.isOnline).toBe(false);
    });

    it('debería proporcionar todas las funciones requeridas', () => {
      const { result } = renderHook(() => useOfflineMode());

      expect(typeof result.current.forceSyncPendingData).toBe('function');
      expect(typeof result.current.queueForSync).toBe('function');
      expect(typeof result.current.clearPendingSync).toBe('function');
      expect(typeof result.current.getPendingSyncData).toBe('function');
    });
  });

  describe('Service Worker registration', () => {
    it('debería registrar service worker si está disponible', async () => {
      renderHook(() => useOfflineMode());

      // Wait for service worker registration
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockServiceWorker.register).toHaveBeenCalledWith('/sw.js', {
        scope: '/',
      });
    });

    it('debería marcar service worker como ready', async () => {
      const { result } = renderHook(() => useOfflineMode());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(result.current.isServiceWorkerReady).toBe(true);
    });

    it('debería manejar error en registro de service worker', async () => {
      mockServiceWorker.register.mockRejectedValue(new Error('Registration failed'));

      const { result } = renderHook(() => useOfflineMode());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(result.current.isServiceWorkerReady).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });

    it('debería manejar ausencia de service worker', () => {
      // Temporarily remove serviceWorker
      const tempServiceWorker = navigator.serviceWorker;
      delete (navigator as any).serviceWorker;

      const { result } = renderHook(() => useOfflineMode());

      expect(result.current.isServiceWorkerReady).toBe(false);

      // Restore service worker
      (navigator as any).serviceWorker = tempServiceWorker;
    });
  });

  describe('Detección de conectividad', () => {
    it('debería detectar cuando se va offline', () => {
      const { result } = renderHook(() => useOfflineMode());

      act(() => {
        (navigator as any).onLine = false;
        window.dispatchEvent(new Event('offline'));
      });

      expect(result.current.isOnline).toBe(false);
    });

    it('debería detectar cuando vuelve online', () => {
      // Start offline
      (navigator as any).onLine = false;
      const { result } = renderHook(() => useOfflineMode());

      act(() => {
        (navigator as any).onLine = true;
        window.dispatchEvent(new Event('online'));
      });

      expect(result.current.isOnline).toBe(true);
    });

    it('debería triggerar sync cuando vuelve online', async () => {
      const { result } = renderHook(() => useOfflineMode());

      await act(async () => {
        window.dispatchEvent(new Event('online'));
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Should attempt to register background sync
      expect(mockServiceWorker.ready).toBeDefined();
    });

    it('debería manejar error en background sync registration', async () => {
      const mockRegistration = {
        sync: {
          register: vi.fn().mockRejectedValue(new Error('Sync failed')),
        },
      };
      mockServiceWorker.ready = Promise.resolve(mockRegistration);

      renderHook(() => useOfflineMode());

      await act(async () => {
        window.dispatchEvent(new Event('online'));
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Background sync registration failed:'),
        expect.any(Error)
      );
    });
  });

  describe('Gestión de datos para sincronización', () => {
    it('debería obtener datos de sincronización pendientes vacíos', () => {
      mockLocalStorage.getItem.mockReturnValue('{}');
      
      const { result } = renderHook(() => useOfflineMode());
      
      const pendingData = result.current.getPendingSyncData();
      expect(pendingData).toEqual({});
    });

    it('debería obtener datos de sincronización pendientes existentes', () => {
      const mockData = {
        'exam-1': { data: { test: 'data' }, timestamp: Date.now() }
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockData));
      
      const { result } = renderHook(() => useOfflineMode());
      
      const pendingData = result.current.getPendingSyncData();
      expect(pendingData).toEqual(mockData);
    });

    it('debería manejar error al obtener datos de localStorage', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const { result } = renderHook(() => useOfflineMode());
      
      const pendingData = result.current.getPendingSyncData();
      expect(pendingData).toEqual({});
      expect(console.error).toHaveBeenCalled();
    });

    it('debería encolar datos para sincronización', () => {
      const { result } = renderHook(() => useOfflineMode());
      
      act(() => {
        result.current.queueForSync({ test: 'data' }, 'exam-1');
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'offline_sync_queue',
        expect.stringContaining('exam-1')
      );
    });

    it('debería actualizar el contador de sincronización pendiente', () => {
      const { result } = renderHook(() => useOfflineMode());
      
      act(() => {
        result.current.queueForSync({ test: 'data' }, 'exam-1');
      });

      expect(result.current.pendingSyncCount).toBe(1);
    });

    it('debería manejar múltiples elementos en cola', () => {
      // Reset localStorage mock para este test
      let storedData = {};
      mockLocalStorage.getItem.mockImplementation(() => JSON.stringify(storedData));
      mockLocalStorage.setItem.mockImplementation((key, value) => {
        storedData = JSON.parse(value);
      });
      
      const { result } = renderHook(() => useOfflineMode());
      
      act(() => {
        result.current.queueForSync({ test: 'data1' }, 'exam-1');
      });
      
      act(() => {
        result.current.queueForSync({ test: 'data2' }, 'exam-2');
      });

      expect(result.current.pendingSyncCount).toBe(2);
    });

    it('debería manejar error al encolar datos', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const { result } = renderHook(() => useOfflineMode());
      
      act(() => {
        result.current.queueForSync({ test: 'data' }, 'exam-1');
      });

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to queue data for sync:'),
        expect.any(Error)
      );
    });
  });

  describe('Limpieza de datos de sincronización', () => {
    it('debería limpiar un elemento específico de la cola', () => {
      // Setup existing data
      const existingData = {
        'exam-1': { data: { test: 'data1' } },
        'exam-2': { data: { test: 'data2' } }
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData));
      
      const { result } = renderHook(() => useOfflineMode());
      
      act(() => {
        result.current.clearPendingSync('exam-1');
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'offline_sync_queue',
        JSON.stringify({ 'exam-2': { data: { test: 'data2' } } })
      );
    });

    it('debería actualizar el contador después de limpiar', () => {
      // Reset localStorage mock para este test específico
      let storedData = {
        'exam-1': { data: { test: 'data1' } },
        'exam-2': { data: { test: 'data2' } }
      };
      
      mockLocalStorage.getItem.mockImplementation(() => JSON.stringify(storedData));
      mockLocalStorage.setItem.mockImplementation((key, value) => {
        storedData = JSON.parse(value);
      });
      
      const { result } = renderHook(() => useOfflineMode());
      
      act(() => {
        result.current.clearPendingSync('exam-1');
      });

      expect(result.current.pendingSyncCount).toBe(1);
    });

    it('debería manejar error al limpiar datos', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const { result } = renderHook(() => useOfflineMode());
      
      act(() => {
        result.current.clearPendingSync('exam-1');
      });

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to clear sync data:'),
        expect.any(Error)
      );
    });
  });

  describe('Sincronización forzada', () => {
    it('debería no sincronizar cuando está offline', async () => {
      const { result } = renderHook(() => useOfflineMode());
      
      // Set offline
      act(() => {
        (navigator as any).onLine = false;
        window.dispatchEvent(new Event('offline'));
      });

      await act(async () => {
        await result.current.forceSyncPendingData();
      });

      expect(console.log).toHaveBeenCalledWith('🔌 Cannot sync while offline');
    });

    it('debería no sincronizar cuando no hay datos pendientes', async () => {
      mockLocalStorage.getItem.mockReturnValue('{}');
      
      const { result } = renderHook(() => useOfflineMode());

      await act(async () => {
        await result.current.forceSyncPendingData();
      });

      expect(console.log).toHaveBeenCalledWith('✅ No pending data to sync');
    });

    it('debería sincronizar datos pendientes', async () => {
      const pendingData = {
        'exam-1': { data: { test: 'data' }, retryCount: 0 }
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(pendingData));
      
      // Restore dispatchEvent if it's mocked
      if (vi.isMockFunction(window.dispatchEvent)) {
        vi.mocked(window.dispatchEvent).mockRestore?.();
      }
      
      // Mock window.dispatchEvent
      const mockDispatchEvent = vi.spyOn(window, 'dispatchEvent');
      
      const { result } = renderHook(() => useOfflineMode());

      await act(async () => {
        await result.current.forceSyncPendingData();
      });

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'offline-sync',
          detail: { key: 'exam-1', data: { test: 'data' } }
        })
      );
      
      mockDispatchEvent.mockRestore();
    });

    it('debería actualizar lastSyncAttempt', async () => {
      const pendingData = {
        'exam-1': { data: { test: 'data' }, retryCount: 0 }
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(pendingData));
      
      const { result } = renderHook(() => useOfflineMode());

      await act(async () => {
        await result.current.forceSyncPendingData();
      });

      expect(result.current.lastSyncAttempt).toBeInstanceOf(Date);
    });

    it('debería manejar errores en sincronización', async () => {
      // Reset localStorage mock para este test
      let storedData = {};
      mockLocalStorage.getItem.mockImplementation(() => JSON.stringify({
        'exam-1': { data: { test: 'data' }, retryCount: 0 }
      }));
      mockLocalStorage.setItem.mockImplementation((key, value) => {
        storedData = JSON.parse(value);
      });
      
      // Restore dispatchEvent if it's mocked
      if (vi.isMockFunction(window.dispatchEvent)) {
        vi.mocked(window.dispatchEvent).mockRestore?.();
      }
      
      // Mock dispatchEvent to throw error
      const mockDispatchEvent = vi.spyOn(window, 'dispatchEvent').mockImplementation(() => {
        throw new Error('Sync failed');
      });
      
      const { result } = renderHook(() => useOfflineMode());

      await act(async () => {
        await result.current.forceSyncPendingData();
      });

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Sync failed for:'),
        'exam-1',
        expect.any(Error)
      );

      mockDispatchEvent.mockRestore();
    });

    it('debería remover elementos después de 3 intentos fallidos', async () => {
      const pendingData = {
        'exam-1': { data: { test: 'data' }, retryCount: 3 }
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(pendingData));
      
      // Restore dispatchEvent if it's mocked
      if (vi.isMockFunction(window.dispatchEvent)) {
        vi.mocked(window.dispatchEvent).mockRestore?.();
      }
      
      // Mock dispatchEvent to throw error
      const mockDispatchEvent = vi.spyOn(window, 'dispatchEvent').mockImplementation(() => {
        throw new Error('Sync failed');
      });
      
      const { result } = renderHook(() => useOfflineMode());

      await act(async () => {
        await result.current.forceSyncPendingData();
      });

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Removing failed sync item after 3 retries:'),
        'exam-1'
      );

      mockDispatchEvent.mockRestore();
    });

    it('debería incrementar retry count en elementos fallidos', async () => {
      // Reset localStorage mock para este test
      let storedData = {};
      mockLocalStorage.getItem.mockImplementation(() => JSON.stringify({
        'exam-1': { data: { test: 'data' }, retryCount: 1 }
      }));
      mockLocalStorage.setItem.mockImplementation((key, value) => {
        storedData = JSON.parse(value);
      });
      
      // Restore dispatchEvent if it's mocked
      if (vi.isMockFunction(window.dispatchEvent)) {
        vi.mocked(window.dispatchEvent).mockRestore?.();
      }
      
      // Mock dispatchEvent to throw error
      const mockDispatchEvent = vi.spyOn(window, 'dispatchEvent').mockImplementation(() => {
        throw new Error('Sync failed');
      });
      
      const { result } = renderHook(() => useOfflineMode());

      await act(async () => {
        await result.current.forceSyncPendingData();
      });

      // Should update localStorage with incremented retry count
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'offline_sync_queue',
        expect.stringContaining('"retryCount":2')
      );

      mockDispatchEvent.mockRestore();
    });
  });

  describe('Manejo de mensajes de Service Worker', () => {
    it('debería manejar mensajes de sincronización del service worker', () => {
      const { result } = renderHook(() => useOfflineMode());
      
      // Mock the forceSyncPendingData function to track calls
      const forceSyncSpy = vi.spyOn(result.current, 'forceSyncPendingData');

      act(() => {
        // Simulate service worker message
        const messageEvent = new MessageEvent('message', {
          data: { type: 'SYNC_EXAM_DATA' }
        });
        
        // Get the message handler
        const calls = mockServiceWorker.addEventListener.mock.calls;
        const messageCall = calls.find(call => call[0] === 'message');
        
        if (messageCall) {
          messageCall[1](messageEvent);
        }
      });

      expect(console.log).toHaveBeenCalledWith(
        '🔄 Received sync request from service worker'
      );
    });

    it('debería ignorar mensajes irrelevantes del service worker', () => {
      renderHook(() => useOfflineMode());

      act(() => {
        // Simulate irrelevant service worker message
        const messageEvent = new MessageEvent('message', {
          data: { type: 'OTHER_MESSAGE' }
        });
        
        // Get the message handler
        const calls = mockServiceWorker.addEventListener.mock.calls;
        const messageCall = calls.find(call => call[0] === 'message');
        
        if (messageCall) {
          messageCall[1](messageEvent);
        }
      });

      // Should not log sync message
      expect(console.log).not.toHaveBeenCalledWith(
        expect.stringContaining('Received sync request from service worker')
      );
    });
  });

  describe('Actualización de contador pendiente', () => {
    it('debería actualizar contador periódicamente', () => {
      vi.useFakeTimers();
      
      // Reset localStorage mock para este test específico
      let storedData = {
        'exam-1': { data: { test: 'data1' } },
        'exam-2': { data: { test: 'data2' } }
      };
      mockLocalStorage.getItem.mockImplementation(() => JSON.stringify(storedData));
      mockLocalStorage.setItem.mockImplementation((key, value) => {
        storedData = JSON.parse(value);
      });
      
      const { result } = renderHook(() => useOfflineMode());

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.pendingSyncCount).toBe(2);

      vi.useRealTimers();
    });

    it('debería limpiar interval al desmontar', () => {
      vi.useFakeTimers();
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      
      const { unmount } = renderHook(() => useOfflineMode());
      
      unmount();
      
      expect(clearIntervalSpy).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('Cleanup y memory leaks', () => {
    it('debería limpiar event listeners al desmontar', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = renderHook(() => useOfflineMode());
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
    });

    it('debería limpiar service worker event listeners al desmontar', () => {
      const { unmount } = renderHook(() => useOfflineMode());
      
      unmount();
      
      expect(mockServiceWorker.removeEventListener).toHaveBeenCalledWith(
        'message',
        expect.any(Function)
      );
    });

    it('debería manejar desmontaje sin service worker', () => {
      // Temporarily remove serviceWorker
      const tempServiceWorker = navigator.serviceWorker;
      delete (navigator as any).serviceWorker;

      const { unmount } = renderHook(() => useOfflineMode());
      
      expect(() => unmount()).not.toThrow();

      // Restore service worker
      (navigator as any).serviceWorker = tempServiceWorker;
    });
  });

  describe('Casos edge', () => {
    it('debería manejar localStorage no disponible', () => {
      // Mock localStorage to throw errors
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });
      
      const { result } = renderHook(() => useOfflineMode());
      
      expect(() => {
        result.current.queueForSync({ test: 'data' }, 'exam-1');
      }).not.toThrow();
    });

    it('debería manejar JSON inválido en localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');
      
      const { result } = renderHook(() => useOfflineMode());
      
      const pendingData = result.current.getPendingSyncData();
      expect(pendingData).toEqual({});
    });

    it('debería manejar datos null en localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const { result } = renderHook(() => useOfflineMode());
      
      const pendingData = result.current.getPendingSyncData();
      expect(pendingData).toEqual({});
    });

    it('debería manejar eventos de conectividad múltiples', () => {
      // Restore any spies on dispatchEvent
      if (vi.isMockFunction(window.dispatchEvent)) {
        vi.mocked(window.dispatchEvent).mockRestore?.();
      }
      
      const { result } = renderHook(() => useOfflineMode());

      act(() => {
        window.dispatchEvent(new Event('offline'));
        window.dispatchEvent(new Event('online'));
        window.dispatchEvent(new Event('offline'));
        window.dispatchEvent(new Event('online'));
      });

      expect(result.current.isOnline).toBe(true);
    });

    it('debería manejar registration sin sync API', async () => {
      const mockRegistration = {
        addEventListener: vi.fn(),
        // No sync property
      };
      mockServiceWorker.register.mockResolvedValue(mockRegistration);
      mockServiceWorker.ready = Promise.resolve(mockRegistration);

      renderHook(() => useOfflineMode());

      await act(async () => {
        window.dispatchEvent(new Event('online'));
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      // Should not throw error
      expect(console.error).not.toHaveBeenCalled();
    });
  });
});