import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { validateRequest, schemas } from '../../src/utils/validation.js';

describe('Validation Utils', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('validateRequest', () => {
    describe('uploadFiles schema', () => {
      test('should pass validation with valid data', () => {
        req.body = {
          prompt: 'Test prompt',
          tiempo_limite_segundos: 300
        };

        const middleware = validateRequest(schemas.uploadFiles);
        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
      });

      test('should fail validation with missing prompt', () => {
        req.body = {
          tiempo_limite_segundos: 300
        };

        const middleware = validateRequest(schemas.uploadFiles);
        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: 'Datos de entrada inválidos',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'prompt',
              message: expect.stringContaining('required')
            })
          ])
        });
        expect(next).not.toHaveBeenCalled();
      });

      test('should fail validation with invalid tiempo_limite_segundos', () => {
        req.body = {
          prompt: 'Test prompt',
          tiempo_limite_segundos: 30 // Menor que el mínimo (60)
        };

        const middleware = validateRequest(schemas.uploadFiles);
        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: 'Datos de entrada inválidos',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'tiempo_limite_segundos',
              message: expect.stringContaining('must be greater than or equal to 60')
            })
          ])
        });
      });
    });

    describe('generateContent schema', () => {
      test('should pass validation with valid data', () => {
        req.body = {
          prompt: 'Test prompt',
          dificultad: 'easy',
          tiempo_limite_segundos: 300
        };

        const middleware = validateRequest(schemas.generateContent);
        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
      });

      test('should fail validation with invalid dificultad', () => {
        req.body = {
          prompt: 'Test prompt',
          dificultad: 'invalid',
          tiempo_limite_segundos: 300
        };

        const middleware = validateRequest(schemas.generateContent);
        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: 'Datos de entrada inválidos',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'dificultad',
              message: expect.stringContaining('must be one of')
            })
          ])
        });
      });
    });

    describe('generateFeedback schema', () => {
      test('should pass validation with valid UUID', () => {
        req.body = {
          examen_id: '123e4567-e89b-12d3-a456-426614174000'
        };

        const middleware = validateRequest(schemas.generateFeedback);
        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
      });

      test('should fail validation with invalid UUID', () => {
        req.body = {
          examen_id: 'not-a-uuid'
        };

        const middleware = validateRequest(schemas.generateFeedback);
        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: 'Datos de entrada inválidos',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'examen_id',
              message: expect.stringContaining('must be a valid GUID')
            })
          ])
        });
      });
    });
  });
});