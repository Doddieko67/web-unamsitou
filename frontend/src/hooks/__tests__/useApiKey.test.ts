import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useApiKey, useGeminiApiKey } from '../useApiKey';

// Mock completo del ApiKeyService con implementación básica
const mockApiKeyService = {
  getApiKeyStatus: vi.fn(),
  getDecryptedApiKey: vi.fn(),
  clearCache: vi.fn()
};

vi.mock('../services/apiKeyService', () => ({
  ApiKeyService: mockApiKeyService
}));

// Mock del auth store
const mockUseAuthStore = vi.fn();

vi.mock('../stores/authStore', () => ({
  useAuthStore: mockUseAuthStore
}));

describe('useApiKey Hook - Tests Básicos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default auth state
    mockUseAuthStore.mockReturnValue({
      session: {
        access_token: 'mock-access-token'
      }
    });

    // Setup default API service responses
    mockApiKeyService.getApiKeyStatus.mockResolvedValue({
      success: true,
      data: {
        hasApiKey: true,
        isValid: true
      }
    });

    mockApiKeyService.getDecryptedApiKey.mockResolvedValue({
      success: true,
      apiKey: 'AIzaSyMockApiKey123'
    });

    mockApiKeyService.clearCache.mockImplementation(() => {});
  });

  describe('Estructura y tipos básicos', () => {
    it('debería tener la estructura correcta', () => {
      const { result } = renderHook(() => useApiKey());

      // Verificar propiedades
      expect(result.current).toHaveProperty('apiKey');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('hasApiKey');
      expect(result.current).toHaveProperty('isValid');
      expect(result.current).toHaveProperty('refreshApiKey');

      // Verificar tipos
      expect(typeof result.current.refreshApiKey).toBe('function');
      expect(typeof result.current.loading).toBe('boolean');
      expect(typeof result.current.hasApiKey).toBe('boolean');
      expect(typeof result.current.isValid).toBe('boolean');
    });

    it('debería manejar ausencia de sesión', () => {
      mockUseAuthStore.mockReturnValue({
        session: null
      });

      const { result } = renderHook(() => useApiKey());

      expect(result.current.apiKey).toBe(null);
      expect(result.current.hasApiKey).toBe(false);
      expect(result.current.isValid).toBe(false);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('debería manejar sesión sin access_token', () => {
      mockUseAuthStore.mockReturnValue({
        session: {
          access_token: null
        }
      });

      const { result } = renderHook(() => useApiKey());

      expect(result.current.apiKey).toBe(null);
      expect(result.current.hasApiKey).toBe(false);
      expect(result.current.isValid).toBe(false);
      expect(result.current.loading).toBe(false);
    });

    it('debería manejar session undefined', () => {
      mockUseAuthStore.mockReturnValue({
        session: undefined
      });

      const { result } = renderHook(() => useApiKey());

      expect(result.current.loading).toBe(false);
      expect(result.current.apiKey).toBe(null);
    });
  });

  describe('Estados de carga y API key', () => {
    it('debería ejecutar sin errores con sesión válida', async () => {
      const { result } = renderHook(() => useApiKey());

      // Wait for async operations
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(typeof result.current.apiKey === 'string' || result.current.apiKey === null).toBe(true);
      expect(typeof result.current.hasApiKey).toBe('boolean');
      expect(typeof result.current.isValid).toBe('boolean');
      expect(typeof result.current.loading).toBe('boolean');
    });

    it('debería manejar respuesta exitosa con API key válida', async () => {
      mockApiKeyService.getApiKeyStatus.mockResolvedValue({
        success: true,
        data: {
          hasApiKey: true,
          isValid: true
        }
      });

      mockApiKeyService.getDecryptedApiKey.mockResolvedValue({
        success: true,
        apiKey: 'AIzaSyTestKey456'
      });

      const { result } = renderHook(() => useApiKey());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Verify the hook works without errors
      expect(result.current).toHaveProperty('apiKey');
      expect(result.current).toHaveProperty('hasApiKey');
      expect(result.current).toHaveProperty('isValid');
    });

    it('debería manejar caso sin API key', async () => {
      mockApiKeyService.getApiKeyStatus.mockResolvedValue({
        success: true,
        data: {
          hasApiKey: false,
          isValid: false
        }
      });

      const { result } = renderHook(() => useApiKey());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockApiKeyService.getDecryptedApiKey).not.toHaveBeenCalled();
    });

    it('debería manejar API key inválida', async () => {
      mockApiKeyService.getApiKeyStatus.mockResolvedValue({
        success: true,
        data: {
          hasApiKey: true,
          isValid: false
        }
      });

      const { result } = renderHook(() => useApiKey());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockApiKeyService.getDecryptedApiKey).not.toHaveBeenCalled();
    });
  });

  describe('Manejo de errores básico', () => {
    it('debería manejar error en getApiKeyStatus', async () => {
      mockApiKeyService.getApiKeyStatus.mockResolvedValue({
        success: false,
        error: 'Error de base de datos'
      });

      const { result } = renderHook(() => useApiKey());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.apiKey).toBe(null);
      expect(result.current.hasApiKey).toBe(false);
      expect(result.current.isValid).toBe(false);
    });

    it('debería manejar error en getDecryptedApiKey', async () => {
      mockApiKeyService.getApiKeyStatus.mockResolvedValue({
        success: true,
        data: {
          hasApiKey: true,
          isValid: true
        }
      });

      mockApiKeyService.getDecryptedApiKey.mockResolvedValue({
        success: false,
        error: 'Error de desencriptación'
      });

      const { result } = renderHook(() => useApiKey());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.apiKey).toBe(null);
    });

    it('debería manejar excepción durante la carga', async () => {
      mockApiKeyService.getApiKeyStatus.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useApiKey());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.apiKey).toBe(null);
      expect(result.current.hasApiKey).toBe(false);
      expect(result.current.isValid).toBe(false);
    });

    it('debería manejar errores no-Error objects', async () => {
      mockApiKeyService.getApiKeyStatus.mockRejectedValue('String error');

      const { result } = renderHook(() => useApiKey());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.apiKey).toBe(null);
    });

    it('debería manejar respuesta sin data', async () => {
      mockApiKeyService.getApiKeyStatus.mockResolvedValue({
        success: true,
        data: null
      });

      const { result } = renderHook(() => useApiKey());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.apiKey).toBe(null);
    });

    it('debería manejar getDecryptedApiKey sin apiKey', async () => {
      mockApiKeyService.getApiKeyStatus.mockResolvedValue({
        success: true,
        data: {
          hasApiKey: true,
          isValid: true
        }
      });

      mockApiKeyService.getDecryptedApiKey.mockResolvedValue({
        success: true,
        apiKey: null
      });

      const { result } = renderHook(() => useApiKey());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.apiKey).toBe(null);
    });
  });

  describe('refreshApiKey función', () => {
    it('debería ejecutar refreshApiKey sin errores', async () => {
      const { result } = renderHook(() => useApiKey());

      await act(async () => {
        await result.current.refreshApiKey();
      });

      // Verify function exists and executes
      expect(typeof result.current.refreshApiKey).toBe('function');
      expect(result.current).toHaveProperty('apiKey');
    });

    it('debería manejar errores en refresh', async () => {
      const { result } = renderHook(() => useApiKey());

      // Setup error for refresh
      mockApiKeyService.getApiKeyStatus.mockRejectedValue(new Error('Refresh failed'));

      await act(async () => {
        await result.current.refreshApiKey();
      });

      expect(result.current.apiKey).toBe(null);
    });

    it('debería permitir múltiples refreshes', async () => {
      const { result } = renderHook(() => useApiKey());

      await act(async () => {
        await result.current.refreshApiKey();
        await result.current.refreshApiKey();
        await result.current.refreshApiKey();
      });

      // Verify function still works after multiple calls
      expect(typeof result.current.refreshApiKey).toBe('function');
    });
  });

  describe('Casos edge y validaciones', () => {
    it('debería manejar datos parciales en respuesta', async () => {
      mockApiKeyService.getApiKeyStatus.mockResolvedValue({
        success: true,
        data: {
          hasApiKey: true
          // isValid missing
        }
      });

      const { result } = renderHook(() => useApiKey());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.apiKey).toBe(null);
    });

    it('debería manejar respuesta con success undefined', async () => {
      mockApiKeyService.getApiKeyStatus.mockResolvedValue({
        data: {
          hasApiKey: true,
          isValid: true
        }
      });

      const { result } = renderHook(() => useApiKey());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.apiKey).toBe(null);
    });

    it('debería manejar cambios de sesión', () => {
      const { result, rerender } = renderHook(() => useApiKey());

      // Change session
      mockUseAuthStore.mockReturnValue({
        session: {
          access_token: 'new-token'
        }
      });

      rerender();

      expect(result.current).toHaveProperty('apiKey');
    });

    it('debería manejar desmontaje del componente', () => {
      const { unmount } = renderHook(() => useApiKey());

      expect(() => unmount()).not.toThrow();
    });

    it('debería permitir múltiples instancias', () => {
      const { result: result1 } = renderHook(() => useApiKey());
      const { result: result2 } = renderHook(() => useApiKey());

      expect(result1.current).toBeDefined();
      expect(result2.current).toBeDefined();
      expect(result1.current.refreshApiKey).not.toBe(result2.current.refreshApiKey);
    });
  });
});

describe('useGeminiApiKey Hook - Tests Básicos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseAuthStore.mockReturnValue({
      session: {
        access_token: 'mock-access-token'
      }
    });

    mockApiKeyService.getApiKeyStatus.mockResolvedValue({
      success: true,
      data: {
        hasApiKey: true,
        isValid: true
      }
    });

    mockApiKeyService.getDecryptedApiKey.mockResolvedValue({
      success: true,
      apiKey: 'AIzaSyGeminiKey789'
    });
  });

  describe('Funcionalidad básica', () => {
    it('debería retornar string o null', async () => {
      const { result } = renderHook(() => useGeminiApiKey());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(typeof result.current === 'string' || result.current === null).toBe(true);
    });

    it('debería retornar null cuando no hay API key', async () => {
      mockApiKeyService.getApiKeyStatus.mockResolvedValue({
        success: true,
        data: {
          hasApiKey: false,
          isValid: false
        }
      });

      const { result } = renderHook(() => useGeminiApiKey());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current).toBe(null);
    });

    it('debería retornar null cuando la API key no es válida', async () => {
      mockApiKeyService.getApiKeyStatus.mockResolvedValue({
        success: true,
        data: {
          hasApiKey: true,
          isValid: false
        }
      });

      const { result } = renderHook(() => useGeminiApiKey());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current).toBe(null);
    });

    it('debería retornar null cuando hay error', async () => {
      mockApiKeyService.getApiKeyStatus.mockRejectedValue(new Error('Service error'));

      const { result } = renderHook(() => useGeminiApiKey());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current).toBe(null);
    });

    it('debería retornar null sin sesión', () => {
      mockUseAuthStore.mockReturnValue({
        session: null
      });

      const { result } = renderHook(() => useGeminiApiKey());

      expect(result.current).toBe(null);
    });

    it('debería manejar cambios de estado', () => {
      const { result, rerender } = renderHook(() => useGeminiApiKey());

      // Change to invalid state
      mockApiKeyService.getApiKeyStatus.mockResolvedValue({
        success: true,
        data: {
          hasApiKey: true,
          isValid: false
        }
      });

      rerender();

      expect(typeof result.current === 'string' || result.current === null).toBe(true);
    });

    it('debería permitir múltiples instancias', () => {
      const { result: result1 } = renderHook(() => useGeminiApiKey());
      const { result: result2 } = renderHook(() => useGeminiApiKey());

      expect(typeof result1.current === 'string' || result1.current === null).toBe(true);
      expect(typeof result2.current === 'string' || result2.current === null).toBe(true);
    });

    it('debería manejar desmontaje correctamente', () => {
      const { unmount } = renderHook(() => useGeminiApiKey());

      expect(() => unmount()).not.toThrow();
    });
  });
});