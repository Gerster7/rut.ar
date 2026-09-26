import { body, param } from 'express-validator';
import { validateRequest } from '../middlewares/validation.middleware';

const ROLES_VALIDOS = ['ADMINISTRADOR', 'LOGISTICO', 'FLETERO', 'USUARIO'];
const ROLES_REGISTRO = ROLES_VALIDOS;

export const registerUsuarioValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('El email provisto no es válido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isString()
    .withMessage('La contraseña debe ser una cadena de texto')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('rol')
    .optional()
    .customSanitizer((val) => (typeof val === 'string' ? val.toUpperCase() : val))
    .isIn(ROLES_REGISTRO)
    .withMessage(`Rol inválido. Roles permitidos: ${ROLES_VALIDOS.join(', ')}`),
  validateRequest,
];

export const loginUsuarioValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('El email provisto no es válido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isString()
    .withMessage('La contraseña debe ser una cadena de texto'),
  validateRequest,
];

export const updateUsuarioValidator = [
  param('id')
    .isInt({ gt: 0 })
    .withMessage('ID de usuario inválido'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('El email provisto no es válido')
    .normalizeEmail(),
  body('password')
    .optional()
    .isString()
    .withMessage('La contraseña debe ser una cadena de texto')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('rol')
    .optional()
    .customSanitizer((val) => (typeof val === 'string' ? val.toUpperCase() : val))
    .isIn(ROLES_VALIDOS)
    .withMessage(`Rol inválido. Roles permitidos: ${ROLES_VALIDOS.join(', ')}`),
  validateRequest,
];
