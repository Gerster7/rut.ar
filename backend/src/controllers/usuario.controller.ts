import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Usuario } from '../models';
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
