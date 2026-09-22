import { Router } from 'express';
import { 
  getFleteros, 
  getFleteroById, 
  createFletero, 
  updateFletero, 
  deleteFletero, 
  updateMiUbicacion 
} from '../controllers/fletero.controller';
import { verifyToken, checkRole } from '../middlewares/auth.middleware';
import { 
  updateMiUbicacionValidator, 
  createFleteroValidator, 
  updateFleteroValidator, 
  idParamValidator 
} from '../validators';

const router = Router();

// Endpoint específico para que el fletero actualice su geolocalización GPS
router.patch('/mi-ubicacion', verifyToken, checkRole(['FLETERO']), updateMiUbicacionValidator, updateMiUbicacion);

// Solo usuarios logueados pueden ver. Crear/Modificar/Borrar requiere ser LOGISTICO o ADMINISTRADOR
router.get('/', verifyToken, getFleteros);
router.get('/:id', verifyToken, idParamValidator, getFleteroById);
router.post('/', verifyToken, checkRole(['LOGISTICO', 'ADMINISTRADOR']), createFleteroValidator, createFletero);
router.put('/:id', verifyToken, checkRole(['LOGISTICO', 'ADMINISTRADOR']), updateFleteroValidator, updateFletero);
router.delete('/:id', verifyToken, checkRole(['LOGISTICO', 'ADMINISTRADOR']), idParamValidator, deleteFletero);

export default router;
