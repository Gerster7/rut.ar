import { body, param } from 'express-validator';
import { validateRequest } from '../middlewares/validation.middleware';

export const updateMiUbicacionValidator = [
  body('latitud')
    .exists({ checkFalsy: false })
    .withMessage('Latitud y longitud son requeridas')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Coordenadas geográficas inválidas (Latitud: -90 a 90)'),
  body('longitud')
    .exists({ checkFalsy: false })
    .withMessage('Latitud y longitud son requeridas')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Coordenadas geográficas inválidas (Longitud: -180 a 180)'),
  validateRequest,
];

export const createFleteroValidator = [
  body('usuarioId')
    .notEmpty()
    .withMessage('El usuarioId es requerido')
    .isInt({ gt: 0 })
    .withMessage('El usuarioId debe ser un número entero positivo'),
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido'),
  body('telefono')
    .trim()
    .notEmpty()
    .withMessage('El teléfono es requerido'),
  body('vehiculo')
    .trim()
    .notEmpty()
    .withMessage('El vehículo es requerido'),
  body('patenteVehiculo')
    .trim()
    .notEmpty()
    .withMessage('La patente del vehículo es requerida'),
  body('capacidadVehiculo')
    .notEmpty()
    .withMessage('La capacidad del vehículo es requerida')
    .isFloat({ gt: 0 })
    .withMessage('La capacidad del vehículo debe ser un número mayor a 0 (kg)'),
  body('latitudActual')
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitud actual inválida (-90 a 90)'),
  body('longitudActual')
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitud actual inválida (-180 a 180)'),
  validateRequest,
];

export const updateFleteroValidator = [
  param('id')
    .isInt({ gt: 0 })
    .withMessage('El ID debe ser un número entero positivo'),
  body('usuarioId')
    .optional()
    .isInt({ gt: 0 })
    .withMessage('El usuarioId debe ser un número entero positivo'),
  body('nombre')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío'),
  body('telefono')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El teléfono no puede estar vacío'),
  body('vehiculo')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El vehículo no puede estar vacío'),
  body('patenteVehiculo')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La patente no puede estar vacía'),
  body('capacidadVehiculo')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('La capacidad debe ser un número mayor a 0 (kg)'),
  body('latitudActual')
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitud actual inválida (-90 a 90)'),
  body('longitudActual')
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitud actual inválida (-180 a 180)'),
  validateRequest,
];
