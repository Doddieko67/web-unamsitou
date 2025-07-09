import { GoogleGenAI } from '@google/genai';
import { GeminiService } from '../services/geminiService.js';
import logger from '../utils/logger.js';

export class GeminiController {
  /**
   * Valida una API key de Gemini consultando los modelos disponibles
   */
  static async validateApiKey(req, res) {
    try {
      const { apiKey } = req.body;
      const userId = req.user?.id;

      if (!apiKey) {
        return res.status(400).json({
          success: false,
          error: 'API key es requerida'
        });
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      // Validar formato básico de API key de Google
      if (!apiKey.startsWith('AIza') || apiKey.length < 20) {
        return res.status(400).json({
          success: false,
          error: 'Formato de API key inválido'
        });
      }

      // Validar API key consultando los modelos disponibles
      const validation = await GeminiService.validateApiKey(apiKey);

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: validation.error || 'API key inválida'
        });
      }

      // Si es válida, devolver los modelos disponibles
      res.json({
        success: true,
        data: {
          isValid: true,
          models: validation.models,
          message: 'API key válida'
        }
      });

    } catch (error) {
      logger.error('Error validando API key:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Guarda la API key del usuario en la base de datos
   */
  static async saveApiKey(req, res) {
    try {
      const { apiKey } = req.body;
      const userId = req.user?.id;

      if (!apiKey || !userId) {
        return res.status(400).json({
          success: false,
          error: 'API key y usuario son requeridos'
        });
      }

      // Primero validar la API key
      const validation = await GeminiService.validateApiKey(apiKey);

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: validation.error || 'API key inválida'
        });
      }

      // Guardar la API key en la base de datos
      const result = await GeminiService.saveUserApiKey(userId, apiKey);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error || 'Error guardando API key'
        });
      }

      res.json({
        success: true,
        data: {
          message: 'API key guardada exitosamente',
          models: validation.models
        }
      });

    } catch (error) {
      logger.error('Error guardando API key:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtiene la API key del usuario
   */
  static async getApiKey(req, res) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      const result = await GeminiService.getUserApiKey(userId);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          error: result.error || 'API key no encontrada'
        });
      }

      // Solo devolver si existe y es válida
      const validation = await GeminiService.validateApiKey(result.apiKey);

      res.json({
        success: true,
        data: {
          hasApiKey: !!result.apiKey,
          isValid: validation.isValid,
          models: validation.isValid ? validation.models : [],
          // Por seguridad, solo devolver los últimos 8 caracteres
          apiKeyPreview: result.apiKey ? `***${result.apiKey.slice(-8)}` : null
        }
      });

    } catch (error) {
      logger.error('Error obteniendo API key:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtiene los modelos disponibles para el usuario
   */
  static async getModels(req, res) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      // Obtener API key del usuario
      const apiKeyResult = await GeminiService.getUserApiKey(userId);

      if (!apiKeyResult.success) {
        return res.status(404).json({
          success: false,
          error: 'API key no configurada'
        });
      }

      // Validar y obtener modelos
      const validation = await GeminiService.validateApiKey(apiKeyResult.apiKey);

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'API key inválida o expirada'
        });
      }

      res.json({
        success: true,
        data: {
          models: validation.models
        }
      });

    } catch (error) {
      logger.error('Error obteniendo modelos:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}