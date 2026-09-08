import { Router } from 'express';
import { getFleteros, getFleteroById, createFletero, updateFletero, deleteFletero, updateMiUbicacion } from '../controllers/fletero.controller';
import { verifyToken, checkRole } from '../middlewares/auth.middleware';

const router = Router();

// Endpoint específico para que el fletero actualice su geolocalización GPS
router.patch('/mi-ubicacion', verifyToken, checkRole(['FLETERO']), updateMiUbicacion);

// Solo usuarios logueados pueden ver. Crear/Modificar/Borrar requiere ser LOGISTICO o ADMINISTRADOR
router.get('/', verifyToken, getFleteros);
router.get('/:id', verifyToken, getFleteroById);
router.post('/', verifyToken, checkRole(['LOGISTICO', 'ADMINISTRADOR']), createFletero);
router.put('/:id', verifyToken, checkRole(['LOGISTICO', 'ADMINISTRADOR']), updateFletero);
router.delete('/:id', verifyToken, checkRole(['LOGISTICO', 'ADMINISTRADOR']), deleteFletero);

export default router;
