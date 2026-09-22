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
import { 
  registerUsuarioValidator, 
  loginUsuarioValidator, 
  updateUsuarioValidator, 
  idParamValidator 
} from '../validators';

const router = Router();

// Rutas públicas / condicionales
router.post('/register', optionalAuth, registerUsuarioValidator, register);
router.post('/login', loginUsuarioValidator, login);

// Rutas protegidas
router.get('/', verifyToken, checkRole(['ADMINISTRADOR']), getUsuarios);
router.get('/:id', verifyToken, idParamValidator, getUsuarioById);
router.put('/:id', verifyToken, updateUsuarioValidator, updateUsuario);
router.delete('/:id', verifyToken, idParamValidator, deleteUsuario);

export default router;
