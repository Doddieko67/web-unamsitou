import dotenv from 'dotenv';
import { jest, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

// Cargar variables de entorno para tests
dotenv.config({ path: '.env.test' });

// Hacer jest disponible globalmente
global.jest = jest;

// Mock de console para tests más limpios
global.console = {
  ...console,
  // Uncomment para silenciar logs en tests
  // log: jest.fn(),
  // error: jest.fn(),
  // warn: jest.fn(),
  // info: jest.fn(),
  // debug: jest.fn(),
};

// Setup global para tests
beforeAll(() => {
  // Configuraciones globales antes de todos los tests
});

afterAll(() => {
  // Limpieza después de todos los tests
});

beforeEach(() => {
  // Reset antes de cada test
  jest.clearAllMocks();
});

afterEach(() => {
  // Limpieza después de cada test
});