import { supabase } from '../supabase.config';

export interface ApiKeyData {
  id?: string;
  user_id: string;
  api_key: string;
  is_valid: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ApiKeyStatus {
  hasApiKey: boolean;
  isValid: boolean;
  apiKeyPreview?: string;
}

class ApiKeyServiceClass {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 2 * 60 * 1000; // 2 minutos

  /**
   * Obtiene datos del cache si están disponibles y no han expirado
   */
  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    // Limpiar cache expirado
    this.cache.delete(key);
    return null;
  }

  /**
   * Guarda datos en cache
   */
  private setCachedData<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Obtiene el estado de la API key del usuario desde Supabase
   */
  async getApiKeyStatus(): Promise<{ success: boolean; data?: ApiKeyStatus; error?: string }> {
    try {
      // Verificar autenticación
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      const cacheKey = `api-key-status-${user.id}`;
      
      // Verificar cache primero
      const cachedData = this.getCachedData<ApiKeyStatus>(cacheKey);
      if (cachedData) {
        return {
          success: true,
          data: cachedData
        };
      }

      // Consultar Supabase - tabla correcta: user_api_keys
      const { data: apiKeyData, error } = await supabase
        .from('user_api_keys')
        .select('api_key, is_active')
        .eq('user_id', user.id)
        .eq('service', 'gemini')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error obteniendo API key de Supabase:', error);
        return {
          success: false,
          error: 'Error al obtener datos de la API key'
        };
      }

      let status: ApiKeyStatus;

      if (!apiKeyData) {
        // No hay API key guardada
        status = {
          hasApiKey: false,
          isValid: false
        };
      } else {
        // Hay API key guardada
        const decryptedKey = this.decryptApiKey(apiKeyData.api_key);
        status = {
          hasApiKey: true,
          isValid: apiKeyData.is_active, // is_active en lugar de is_valid
          apiKeyPreview: `***${decryptedKey.slice(-8)}`
        };
      }

      // Guardar en cache
      this.setCachedData(cacheKey, status);

      return {
        success: true,
        data: status
      };

    } catch (error) {
      console.error('Error en getApiKeyStatus:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Guarda la API key en Supabase
   */
  async saveApiKey(apiKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Verificar autenticación
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Encriptar la API key
      const encryptedKey = this.encryptApiKey(apiKey);

      // Insertar o actualizar en Supabase
      const { error } = await supabase
        .from('user_api_keys')
        .upsert({
          user_id: user.id,
          service: 'gemini',
          api_key: encryptedKey,
          is_active: true, // Asumimos que es válida cuando se guarda
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,service'
        });

      if (error) {
        console.error('Error guardando API key en Supabase:', error);
        return {
          success: false,
          error: 'Error al guardar la API key'
        };
      }

      // Limpiar cache
      this.cache.clear();

      return {
        success: true
      };

    } catch (error) {
      console.error('Error en saveApiKey:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Elimina la API key del usuario
   */
  async deleteApiKey(): Promise<{ success: boolean; error?: string }> {
    try {
      // Verificar autenticación
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Marcar como inactiva en lugar de eliminar
      const { error } = await supabase
        .from('user_api_keys')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('service', 'gemini');

      if (error) {
        console.error('Error eliminando API key de Supabase:', error);
        return {
          success: false,
          error: 'Error al eliminar la API key'
        };
      }

      // Limpiar cache
      this.cache.clear();

      return {
        success: true
      };

    } catch (error) {
      console.error('Error en deleteApiKey:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene la API key desencriptada (solo para uso interno)
   */
  async getDecryptedApiKey(): Promise<{ success: boolean; apiKey?: string; error?: string }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      const { data: apiKeyData, error } = await supabase
        .from('user_api_keys')
        .select('api_key, is_active')
        .eq('user_id', user.id)
        .eq('service', 'gemini')
        .eq('is_active', true)
        .single();

      if (error || !apiKeyData) {
        return {
          success: false,
          error: 'No se encontró API key'
        };
      }

      if (!apiKeyData.is_active) {
        return {
          success: false,
          error: 'API key no está activa'
        };
      }

      const decryptedKey = this.decryptApiKey(apiKeyData.api_key);

      return {
        success: true,
        apiKey: decryptedKey
      };

    } catch (error) {
      console.error('Error en getDecryptedApiKey:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Encripta la API key usando Base64 (básico)
   */
  private encryptApiKey(apiKey: string): string {
    try {
      return btoa(apiKey); // Base64 encoding
    } catch (error) {
      console.error('Error encriptando API key:', error);
      return apiKey; // Fallback sin encriptación
    }
  }

  /**
   * Desencripta la API key desde Base64
   */
  private decryptApiKey(encryptedKey: string): string {
    try {
      return atob(encryptedKey); // Base64 decoding
    } catch (error) {
      console.error('Error desencriptando API key:', error);
      return encryptedKey; // Fallback sin desencriptación
    }
  }

  /**
   * Valida una API key usando el backend (solo validación)
   */
  async validateApiKey(apiKey: string): Promise<{ success: boolean; isValid?: boolean; error?: string }> {
    try {
      // Verificar autenticación
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Obtener token de autenticación
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        return {
          success: false,
          error: 'No se pudo obtener token de autenticación'
        };
      }

      // Hacer validación con el backend (solo para validar, no para guardar)
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/gemini/validate-api-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ apiKey })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `Error ${response.status}: ${response.statusText}`
        };
      }

      const result = await response.json();
      
      return {
        success: true,
        isValid: result.data?.isValid || false
      };

    } catch (error) {
      console.error('Error validando API key:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error validando API key'
      };
    }
  }

  /**
   * Limpia el cache manualmente
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const ApiKeyService = new ApiKeyServiceClass();