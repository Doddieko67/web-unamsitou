import { supabase } from "../supabase.config.js";
import logger from "./utils/logger.js";

export const getUserFromRequest = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: "Token de autorización requerido",
        message: "Formato: Authorization: Bearer <token>" 
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ 
        error: "Token de autorización inválido" 
      });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      logger.warn('Token de autorización inválido o expirado', { 
        error: error?.message,
        ip: req.ip 
      });
      
      return res.status(401).json({ 
        error: "Token de autorización inválido o expirado" 
      });
    }

    // Agregar usuario a la request
    req.user = user;
    next();
  } catch (error) {
    logger.error('Error en middleware de autenticación:', {
      error: error.message,
      ip: req.ip
    });
    
    return res.status(500).json({ 
      error: "Error interno de autenticación" 
    });
  }
};
