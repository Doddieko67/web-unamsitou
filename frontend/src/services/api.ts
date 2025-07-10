import { useAuthStore } from '../stores/authStore';
import { API_CONFIG, getApiUrl } from '../config/api.config';

// URL base del backend
const BASE_URL = API_CONFIG.BASE_URL;

// Tipos para las APIs
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface GenerateContentRequest {
  prompt: string;
  dificultad: 'easy' | 'medium' | 'hard' | 'mixed';
  tiempo_limite_segundos: number;
  exams_id?: string[];
}

export interface UploadFilesRequest {
  prompt: string;
  tiempo_limite_segundos: number;
  files: FileList;
}

export interface GenerateFeedbackRequest {
  examen_id: string;
}

export interface GenerateContentBasedOnHistoryRequest {
  exams_id: string[];
  prompt: string;
  tiempo_limite_segundos: number;
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const { session } = useAuthStore.getState();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    // Agregar token de autenticación si existe
    if (session?.access_token) {
      headers['authorization'] = `Bearer ${session.access_token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, config);
      
      // Manejar errores HTTP
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `HTTP ${response.status}: ${response.statusText}`
        }));
        
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Log del error para debugging
      console.error(`API Error [${endpoint}]:`, error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Error de red o servidor no disponible');
    }
  }

  // Endpoint para generar contenido basado en prompt
  async generateContent(data: GenerateContentRequest): Promise<ApiResponse> {
    return this.makeRequest('/api/generate-content', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Endpoint para subir archivos y generar examen
  async uploadFiles(data: UploadFilesRequest): Promise<ApiResponse> {
    const { session } = useAuthStore.getState();
    
    const formData = new FormData();
    formData.append('prompt', data.prompt);
    formData.append('tiempo_limite_segundos', data.tiempo_limite_segundos.toString());
    
    // Agregar archivos al FormData
    Array.from(data.files).forEach((file, index) => {
      formData.append(`file_${index}`, file);
    });

    const headers: Record<string, string> = {};
    
    // Agregar token de autenticación si existe
    if (session?.access_token) {
      headers['authorization'] = `Bearer ${session.access_token}`;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/upload_files`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `HTTP ${response.status}: ${response.statusText}`
        }));
        
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Upload files error:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Error al subir archivos');
    }
  }

  // Endpoint para generar feedback
  async generateFeedback(data: GenerateFeedbackRequest): Promise<ApiResponse> {
    return this.makeRequest('/api/generate-feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Endpoint para generar contenido basado en historial
  async generateContentBasedOnHistory(data: GenerateContentBasedOnHistoryRequest): Promise<ApiResponse> {
    return this.makeRequest('/api/generate-content-based-on-history', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Endpoint para verificar estado del servidor
  async healthCheck(): Promise<ApiResponse> {
    return this.makeRequest('/health', {
      method: 'GET',
    });
  }
}

export const apiService = new ApiService();