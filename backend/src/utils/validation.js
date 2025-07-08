import Joi from 'joi';

// Esquemas de validación
export const schemas = {
  uploadFiles: Joi.object({
    prompt: Joi.string().min(1).max(10000).required(),
    tiempo_limite_segundos: Joi.number().integer().min(60).max(7200).required()
  }),

  generateContent: Joi.object({
    prompt: Joi.string().min(1).max(10000).required(),
    dificultad: Joi.string().valid('easy', 'medium', 'hard', 'mixed').required(),
    tiempo_limite_segundos: Joi.number().integer().min(60).max(7200).required(),
    exams_id: Joi.array().items(Joi.string().uuid()).optional(),
    materias_seleccionadas: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required()
    })).optional(),
    cantidad_preguntas: Joi.number().integer().min(1).max(100).optional(),
    instrucciones_adicionales: Joi.string().max(5000).allow('').optional()
  }),

  generateFeedback: Joi.object({
    examen_id: Joi.string().uuid().required()
  }),

  generateContentBasedOnHistory: Joi.object({
    exams_id: Joi.array().items(Joi.string().uuid()).min(1).required(),
    prompt: Joi.string().min(1).max(10000).required(),
    tiempo_limite_segundos: Joi.number().integer().min(60).max(7200).required()
  })
};

// Middleware para validar request body
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    next();
  };
};

// Validar parámetros de query
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        error: 'Parámetros de consulta inválidos',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    next();
  };
};

// Validar parámetros de ruta
export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params);
    
    if (error) {
      return res.status(400).json({
        error: 'Parámetros de ruta inválidos',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    next();
  };
};