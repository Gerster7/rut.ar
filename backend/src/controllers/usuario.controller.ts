import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { Usuario, Fletero } from '../models';
import { AuthRequest } from '../middlewares/auth.middleware';

const SECRET_KEY = process.env.JWT_SECRET || 'super_secret_key_123';

export const register = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { email, password, rol } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password son requeridos' });
    }
    const requestedRol = (rol || 'USUARIO').toUpperCase();
    if (requestedRol === 'LOGISTICO' || requestedRol === 'ADMINISTRADOR') {
      if (!req.user || req.user.rol.toUpperCase() !== 'ADMINISTRADOR') {
        return res.status(403).json({ error: `Solo un ADMINISTRADOR puede registrar usuarios con rol ${requestedRol}` });
      }
    }
    const existingUser = await Usuario.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevoUsuario = await Usuario.create({
      email,
      password: hashedPassword,
      rol: requestedRol
    });
    res.status(201).json({ 
      message: 'Usuario creado con éxito', 
      usuario: { id: nuevoUsuario.id, email: nuevoUsuario.email, rol: nuevoUsuario.rol } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario', detalles: error });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const isValidPassword = await bcrypt.compare(password, usuario.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol }, 
      SECRET_KEY, 
      { expiresIn: '24h' }
    );

    res.json({ 
      message: 'Login exitoso', 
      token, 
      usuario: { id: usuario.id, email: usuario.email, rol: usuario.rol } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión', detalles: error });
  }
};

export const getUsuarios = async (req: Request, res: Response): Promise<any> => {
  try {
    const usuarios = await Usuario.findAll({ 
      attributes: { exclude: ['password'] } 
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

export const getUsuarioById = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    const esAdmin = req.user?.rol.toUpperCase() === 'ADMINISTRADOR';
    const esMismoUsuario = req.user?.id === id;

    if (!esAdmin && !esMismoUsuario) {
      return res.status(403).json({ error: 'No tienes permisos para ver este usuario' });
    }

    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: Fletero, required: false }
      ]
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el usuario', detalles: error });
  }
};

export const updateUsuario = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    const esAdmin = req.user?.rol.toUpperCase() === 'ADMINISTRADOR';
    const esMismoUsuario = req.user?.id === id;

    if (!esAdmin && !esMismoUsuario) {
      return res.status(403).json({ error: 'No tienes permisos para modificar este usuario' });
    }

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { email, password, rol } = req.body;

    // Validación de unicidad de email si se intenta cambiar
    if (email && email !== usuario.email) {
      const existingEmail = await Usuario.findOne({
        where: {
          email,
          id: { [Op.ne]: id }
        }
      });
      if (existingEmail) {
        return res.status(400).json({ error: 'El email ya está en uso por otro usuario' });
      }
      usuario.email = email;
    }

    // Hasheo de contraseña si se provee una nueva
    if (password) {
      if (typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      }
      usuario.password = await bcrypt.hash(password, 10);
    }

    // Modificación de rol (restringida a administradores)
    if (rol) {
      const nuevoRol = rol.toUpperCase();
      const rolesValidos = ['ADMINISTRADOR', 'LOGISTICO', 'FLETERO', 'USUARIO'];
      if (!rolesValidos.includes(nuevoRol)) {
        return res.status(400).json({ error: `Rol inválido. Roles permitidos: ${rolesValidos.join(', ')}` });
      }
      if (!esAdmin && nuevoRol !== usuario.rol) {
        return res.status(403).json({ error: 'Solo un ADMINISTRADOR puede modificar el rol de un usuario' });
      }
      usuario.rol = nuevoRol;
    }

    await usuario.save();

    res.json({
      message: 'Usuario actualizado con éxito',
      usuario: {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        updatedAt: usuario.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el usuario', detalles: error });
  }
};

export const deleteUsuario = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    const esAdmin = req.user?.rol.toUpperCase() === 'ADMINISTRADOR';
    const esMismoUsuario = req.user?.id === id;

    if (!esAdmin && !esMismoUsuario) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar este usuario' });
    }

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await usuario.destroy();

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error: any) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        error: 'No se puede eliminar el usuario porque tiene registros asociados dependientes (fletero o negocios)'
      });
    }
    res.status(500).json({ error: 'Error al eliminar el usuario', detalles: error });
  }
};

