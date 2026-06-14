import { Router } from 'express';
import { getNegocios, getNegocioById, createNegocio, updateNegocio, deleteNegocio } from '../controllers/negocio.controller';
import { verifyToken, checkRole } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', verifyToken, getNegocios);
router.get('/:id', verifyToken, getNegocioById);
router.post('/', verifyToken, checkRole(['LOGISTICO', 'ADMINISTRADOR']), createNegocio);
router.put('/:id', verifyToken, checkRole(['LOGISTICO', 'ADMINISTRADOR']), updateNegocio);
router.delete('/:id', verifyToken, checkRole(['LOGISTICO', 'ADMINISTRADOR']), deleteNegocio);

export default router;
