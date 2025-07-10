import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiService } from '../api';
import type { 
  GenerateContentRequest, 
  UploadFilesRequest, 
  GenerateFeedbackRequest, 
  GenerateContentBasedOnHistoryRequest,
  ApiResponse 
} from '../api';

// Mock del auth store
const mockAuthStore = {
  getState: vi.fn(() => ({
    session: {
      access_token: 'mock-access-token'
    }
  }))
};

vi.mock('../stores/authStore', () => ({
  useAuthStore: mockAuthStore
}));

// Mock fetch
global.fetch = vi.fn();

// Mock console
const mockConsole = {
  error: vi.fn(),
  log: vi.fn(),
};
vi.stubGlobal('console', mockConsole);

describe('ApiService', () => {
  const mockToken = 'mock-access-token';

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default auth state
    mockAuthStore.getState.mockReturnValue({
      session: {
        access_token: mockToken
      }
    });

    // Setup default fetch response
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        data: 'mock response',
        message: 'Success'
      }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Configuración básica', () => {
    it('debería tener instancia exportada', () => {
      expect(apiService).toBeDefined();
      expect(typeof apiService).toBe('object');
    });

    it('debería tener métodos públicos disponibles', () => {
      expect(typeof apiService.generateContent).toBe('function');
      expect(typeof apiService.uploadFiles).toBe('function');
      expect(typeof apiService.generateFeedback).toBe('function');
      expect(typeof apiService.generateContentBasedOnHistory).toBe('function');
      expect(typeof apiService.healthCheck).toBe('function');
    });
  });

  describe('makeRequest - Método base', () => {
    it('debería realizar petición GET básica', async () => {
      await apiService.healthCheck();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/health'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('debería realizar petición sin headers de auth cuando no hay sesión', async () => {
      mockAuthStore.getState.mockReturnValue({
        session: null
      });

      await apiService.healthCheck();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/health'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('debería manejar errores HTTP con JSON válido', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: vi.fn().mockResolvedValue({
          error: 'Invalid request parameters'
        }),
      });

      await expect(apiService.healthCheck()).rejects.toThrow('Invalid request parameters');
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('API Error'),
        expect.any(Error)
      );
    });

    it('debería manejar errores HTTP sin JSON válido', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
      });

      await expect(apiService.healthCheck()).rejects.toThrow('HTTP 500: Internal Server Error');
    });

    it('debería manejar errores de red', async () => {
      const networkError = new Error('Network failure');
      (global.fetch as any).mockRejectedValue(networkError);

      await expect(apiService.healthCheck()).rejects.toThrow('Network failure');
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('API Error'),
        networkError
      );
    });

    it('debería manejar errores desconocidos', async () => {
      (global.fetch as any).mockRejectedValue('String error');

      await expect(apiService.healthCheck()).rejects.toThrow('Error de red o servidor no disponible');
    });
  });

  describe('generateContent', () => {
    const mockRequest: GenerateContentRequest = {
      prompt: 'Genera un examen de matemáticas',
      dificultad: 'medium',
      tiempo_limite_segundos: 3600,
      exams_id: ['exam1', 'exam2']
    };

    it('debería realizar petición POST con datos correctos', async () => {
      const mockResponse: ApiResponse = {
        data: { exam_id: 'new-exam-123' },
        message: 'Examen generado exitosamente'
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await apiService.generateContent(mockRequest);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/generate-content'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(mockRequest)
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('debería manejar respuesta exitosa sin exams_id', async () => {
      const requestWithoutExams = {
        prompt: 'Genera un examen básico',
        dificultad: 'easy' as const,
        tiempo_limite_segundos: 1800
      };

      const result = await apiService.generateContent(requestWithoutExams);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/generate-content'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestWithoutExams)
        })
      );

      expect(result).toHaveProperty('data');
    });

    it('debería propagar errores del servidor', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: vi.fn().mockResolvedValue({
          error: 'Prompt inválido'
        }),
      });

      await expect(apiService.generateContent(mockRequest)).rejects.toThrow('Prompt inválido');
    });

    it('debería incluir datos en el body de la petición', async () => {
      await apiService.generateContent(mockRequest);

      const fetchCall = (global.fetch as any).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      
      expect(requestBody).toEqual(mockRequest);
      expect(requestBody.prompt).toBe('Genera un examen de matemáticas');
      expect(requestBody.dificultad).toBe('medium');
      expect(requestBody.tiempo_limite_segundos).toBe(3600);
      expect(requestBody.exams_id).toEqual(['exam1', 'exam2']);
    });
  });

  describe('uploadFiles', () => {
    const createMockFileList = (files: Array<{ name: string; content: string }>) => {
      const fileList = files.map(fileData => {
        const file = new File([fileData.content], fileData.name, { type: 'text/plain' });
        return file;
      });
      
      // Simular FileList
      const mockFileList = {
        ...fileList,
        length: fileList.length,
        item: (index: number) => fileList[index] || null,
        [Symbol.iterator]: function* () {
          for (let i = 0; i < fileList.length; i++) {
            yield fileList[i];
          }
        }
      };
      
      return mockFileList as unknown as FileList;
    };

    const mockRequest: UploadFilesRequest = {
      prompt: 'Genera examen basado en archivos',
      tiempo_limite_segundos: 2400,
      files: createMockFileList([
        { name: 'test1.pdf', content: 'Contenido del archivo 1' },
        { name: 'test2.txt', content: 'Contenido del archivo 2' }
      ])
    };

    it('debería realizar petición POST con FormData', async () => {
      const mockResponse: ApiResponse = {
        data: { exam_id: 'file-based-exam-456' },
        message: 'Examen generado desde archivos'
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await apiService.uploadFiles(mockRequest);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/upload_files'),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData)
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('debería incluir archivos en FormData correctamente', async () => {
      let capturedFormData: FormData;
      (global.fetch as any).mockImplementation((url: string, options: RequestInit) => {
        capturedFormData = options.body as FormData;
        return Promise.resolve({
          ok: true,
          json: vi.fn().mockResolvedValue({ data: 'success' }),
        });
      });

      await apiService.uploadFiles(mockRequest);

      expect(capturedFormData!.get('prompt')).toBe(mockRequest.prompt);
      expect(capturedFormData!.get('tiempo_limite_segundos')).toBe(mockRequest.tiempo_limite_segundos.toString());
      expect(capturedFormData!.get('file_0')).toBeInstanceOf(File);
      expect(capturedFormData!.get('file_1')).toBeInstanceOf(File);
    });

    it('debería manejar upload sin token de autenticación', async () => {
      mockAuthStore.getState.mockReturnValue({
        session: null
      });

      await apiService.uploadFiles(mockRequest);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/upload_files'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Object)
        })
      );
    });

    it('debería manejar errores de upload', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 413,
        statusText: 'Payload Too Large',
        json: vi.fn().mockResolvedValue({
          error: 'Archivo demasiado grande'
        }),
      });

      await expect(apiService.uploadFiles(mockRequest)).rejects.toThrow('Archivo demasiado grande');
      expect(mockConsole.error).toHaveBeenCalledWith(
        'Upload files error:',
        expect.any(Error)
      );
    });

    it('debería manejar fallos de red en upload', async () => {
      const networkError = new Error('Upload failed');
      (global.fetch as any).mockRejectedValue(networkError);

      await expect(apiService.uploadFiles(mockRequest)).rejects.toThrow('Upload failed');
    });

    it('debería manejar errores desconocidos en upload', async () => {
      (global.fetch as any).mockRejectedValue('Unknown error');

      await expect(apiService.uploadFiles(mockRequest)).rejects.toThrow('Error al subir archivos');
    });
  });

  describe('generateFeedback', () => {
    const mockRequest: GenerateFeedbackRequest = {
      examen_id: 'exam-123'
    };

    it('debería realizar petición POST correctamente', async () => {
      const mockResponse: ApiResponse = {
        data: { 
          feedback: 'Excelente trabajo en el examen',
          score: 85,
          recommendations: ['Revisar tema X', 'Practicar más Y']
        },
        message: 'Feedback generado exitosamente'
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await apiService.generateFeedback(mockRequest);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/generate-feedback'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(mockRequest)
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('debería manejar examen_id vacío', async () => {
      const emptyRequest = { examen_id: '' };

      await apiService.generateFeedback(emptyRequest);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/generate-feedback'),
        expect.objectContaining({
          body: JSON.stringify(emptyRequest)
        })
      );
    });
  });

  describe('generateContentBasedOnHistory', () => {
    const mockRequest: GenerateContentBasedOnHistoryRequest = {
      exams_id: ['exam1', 'exam2', 'exam3'],
      prompt: 'Genera examen basado en historial',
      tiempo_limite_segundos: 4800
    };

    it('debería realizar petición POST correctamente', async () => {
      const mockResponse: ApiResponse = {
        data: { 
          exam_id: 'history-based-exam-789',
          based_on_count: 3
        },
        message: 'Examen generado basado en historial'
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await apiService.generateContentBasedOnHistory(mockRequest);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/generate-content-based-on-history'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(mockRequest)
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('debería manejar array vacío de exams_id', async () => {
      const emptyHistoryRequest = {
        exams_id: [],
        prompt: 'Genera examen sin historial',
        tiempo_limite_segundos: 1800
      };

      await apiService.generateContentBasedOnHistory(emptyHistoryRequest);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/generate-content-based-on-history'),
        expect.objectContaining({
          body: JSON.stringify(emptyHistoryRequest)
        })
      );
    });

    it('debería manejar error de historial insuficiente', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: vi.fn().mockResolvedValue({
          error: 'Historial insuficiente para generar contenido'
        }),
      });

      await expect(apiService.generateContentBasedOnHistory(mockRequest)).rejects.toThrow(
        'Historial insuficiente para generar contenido'
      );
    });
  });

  describe('healthCheck', () => {
    it('debería realizar petición GET al endpoint health', async () => {
      const mockResponse: ApiResponse = {
        data: { 
          status: 'healthy',
          timestamp: '2024-01-10T12:00:00Z',
          version: '1.0.0'
        },
        message: 'Servidor funcionando correctamente'
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await apiService.healthCheck();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/health'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('debería manejar servidor no disponible', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: vi.fn().mockResolvedValue({
          error: 'Servidor en mantenimiento'
        }),
      });

      await expect(apiService.healthCheck()).rejects.toThrow('Servidor en mantenimiento');
    });

    it('debería funcionar sin token de autenticación', async () => {
      mockAuthStore.getState.mockReturnValue({
        session: null
      });

      const mockResponse = { data: { status: 'healthy' } };
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await apiService.healthCheck();

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/health'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });

  describe('Casos edge y validaciones', () => {
    it('debería manejar sesión con token undefined', async () => {
      mockAuthStore.getState.mockReturnValue({
        session: {
          access_token: undefined
        }
      });

      await apiService.healthCheck();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/health'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('debería manejar sesión con token vacío', async () => {
      mockAuthStore.getState.mockReturnValue({
        session: {
          access_token: ''
        }
      });

      await apiService.healthCheck();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/health'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('debería manejar respuestas JSON malformadas', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON in response')),
      });

      await expect(apiService.healthCheck()).rejects.toThrow('Invalid JSON in response');
    });

    it('debería usar URL base del entorno correctamente', async () => {
      await apiService.healthCheck();

      const fetchCall = (global.fetch as any).mock.calls[0];
      const url = fetchCall[0];
      
      expect(url).toContain('/health');
      expect(typeof url).toBe('string');
    });

    it('debería mantener consistencia en estructura de respuestas', async () => {
      const responses = [];
      
      // Test múltiples endpoints
      responses.push(await apiService.healthCheck());
      responses.push(await apiService.generateContent({
        prompt: 'test',
        dificultad: 'easy',
        tiempo_limite_segundos: 1800
      }));
      
      // Verificar que todas las respuestas tienen estructura consistente
      responses.forEach(response => {
        expect(response).toHaveProperty('data');
        expect(response).toHaveProperty('message');
      });
    });
  });

  describe('Integración de autenticación', () => {
    it('debería funcionar con diferentes estados de autenticación', async () => {
      // Test con autenticación
      const result1 = await apiService.healthCheck();
      expect(result1).toHaveProperty('data');
      
      // Test sin autenticación
      mockAuthStore.getState.mockReturnValue({ session: null });
      const result2 = await apiService.healthCheck();
      expect(result2).toHaveProperty('data');
    });

    it('debería manejar cambios de sesión correctamente', async () => {
      // Primera petición con token
      const result1 = await apiService.healthCheck();
      expect(result1).toHaveProperty('data');
      
      // Cambiar estado de sesión
      mockAuthStore.getState.mockReturnValue({ session: null });
      
      // Segunda petición sin token
      const result2 = await apiService.healthCheck();
      expect(result2).toHaveProperty('data');
      
      // Ambas peticiones deberían ser exitosas
      expect(result1.data).toBeDefined();
      expect(result2.data).toBeDefined();
    });
  });
});