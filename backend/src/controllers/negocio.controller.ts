import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Negocio } from '../models';

export const getNegocios = async (req: Request, res: Response): Promise<any> => {
  try {
    const negocios = await Negocio.findAll();
    res.json(negocios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener negocios' });
  }
};

export const getNegocioById = async (req: Request, res: Response): Promise<any> => {
  try {
    const negocio = await Negocio.findByPk(req.params.id);
    if (!negocio) return res.status(404).json({ error: 'Negocio no encontrado' });
    res.json(negocio);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el negocio' });
  }
};

export const createNegocio = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const esAdmin = req.user?.rol.toUpperCase() === 'ADMINISTRADOR';
    const usuarioId = (esAdmin && req.body.usuarioId)
      ? Number(req.body.usuarioId)
      : (req.user?.id || req.body.usuarioId);

    const nuevoNegocio = await Negocio.create({
      ...req.body,
      usuarioId
    });
    res.status(201).json(nuevoNegocio);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el negocio', detalles: error });
  }
};

export const updateNegocio = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const negocio = await Negocio.findByPk(req.params.id);
    if (!negocio) return res.status(404).json({ error: 'Negocio no encontrado' });

    const esAdmin = req.user?.rol.toUpperCase() === 'ADMINISTRADOR';
    const esAutor = req.user?.id === negocio.usuarioId;
    if (!esAdmin && !esAutor) {
      return res.status(403).json({ error: 'No tienes permisos para modificar este negocio' });
    }
    
    await negocio.update(req.body);
    res.json(negocio);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el negocio', detalles: error });
  }
};

export const deleteNegocio = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const negocio = await Negocio.findByPk(req.params.id);
    if (!negocio) return res.status(404).json({ error: 'Negocio no encontrado' });

    const esAdmin = req.user?.rol.toUpperCase() === 'ADMINISTRADOR';
    const esAutor = req.user?.id === negocio.usuarioId;
    if (!esAdmin && !esAutor) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar este negocio' });
    }
    
    await negocio.destroy();
    res.json({ message: 'Negocio eliminado correctamente' });
  } catch (error: any) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'No se puede eliminar el negocio porque tiene viajes asociados' });
    }
    res.status(500).json({ error: 'Error al eliminar el negocio' });
  }
};
