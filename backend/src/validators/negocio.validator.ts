import { body, param } from 'express-validator';
import { validateRequest } from '../middlewares/validation.middleware';

const ESTADOS_NEGOCIO = ['abierto', 'asignado', 'en_proceso', 'completado', 'cancelado'];

export const createNegocioValidator = [
  body('usuarioId')
    .optional()
    .isInt({ gt: 0 })
    .withMessage('El usuarioId debe ser un número entero positivo'),
  body('descripcion')
    .trim()
    .notEmpty()
    .withMessage('La descripción es requerida'),
  body('tipoCarga')
    .trim()
    .notEmpty()
    .withMessage('El tipo de carga es requerido'),
  body('origenLat')
    .notEmpty()
    .withMessage('La latitud de origen es requerida')
    .isFloat({ min: -90, max: 90 })
    .withMessage('La latitud de origen debe estar entre -90 y 90'),
  body('origenLng')
    .notEmpty()
    .withMessage('La longitud de origen es requerida')
    .isFloat({ min: -180, max: 180 })
    .withMessage('La longitud de origen debe estar entre -180 y 180'),
  body('destinoLat')
    .notEmpty()
    .withMessage('La latitud de destino es requerida')
    .isFloat({ min: -90, max: 90 })
    .withMessage('La latitud de destino debe estar entre -90 y 90'),
  body('destinoLng')
    .notEmpty()
    .withMessage('La longitud de destino es requerida')
    .isFloat({ min: -180, max: 180 })
    .withMessage('La longitud de destino debe estar entre -180 y 180'),
  body('pesoTotal')
    .notEmpty()
    .withMessage('El peso total es requerido')
    .isFloat({ gt: 0 })
    .withMessage('El peso total debe ser un número mayor a 0 (kg)'),
  body('estado')
    .optional()
    .isIn(ESTADOS_NEGOCIO)
    .withMessage(`Estado inválido. Valores permitidos: ${ESTADOS_NEGOCIO.join(', ')}`),
  validateRequest,
];

export const updateNegocioValidator = [
  param('id')
    .isInt({ gt: 0 })
    .withMessage('El ID debe ser un número entero positivo'),
  body('usuarioId')
    .optional()
    .isInt({ gt: 0 })
    .withMessage('El usuarioId debe ser un número entero positivo'),
  body('descripcion')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La descripción no puede estar vacía'),
  body('tipoCarga')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El tipo de carga no puede estar vacío'),
  body('origenLat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('La latitud de origen debe estar entre -90 y 90'),
  body('origenLng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('La longitud de origen debe estar entre -180 y 180'),
  body('destinoLat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('La latitud de destino debe estar entre -90 y 90'),
  body('destinoLng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('La longitud de destino debe estar entre -180 y 180'),
  body('pesoTotal')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('El peso total debe ser mayor a 0 (kg)'),
  body('estado')
    .optional()
    .isIn(ESTADOS_NEGOCIO)
    .withMessage(`Estado inválido. Valores permitidos: ${ESTADOS_NEGOCIO.join(', ')}`),
  validateRequest,
];
