import { Router } from 'express';
import { 
  getNegocios, 
  getNegocioById, 
  createNegocio, 
  updateNegocio, 
  deleteNegocio 
} from '../controllers/negocio.controller';
import { 
  getFleterosDisponibles, 
  asignarFletero 
} from '../controllers/matching.controller';
import { verifyToken, checkRole } from '../middlewares/auth.middleware';
import { 
  createNegocioValidator, 
  updateNegocioValidator, 
  idParamValidator, 
  getFleterosDisponiblesValidator, 
  asignarFleteroValidator 
} from '../validators';

const router = Router();

router.get('/', verifyToken, getNegocios);
router.get('/:id', verifyToken, idParamValidator, getNegocioById);
router.post('/', verifyToken, checkRole(['LOGISTICO', 'ADMINISTRADOR']), createNegocioValidator, createNegocio);
router.put('/:id', verifyToken, checkRole(['LOGISTICO', 'ADMINISTRADOR']), updateNegocioValidator, updateNegocio);
router.delete('/:id', verifyToken, checkRole(['LOGISTICO', 'ADMINISTRADOR']), idParamValidator, deleteNegocio);

// Epic 1: Búsqueda de fleteros disponibles y asignación atómica
router.get('/:id/fleteros-disponibles', verifyToken, checkRole(['LOGISTICO', 'ADMINISTRADOR']), getFleterosDisponiblesValidator, getFleterosDisponibles);
router.post('/:id/asignar-fletero', verifyToken, checkRole(['LOGISTICO', 'ADMINISTRADOR']), asignarFleteroValidator, asignarFletero);

export default router;
