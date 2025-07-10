import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GeminiService } from '../geminiService';
import type { GeminiModel, ApiKeyValidationResponse, ApiKeyStatusResponse, ModelsResponse } from '../geminiService';

// Mock fetch
global.fetch = vi.fn();

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

// Mock console methods
const mockConsole = {
  error: vi.fn(),
  log: vi.fn(),
};
vi.stubGlobal('console', mockConsole);

describe('GeminiService', () => {
  const mockToken = 'mock-auth-token';
  const mockApiKey = 'AIzaSyDmock-api-key-example';
  const mockBackendUrl = 'http://localhost:3001';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Setup default localStorage mock
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === 'auth-storage') {
        return JSON.stringify({
          state: {
            session: {
              access_token: mockToken
            }
          }
        });
      }
      return null;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    // Clear cache
    (GeminiService as any).cache.clear();
  });

  describe('Configuración y utilidades básicas', () => {
    it('debería tener la URL base correcta', () => {
      const baseUrl = (GeminiService as any).baseUrl;
      expect(baseUrl).toContain('/api/gemini');
    });

    it('debería tener TTL por defecto configurado', () => {
      const defaultTtl = (GeminiService as any).DEFAULT_TTL;
      expect(defaultTtl).toBe(5 * 60 * 1000);
    });

    it('debería inicializar cache vacío', () => {
      const cache = (GeminiService as any).cache;
      expect(cache.size).toBe(0);
    });
  });

  describe('Utilidades de nombres de modelo', () => {
    it('debería limpiar nombres de modelo correctamente', () => {
      expect(GeminiService.getCleanModelName('models/gemini-1.5-flash')).toBe('gemini-1.5-flash');
      expect(GeminiService.getCleanModelName('models/gemini-1.5-pro')).toBe('gemini-1.5-pro');
      expect(GeminiService.getCleanModelName('gemini-1.5-flash')).toBe('gemini-1.5-flash');
    });

    it('debería obtener nombres completos de modelo correctamente', () => {
      expect(GeminiService.getFullModelName('gemini-1.5-flash')).toBe('models/gemini-1.5-flash');
      expect(GeminiService.getFullModelName('gemini-1.5-pro')).toBe('models/gemini-1.5-pro');
      expect(GeminiService.getFullModelName('models/gemini-1.5-flash')).toBe('models/gemini-1.5-flash');
    });

    it('debería manejar strings vacíos en nombres de modelo', () => {
      expect(GeminiService.getCleanModelName('')).toBe('');
      expect(GeminiService.getFullModelName('')).toBe('models/');
    });
  });

  describe('Gestión de autenticación', () => {
    it('debería obtener token de auth-storage de Zustand', () => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'auth-storage') {
          return JSON.stringify({
            state: {
              session: {
                access_token: 'zustand-token'
              }
            }
          });
        }
        return null;
      });

      const token = (GeminiService as any).getAuthToken();
      expect(token).toBe('zustand-token');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('auth-storage');
    });

    it('debería usar fallback authToken si auth-storage no está disponible', () => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'auth-storage') return null;
        if (key === 'authToken') return 'fallback-token';
        return null;
      });

      const token = (GeminiService as any).getAuthToken();
      expect(token).toBe('fallback-token');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('authToken');
    });

    it('debería lanzar error si no hay token disponible', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      expect(() => (GeminiService as any).getAuthToken()).toThrow(
        'No hay token de autenticación. Por favor, inicia sesión.'
      );
    });

    it('debería manejar auth-storage malformado', () => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'auth-storage') return '{"malformed": json}';
        if (key === 'authToken') return 'fallback-token';
        return null;
      });

      const token = (GeminiService as any).getAuthToken();
      expect(token).toBe('fallback-token');
      expect(mockConsole.error).toHaveBeenCalledWith('Error parsing auth storage:', expect.any(Error));
    });

    it('debería manejar auth-storage sin session', () => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'auth-storage') {
          return JSON.stringify({
            state: {
              // Sin session
            }
          });
        }
        if (key === 'authToken') return 'fallback-token';
        return null;
      });

      const token = (GeminiService as any).getAuthToken();
      expect(token).toBe('fallback-token');
    });
  });

  describe('Sistema de cache', () => {
    it('debería guardar y recuperar datos del cache', () => {
      const testData = { test: 'data' };
      const cacheKey = 'test-key';

      (GeminiService as any).setCachedData(cacheKey, testData);
      const cachedData = (GeminiService as any).getCachedData(cacheKey);

      expect(cachedData).toEqual(testData);
    });

    it('debería respetar TTL del cache', () => {
      const testData = { test: 'data' };
      const cacheKey = 'test-key';
      const shortTtl = 1000; // 1 segundo

      (GeminiService as any).setCachedData(cacheKey, testData, shortTtl);
      
      // Avanzar tiempo más allá del TTL
      vi.advanceTimersByTime(1500);
      
      const cachedData = (GeminiService as any).getCachedData(cacheKey);
      expect(cachedData).toBeNull();
    });

    it('debería limpiar cache expirado automáticamente', () => {
      const testData = { test: 'data' };
      const cacheKey = 'test-key';
      const shortTtl = 1000;

      (GeminiService as any).setCachedData(cacheKey, testData, shortTtl);
      vi.advanceTimersByTime(1500);
      
      (GeminiService as any).getCachedData(cacheKey);
      
      const cache = (GeminiService as any).cache;
      expect(cache.has(cacheKey)).toBe(false);
    });

    it('debería usar TTL por defecto si no se especifica', () => {
      const testData = { test: 'data' };
      const cacheKey = 'test-key';

      (GeminiService as any).setCachedData(cacheKey, testData);
      
      const cache = (GeminiService as any).cache;
      const cachedEntry = cache.get(cacheKey);
      
      expect(cachedEntry.ttl).toBe(5 * 60 * 1000);
    });
  });

  describe('makeRequest', () => {
    const mockResponse = { success: true, data: 'test' };

    beforeEach(() => {
      (fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });
    });

    it('debería realizar petición con headers correctos', async () => {
      await (GeminiService as any).makeRequest('/test');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/gemini/test'),
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`,
          },
        }
      );
    });

    it('debería combinar headers personalizados', async () => {
      await (GeminiService as any).makeRequest('/test', {
        headers: {
          'Custom-Header': 'custom-value',
        },
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`,
            'Custom-Header': 'custom-value',
          },
        })
      );
    });

    it('debería manejar respuestas de error HTTP', async () => {
      const errorMessage = 'API Error';
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: vi.fn().mockResolvedValue({ error: errorMessage }),
      });

      await expect((GeminiService as any).makeRequest('/test')).rejects.toThrow(errorMessage);
    });

    it('debería manejar respuestas de error sin JSON válido', async () => {
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
      });

      await expect((GeminiService as any).makeRequest('/test')).rejects.toThrow(
        'Error 500: Internal Server Error'
      );
    });

    it('debería propagar errores de red', async () => {
      const networkError = new Error('Network failed');
      (fetch as any).mockRejectedValue(networkError);

      await expect((GeminiService as any).makeRequest('/test')).rejects.toThrow(networkError);
    });
  });

  describe('validateApiKey', () => {
    it('debería validar API key exitosamente', async () => {
      const mockResponse: ApiKeyValidationResponse = {
        success: true,
        data: {
          isValid: true,
          message: 'API key válida'
        }
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await GeminiService.validateApiKey(mockApiKey);

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/validate-api-key'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ apiKey: mockApiKey }),
        })
      );
    });

    it('debería manejar API key inválida', async () => {
      const mockResponse: ApiKeyValidationResponse = {
        success: true,
        data: {
          isValid: false,
          message: 'API key inválida'
        }
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await GeminiService.validateApiKey('invalid-key');
      expect(result.data?.isValid).toBe(false);
    });

    it('debería manejar errores de red en validación', async () => {
      const networkError = new Error('Network error');
      (fetch as any).mockRejectedValue(networkError);

      const result = await GeminiService.validateApiKey(mockApiKey);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(mockConsole.error).toHaveBeenCalledWith('Error validando API key:', networkError);
    });

    it('debería manejar errores HTTP en validación', async () => {
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: vi.fn().mockResolvedValue({ error: 'Unauthorized' }),
      });

      const result = await GeminiService.validateApiKey(mockApiKey);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });
  });

  describe('saveApiKey', () => {
    it('debería guardar API key exitosamente', async () => {
      const mockResponse: ApiKeyValidationResponse = {
        success: true,
        data: {
          isValid: true,
          message: 'API key guardada exitosamente'
        }
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      // Agregar datos al cache primero
      (GeminiService as any).setCachedData('test-key', { test: 'data' });
      expect((GeminiService as any).cache.size).toBe(1);

      const result = await GeminiService.saveApiKey(mockApiKey);

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/save-api-key'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ apiKey: mockApiKey }),
        })
      );

      // Verificar que el cache se limpió
      expect((GeminiService as any).cache.size).toBe(0);
    });

    it('debería no limpiar cache si guardado falla', async () => {
      const mockResponse: ApiKeyValidationResponse = {
        success: false,
        error: 'Error guardando API key'
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      // Agregar datos al cache
      (GeminiService as any).setCachedData('test-key', { test: 'data' });
      expect((GeminiService as any).cache.size).toBe(1);

      await GeminiService.saveApiKey(mockApiKey);

      // Cache no debería limpiarse
      expect((GeminiService as any).cache.size).toBe(1);
    });

    it('debería manejar errores en guardado de API key', async () => {
      const networkError = new Error('Save failed');
      (fetch as any).mockRejectedValue(networkError);

      const result = await GeminiService.saveApiKey(mockApiKey);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Save failed');
      expect(mockConsole.error).toHaveBeenCalledWith('Error guardando API key:', networkError);
    });
  });

  describe('getApiKeyStatus', () => {
    it('debería obtener estado de API key exitosamente', async () => {
      const mockResponse: ApiKeyStatusResponse = {
        success: true,
        data: {
          hasApiKey: true,
          isValid: true,
          apiKeyPreview: 'AIzaSy...key'
        }
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await GeminiService.getApiKeyStatus();

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/get-api-key'),
        expect.any(Object)
      );
    });

    it('debería usar cache para obtener estado de API key', async () => {
      const mockResponse: ApiKeyStatusResponse = {
        success: true,
        data: {
          hasApiKey: true,
          isValid: true,
          apiKeyPreview: 'AIzaSy...key'
        }
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      // Primera llamada
      await GeminiService.getApiKeyStatus();
      expect(fetch).toHaveBeenCalledTimes(1);

      // Segunda llamada debería usar cache
      const cachedResult = await GeminiService.getApiKeyStatus();
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(cachedResult).toEqual(mockResponse);
    });

    it('debería usar TTL específico para estado de API key', async () => {
      const mockResponse: ApiKeyStatusResponse = {
        success: true,
        data: {
          hasApiKey: true,
          isValid: true
        }
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      await GeminiService.getApiKeyStatus();
      
      const cache = (GeminiService as any).cache;
      const cachedEntry = cache.get('api-key-status');
      
      expect(cachedEntry.ttl).toBe(2 * 60 * 1000); // 2 minutos
    });

    it('debería no cachear respuestas de error', async () => {
      const mockResponse: ApiKeyStatusResponse = {
        success: false,
        error: 'Error obteniendo estado'
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      await GeminiService.getApiKeyStatus();
      
      const cache = (GeminiService as any).cache;
      expect(cache.has('api-key-status')).toBe(false);
    });

    it('debería manejar errores en obtención de estado', async () => {
      const networkError = new Error('Status failed');
      (fetch as any).mockRejectedValue(networkError);

      const result = await GeminiService.getApiKeyStatus();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Status failed');
      expect(mockConsole.error).toHaveBeenCalledWith('Error obteniendo estado de API key:', networkError);
    });
  });

  const mockModels: GeminiModel[] = [
    {
      name: 'models/gemini-1.5-flash',
      displayName: 'Gemini 1.5 Flash',
      description: 'Fast and efficient model',
      inputTokenLimit: 1000000,
      outputTokenLimit: 8192,
      supportedGenerationMethods: ['generateContent']
    },
    {
      name: 'models/gemini-1.5-pro',
      displayName: 'Gemini 1.5 Pro',
      description: 'Advanced reasoning model',
      inputTokenLimit: 2000000,
      outputTokenLimit: 8192,
      supportedGenerationMethods: ['generateContent']
    }
  ];

  describe('getModels', () => {

    it('debería obtener modelos exitosamente', async () => {
      const mockResponse: ModelsResponse = {
        success: true,
        data: {
          models: mockModels
        }
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await GeminiService.getModels();

      expect(result).toEqual(mockResponse);
      expect(result.data?.models).toHaveLength(2);
      expect(result.data?.models[0].name).toBe('models/gemini-1.5-flash');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/models'),
        expect.any(Object)
      );
    });

    it('debería manejar respuesta sin modelos', async () => {
      const mockResponse: ModelsResponse = {
        success: true,
        data: {
          models: []
        }
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await GeminiService.getModels();
      expect(result.data?.models).toHaveLength(0);
    });

    it('debería manejar errores en obtención de modelos', async () => {
      const networkError = new Error('Models failed');
      (fetch as any).mockRejectedValue(networkError);

      const result = await GeminiService.getModels();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Models failed');
      expect(mockConsole.error).toHaveBeenCalledWith('Error obteniendo modelos:', networkError);
    });

    it('debería manejar errores HTTP en modelos', async () => {
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: vi.fn().mockResolvedValue({ error: 'No autorizado' }),
      });

      const result = await GeminiService.getModels();

      expect(result.success).toBe(false);
      expect(result.error).toBe('No autorizado');
    });
  });

  describe('Integración completa', () => {
    it('debería manejar flujo completo de configuración de API key', async () => {
      // 1. Validar API key
      const validationResponse: ApiKeyValidationResponse = {
        success: true,
        data: { isValid: true, message: 'Válida' }
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(validationResponse),
      });

      const validation = await GeminiService.validateApiKey(mockApiKey);
      expect(validation.data?.isValid).toBe(true);

      // 2. Guardar API key
      const saveResponse: ApiKeyValidationResponse = {
        success: true,
        data: { isValid: true, message: 'Guardada' }
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(saveResponse),
      });

      const save = await GeminiService.saveApiKey(mockApiKey);
      expect(save.success).toBe(true);

      // 3. Verificar estado
      const statusResponse: ApiKeyStatusResponse = {
        success: true,
        data: { hasApiKey: true, isValid: true, apiKeyPreview: 'AIza...key' }
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(statusResponse),
      });

      const status = await GeminiService.getApiKeyStatus();
      expect(status.data?.hasApiKey).toBe(true);

      // 4. Obtener modelos
      const modelsResponse: ModelsResponse = {
        success: true,
        data: { models: [mockModels[0]] }
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(modelsResponse),
      });

      const models = await GeminiService.getModels();
      expect(models.data?.models).toHaveLength(1);
    });

    it('debería manejar pérdida de autenticación', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const validationResult = await GeminiService.validateApiKey(mockApiKey);
      expect(validationResult.success).toBe(false);
      expect(validationResult.error).toContain('No hay token de autenticación');

      const saveResult = await GeminiService.saveApiKey(mockApiKey);
      expect(saveResult.success).toBe(false);
      expect(saveResult.error).toContain('No hay token de autenticación');

      const statusResult = await GeminiService.getApiKeyStatus();
      expect(statusResult.success).toBe(false);
      expect(statusResult.error).toContain('No hay token de autenticación');

      const modelsResult = await GeminiService.getModels();
      expect(modelsResult.success).toBe(false);
      expect(modelsResult.error).toContain('No hay token de autenticación');
    });
  });
});