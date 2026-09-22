import { body, param, query } from 'express-validator';
import { validateRequest } from '../middlewares/validation.middleware';

export const getFleterosDisponiblesValidator = [
  param('id')
    .isInt({ gt: 0 })
    .withMessage('El ID de negocio debe ser un número entero positivo'),
  query('incluirEnTransito')
    .optional()
    .isBoolean()
    .withMessage('incluirEnTransito debe ser un valor booleano (true o false)'),
  query('radioDestinoKm')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('radioDestinoKm debe ser un número mayor a 0'),
  validateRequest,
];

export const asignarFleteroValidator = [
  param('id')
    .isInt({ gt: 0 })
    .withMessage('El ID de negocio debe ser un número entero positivo'),
  body('fleteroId')
    .notEmpty()
    .withMessage('El campo fleteroId es obligatorio')
    .isInt({ gt: 0 })
    .withMessage('El campo fleteroId debe ser un número entero positivo'),
  body('fechaFinEstimada')
    .optional()
    .isISO8601()
    .withMessage('fechaFinEstimada provista no es una fecha válida'),
  validateRequest,
];

export const getNegociosRetornoValidator = [
  param('id')
    .isInt({ gt: 0 })
    .withMessage('El ID de viaje debe ser un número entero positivo'),
  query('radioMaxKm')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('radioMaxKm debe ser un número mayor a 0'),
  validateRequest,
];
