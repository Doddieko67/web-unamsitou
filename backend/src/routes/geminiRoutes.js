import express from 'express';
import { getUserFromRequest } from '../reqAuthMiddleware.js';
import { GeminiController } from '../controllers/geminiController.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting para endpoints de Gemini
const geminiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10, // máximo 10 requests por minuto por IP
  message: {
    error: 'Demasiadas solicitudes, intenta de nuevo más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Aplicar autenticación a todas las rutas
router.use(getUserFromRequest);

// Ruta para validar API key y obtener modelos disponibles
router.post('/validate-api-key', geminiRateLimit, GeminiController.validateApiKey);

// Ruta para guardar API key del usuario
router.post('/save-api-key', geminiRateLimit, GeminiController.saveApiKey);

// Ruta para obtener API key del usuario
router.get('/get-api-key', geminiRateLimit, GeminiController.getApiKey);

// Ruta para obtener modelos disponibles (requiere API key válida)
router.get('/models', geminiRateLimit, GeminiController.getModels);

export default router;