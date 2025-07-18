import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import examRoutes from "./routes/examRoutes.js";
import geminiRoutes from "./routes/geminiRoutes.js";
import { 
  securityHeaders, 
  generalLimiter, 
  requestLogger, 
  errorHandler 
} from "./middleware/security.js";
import logger from "./utils/logger.js";

dotenv.config();

const app = express();

// Configurar trust proxy según documentación express-rate-limit
app.set('trust proxy', 1);

// Middleware de seguridad
app.use(securityHeaders);
app.use(generalLimiter);
app.use(requestLogger);

// Middleware básico
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configurar CORS
export const allowedOrigins = [
  "http://localhost:5173", // Desarrollo frontend
  "http://localhost:5174", // Desarrollo frontend (puerto alternativo)
  "http://localhost:5175", // Desarrollo frontend (puerto alternativo 2)
  "http://localhost:3000", // Frontend fallback
  "http://192.168.100.222:5173", // Desarrollo en red local
  "https://vikdev.dev", // Frontend en producción
  "https://www.vikdev.dev", // Frontend en producción con www
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir requests sin origin (como Postman, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Verificar si el origin está en la lista de permitidos
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'content-type', 'authorization']
};

app.use(cors(corsOptions));

// Rutas
app.use('/api', examRoutes);
app.use('/api/gemini', geminiRoutes);

// Ruta de salud
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Reacti Backend API',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Debug endpoints disabled for production security
// app.get('/debug-ip', ...);
// app.post('/debug-auth', ...);
// app.post('/test-cors', ...);

// Manejo de rutas no encontradas (debe ir antes del error handler)
app.use('/*catchAll', (req, res) => {
  logger.warn(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.originalUrl,
    method: req.method
  });
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

export default app;