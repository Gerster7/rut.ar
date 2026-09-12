import { Router } from 'express';
import { 
  register, 
  login, 
  getUsuarios, 
  getUsuarioById, 
  updateUsuario, 
  deleteUsuario 
} from '../controllers/usuario.controller';
import { optionalAuth, verifyToken, checkRole } from '../middlewares/auth.middleware';

const router = Router();

// Rutas públicas / condicionales
router.post('/register', optionalAuth, register);
router.post('/login', login);

// Rutas protegidas
router.get('/', verifyToken, checkRole(['ADMINISTRADOR']), getUsuarios);
router.get('/:id', verifyToken, getUsuarioById);
router.put('/:id', verifyToken, updateUsuario);
router.delete('/:id', verifyToken, deleteUsuario);

export default router;

