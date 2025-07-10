import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import logger from '../utils/logger.js';

// Rate limiting configuration optimizada para Cloudflare Tunnel 2025
export const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
      retryAfter: windowMs / 1000
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Cloudflare Tunnel: CF-Connecting-IP es la IP real del cliente
    keyGenerator: (req) => {
      // Prioridad: CF-Connecting-IP > X-Forwarded-For > req.ip
      const cfIP = req.headers['cf-connecting-ip'];
      if (cfIP) return cfIP;
      
      const forwardedFor = req.headers['x-forwarded-for'];
      if (forwardedFor) return forwardedFor.split(',')[0].trim();
      
      return req.ip || req.socket.remoteAddress;
    },
    handler: (req, res) => {
      const realIP = req.headers['cf-connecting-ip'] || 
                    req.headers['x-forwarded-for']?.split(',')[0] || 
                    req.ip;
      
      logger.warn(`Rate limit exceeded for IP: ${realIP}`, {
        realIP,
        cfConnectingIP: req.headers['cf-connecting-ip'],
        xForwardedFor: req.headers['x-forwarded-for'],
        reqIP: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl
      });
      
      res.status(429).json({
        error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
        retryAfter: Math.round(windowMs / 1000)
      });
    }
  });
};

// Rate limiters específicos para diferentes endpoints
export const generalLimiter = createRateLimiter(15 * 60 * 1000, 100); // 100 requests per 15 minutes
export const aiLimiter = createRateLimiter(60 * 1000, 10); // 10 requests per minute for AI endpoints
export const uploadLimiter = createRateLimiter(60 * 1000, 5); // 5 uploads per minute

// Helmet configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Middleware para log de requests
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log del inicio de la request
  logger.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  // Capturar el final de la response
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode}`, {
      ip: req.ip,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Middleware para manejo de errores
export const errorHandler = (err, req, res, next) => {
  logger.error('Error no manejado:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  // No revelar información sensible en producción
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  } else {
    res.status(500).json({
      error: err.message,
      stack: err.stack
    });
  }
};