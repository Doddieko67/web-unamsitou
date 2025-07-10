import express from 'express';
import { ExamController } from '../controllers/examController.js';
import { getUserFromRequest } from '../reqAuthMiddleware.js';
import { get_ready } from '../local.js';
import { validateRequest } from '../utils/validation.js';
import { schemas } from '../utils/validation.js';
import { aiLimiter, uploadLimiter } from '../middleware/security.js';

const router = express.Router();

// Ruta para subir archivos y generar examen
router.post('/upload_files', 
  uploadLimiter,
  getUserFromRequest,
  get_ready,
  // Validación después de multer para archivos
  (req, res, next) => {
    // Validar que req.body tiene los campos necesarios después de multer
    if (!req.body || !req.body.prompt || !req.body.tiempo_limite_segundos) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: prompt, tiempo_limite_segundos'
      });
    }
    next();
  },
  ExamController.uploadFiles
);

// Ruta para generar contenido basado en prompt
router.post('/generate-content',
  getUserFromRequest,
  validateRequest(schemas.generateContent),
  ExamController.generateContent
);

// Ruta para generar feedback
router.post('/generate-feedback',
  aiLimiter,
  getUserFromRequest,
  validateRequest(schemas.generateFeedback),
  ExamController.generateFeedback
);

// Ruta para generar contenido basado en historial
router.post('/generate-content-based-on-history',
  aiLimiter,
  getUserFromRequest,
  validateRequest(schemas.generateContentBasedOnHistory),
  ExamController.generateContentBasedOnHistory
);

export default router;