import { param } from 'express-validator';
import { validateRequest } from '../middlewares/validation.middleware';

/**
 * Validador para rutas con parámetro :id numérico (entero positivo)
 */
export const idParamValidator = [
  param('id')
    .isInt({ gt: 0 })
    .withMessage('El ID debe ser un número entero positivo'),
  validateRequest,
];
