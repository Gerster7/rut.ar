import { body, param } from 'express-validator';
import { validateRequest } from '../middlewares/validation.middleware';

const ESTADOS_VIAJE = ['activo', 'asignado', 'en curso', 'finalizado', 'completado', 'cancelado'];

export const createViajeValidator = [
  body('negocioId')
    .notEmpty()
    .withMessage('El negocioId es requerido')
    .isInt({ gt: 0 })
    .withMessage('El negocioId debe ser un número entero positivo'),
  body('fleteroId')
    .notEmpty()
    .withMessage('El fleteroId es requerido')
    .isInt({ gt: 0 })
    .withMessage('El fleteroId debe ser un número entero positivo'),
  body('fechaInicio')
    .optional()
    .isISO8601()
    .withMessage('fechaInicio debe tener un formato ISO 8601 válido'),
  body('fechaFinEstimada')
    .notEmpty()
    .withMessage('fechaFinEstimada es obligatoria')
    .isISO8601()
    .withMessage('fechaFinEstimada debe tener un formato ISO 8601 válido'),
  body('pesoAsignado')
    .notEmpty()
    .withMessage('El pesoAsignado es requerido')
    .isFloat({ gt: 0 })
    .withMessage('El pesoAsignado debe ser un número mayor a 0 (kg)'),
  body('estado')
    .optional()
    .isIn(ESTADOS_VIAJE)
    .withMessage(`Estado de viaje inválido. Valores permitidos: ${ESTADOS_VIAJE.join(', ')}`),
  validateRequest,
];

export const updateViajeValidator = [
  param('id')
    .isInt({ gt: 0 })
    .withMessage('El ID debe ser un número entero positivo'),
  body('negocioId')
    .optional()
    .isInt({ gt: 0 })
    .withMessage('El negocioId debe ser un número entero positivo'),
  body('fleteroId')
    .optional()
    .isInt({ gt: 0 })
    .withMessage('El fleteroId debe ser un número entero positivo'),
  body('fechaInicio')
    .optional()
    .isISO8601()
    .withMessage('fechaInicio debe tener un formato ISO 8601 válido'),
  body('fechaFinEstimada')
    .optional()
    .isISO8601()
    .withMessage('fechaFinEstimada debe tener un formato ISO 8601 válido'),
  body('pesoAsignado')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('El pesoAsignado debe ser un número mayor a 0 (kg)'),
  body('estado')
    .optional()
    .isIn(ESTADOS_VIAJE)
    .withMessage(`Estado de viaje inválido. Valores permitidos: ${ESTADOS_VIAJE.join(', ')}`),
  validateRequest,
];
