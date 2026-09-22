import { Router } from 'express';
import { 
  getViajes, 
  getViajeById, 
  createViaje, 
  updateViaje, 
  deleteViaje 
} from '../controllers/viaje.controller';
import { getNegociosRetorno } from '../controllers/matching.controller';
import { verifyToken, checkRole } from '../middlewares/auth.middleware';
import { 
  createViajeValidator, 
  updateViajeValidator, 
  idParamValidator, 
  getNegociosRetornoValidator 
} from '../validators';

const router = Router();

// Crear un viaje (asignar fletero a negocio) requiere ser LOGISTICO o ADMINISTRADOR
router.get('/', verifyToken, getViajes);
router.get('/:id', verifyToken, idParamValidator, getViajeById);
router.post('/', verifyToken, checkRole(['LOGISTICO', 'ADMINISTRADOR']), createViajeValidator, createViaje);
router.put('/:id', verifyToken, checkRole(['FLETERO', 'LOGISTICO', 'ADMINISTRADOR']), updateViajeValidator, updateViaje);
router.delete('/:id', verifyToken, checkRole(['LOGISTICO', 'ADMINISTRADOR']), idParamValidator, deleteViaje);

// Epic 2: Retorno Vacío (oportunidades de carga cercanas al destino del viaje)
router.get('/:id/negocios-retorno', verifyToken, checkRole(['FLETERO', 'LOGISTICO', 'ADMINISTRADOR']), getNegociosRetornoValidator, getNegociosRetorno);

export default router;
