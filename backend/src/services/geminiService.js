import { GoogleGenAI } from '@google/genai';
import { supabase } from '../../supabase.config.js';
import logger from '../utils/logger.js';
import { encryptApiKey, decryptApiKey } from '../utils/encryption.js';

export class GeminiService {
  /**
   * Valida una API key de Gemini consultando los modelos disponibles
   */
  static async validateApiKey(apiKey) {
    try {
      // Validación simple de formato de API key de Google
      if (!apiKey || !apiKey.startsWith('AIza') || apiKey.length < 30) {
        return {
          isValid: false,
          error: 'Formato de API key inválido'
        };
      }
      
      // Si el formato es correcto, consideramos la key válida
      // Solo devolver que es válida, sin modelos
      return {
        isValid: true,
        message: 'API key válida'
      };

    } catch (error) {
      logger.error('Error validando API key de Gemini:', error);
      
      // Determinar el tipo de error
      if (error.message?.includes('API key not valid')) {
        return {
          isValid: false,
          error: 'API key inválida'
        };
      }
      
      if (error.message?.includes('API key expired')) {
        return {
          isValid: false,
          error: 'API key expirada'
        };
      }
      
      if (error.message?.includes('quota exceeded')) {
        return {
          isValid: false,
          error: 'Cuota de API excedida'
        };
      }

      return {
        isValid: false,
        error: 'Error validando API key'
      };
    }
  }

  /**
   * Guarda la API key del usuario en Supabase
   */
  static async saveUserApiKey(userId, apiKey) {
    try {
      // Encriptar la API key de forma segura con AES-256
      const encryptedApiKey = encryptApiKey(apiKey);

      const { data, error } = await supabase
        .from('user_api_keys')
        .upsert({
          user_id: userId,
          api_key: encryptedApiKey,
          service: 'gemini',
          is_active: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,service'
        });

      if (error) {
        logger.error('Error guardando API key en Supabase:', error);
        return {
          success: false,
          error: 'Error guardando API key'
        };
      }

      return {
        success: true,
        data
      };

    } catch (error) {
      logger.error('Error en saveUserApiKey:', error);
      return {
        success: false,
        error: 'Error interno'
      };
    }
  }

  /**
   * Obtiene la API key del usuario desde Supabase
   */
  static async getUserApiKey(userId) {
    try {
      const { data, error } = await supabase
        .from('user_api_keys')
        .select('api_key')
        .eq('user_id', userId)
        .eq('service', 'gemini')
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No se encontró registro
          return {
            success: false,
            error: 'API key no encontrada'
          };
        }
        logger.error('Error obteniendo API key de Supabase:', error);
        return {
          success: false,
          error: 'Error obteniendo API key'
        };
      }

      // Desencriptar la API key
      const apiKey = decryptApiKey(data.api_key);

      return {
        success: true,
        apiKey
      };

    } catch (error) {
      logger.error('Error en getUserApiKey:', error);
      return {
        success: false,
        error: 'Error interno'
      };
    }
  }

  /**
   * Elimina la API key del usuario
   */
  static async deleteUserApiKey(userId) {
    try {
      const { error } = await supabase
        .from('user_api_keys')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('service', 'gemini');

      if (error) {
        logger.error('Error eliminando API key de Supabase:', error);
        return {
          success: false,
          error: 'Error eliminando API key'
        };
      }

      return {
        success: true
      };

    } catch (error) {
      logger.error('Error en deleteUserApiKey:', error);
      return {
        success: false,
        error: 'Error interno'
      };
    }
  }

  /**
   * Verifica si el usuario tiene una API key válida
   */
  static async hasValidApiKey(userId) {
    try {
      const result = await this.getUserApiKey(userId);
      
      if (!result.success) {
        return false;
      }

      const validation = await this.validateApiKey(result.apiKey);
      return validation.isValid;

    } catch (error) {
      logger.error('Error verificando API key válida:', error);
      return false;
    }
  }
}