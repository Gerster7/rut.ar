import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Middleware que intercepta los resultados de validación de express-validator.
 * Si existen errores de validación, responde inmediatamente con status 400 (Bad Request),
 * proveyendo un mensaje amigable en 'error' y la lista detallada de anomalías en 'errores'.
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorArray = errors.array();
    res.status(400).json({
      error: errorArray[0].msg,
      errores: errorArray,
    });
    return;
  }
  next();
};
