import { url_backend } from '../url_backend';

export interface GeminiModel {
  name: string;
  displayName: string;
  description: string;
  inputTokenLimit: number;
  outputTokenLimit: number;
  supportedGenerationMethods: string[];
}

export interface ApiKeyValidationResponse {
  success: boolean;
  data?: {
    isValid: boolean;
    message: string;
  };
  error?: string;
}

export interface ApiKeyStatusResponse {
  success: boolean;
  data?: {
    hasApiKey: boolean;
    isValid: boolean;
    apiKeyPreview?: string;
  };
  error?: string;
}

export interface ModelsResponse {
  success: boolean;
  data?: {
    models: GeminiModel[];
  };
  error?: string;
}

class GeminiServiceClass {
  private baseUrl = `${url_backend}/api/gemini`;

  /**
   * Obtiene el token de autorización
   */
  private getAuthToken(): string {
    // Intentar obtener token del almacenamiento de Zustand
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        const token = parsed.state?.session?.access_token;
        if (token) {
          return token;
        }
      } catch (error) {
        console.error('Error parsing auth storage:', error);
      }
    }
    
    // Fallback: intentar obtener token del localStorage directo
    const token = localStorage.getItem('authToken');
    if (token) {
      return token;
    }
    
    throw new Error('No hay token de autenticación. Por favor, inicia sesión.');
  }

  /**
   * Realiza una petición HTTP autenticada
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Valida una API key de Gemini
   */
  async validateApiKey(apiKey: string): Promise<ApiKeyValidationResponse> {
    try {
      const response = await this.makeRequest<ApiKeyValidationResponse>('/validate-api-key', {
        method: 'POST',
        body: JSON.stringify({ apiKey }),
      });

      return response;
    } catch (error) {
      console.error('Error validando API key:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error validando API key'
      };
    }
  }

  /**
   * Guarda la API key del usuario
   */
  async saveApiKey(apiKey: string): Promise<ApiKeyValidationResponse> {
    try {
      const response = await this.makeRequest<ApiKeyValidationResponse>('/save-api-key', {
        method: 'POST',
        body: JSON.stringify({ apiKey }),
      });

      return response;
    } catch (error) {
      console.error('Error guardando API key:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error guardando API key'
      };
    }
  }

  /**
   * Obtiene el estado de la API key del usuario
   */
  async getApiKeyStatus(): Promise<ApiKeyStatusResponse> {
    try {
      const response = await this.makeRequest<ApiKeyStatusResponse>('/get-api-key');
      return response;
    } catch (error) {
      console.error('Error obteniendo estado de API key:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo estado de API key'
      };
    }
  }

  /**
   * Obtiene los modelos disponibles para el usuario
   */
  async getModels(): Promise<ModelsResponse> {
    try {
      const response = await this.makeRequest<ModelsResponse>('/models');
      return response;
    } catch (error) {
      console.error('Error obteniendo modelos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo modelos'
      };
    }
  }

  /**
   * Utilidad para obtener el nombre limpio del modelo
   */
  getCleanModelName(fullName: string): string {
    // Convertir "models/gemini-1.5-flash" a "gemini-1.5-flash"
    return fullName.replace('models/', '');
  }

  /**
   * Utilidad para obtener el nombre completo del modelo
   */
  getFullModelName(cleanName: string): string {
    // Convertir "gemini-1.5-flash" a "models/gemini-1.5-flash"
    return cleanName.startsWith('models/') ? cleanName : `models/${cleanName}`;
  }
}

export const GeminiService = new GeminiServiceClass();