/**
 * Configuración centralizada de URLs y constantes de API
 */

// URL base del backend
export const API_CONFIG = {
  // Desarrollo
  BACKEND_URL_DEV: 'http://localhost:3000',
  BACKEND_URL_DEV_ALT: 'http://192.168.100.222:3000',
  
  // Producción
  BACKEND_URL_PROD: 'https://api.vikdev.dev',
  
  // URL actual (usa variable de entorno o fallback a desarrollo)
  BASE_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
  
  // Puertos comunes
  PORTS: {
    FRONTEND_DEV: 5173,
    FRONTEND_DEV_ALT: 5174,
    FRONTEND_DEV_ALT2: 5175,
    BACKEND_DEV: 3000,
    BACKEND_FALLBACK: 3001
  },
  
  // Timeouts
  TIMEOUTS: {
    REQUEST: 30000,
    TOAST: 3000,
    DEBOUNCE_SAVE: 30000
  },
  
  // Headers comunes
  HEADERS: {
    CONTENT_TYPE: 'application/json',
    AUTHORIZATION: (token: string) => `Bearer ${token}`
  }
} as const;

// Función helper para obtener la URL completa del endpoint
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BASE_URL.endsWith('/') 
    ? API_CONFIG.BASE_URL.slice(0, -1) 
    : API_CONFIG.BASE_URL;
  
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${baseUrl}${cleanEndpoint}`;
};

// Endpoints específicos
export const API_ENDPOINTS = {
  GENERATE_CONTENT: '/api/generate-content',
  GENERATE_CONTENT_HISTORY: '/api/generate-content-based-on-history',
  UPLOAD_FILES: '/api/upload_files',
  HEALTH: '/health'
} as const;