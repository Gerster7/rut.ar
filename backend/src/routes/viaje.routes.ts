import { Router } from 'express';
import { getViajes, getViajeById, createViaje, updateViaje, deleteViaje } from '../controllers/viaje.controller';
import { getNegociosRetorno } from '../controllers/matching.controller';
import { verifyToken, checkRole } from '../middlewares/auth.middleware';

const router = Router();

// Crear un viaje (asignar fletero a negocio) requiere ser LOGISTICO o ADMINISTRADOR
router.get('/', verifyToken, getViajes);
router.get('/:id', verifyToken, getViajeById);
router.post('/', verifyToken, checkRole(['LOGISTICO', 'ADMINISTRADOR']), createViaje);
router.put('/:id', verifyToken, checkRole(['FLETERO', 'LOGISTICO', 'ADMINISTRADOR']), updateViaje);
router.delete('/:id', verifyToken, checkRole(['LOGISTICO', 'ADMINISTRADOR']), deleteViaje);

// Epic 2: Retorno Vacío (oportunidades de carga cercanas al destino del viaje)
router.get('/:id/negocios-retorno', verifyToken, checkRole(['FLETERO', 'LOGISTICO', 'ADMINISTRADOR']), getNegociosRetorno);

export default router;

