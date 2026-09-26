import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Fletero } from '../models';

export const updateMiUbicacion = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { latitud, longitud } = req.body;

    if (latitud === undefined || longitud === undefined) {
      return res.status(400).json({ error: 'Latitud y longitud son requeridas' });
    }

    const lat = Number(latitud);
    const lon = Number(longitud);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({ error: 'Coordenadas geográficas inválidas (Latitud: -90 a 90, Longitud: -180 a 180)' });
    }

    const fletero = await Fletero.findOne({ where: { usuarioId: req.user!.id } });
    if (!fletero) {
      return res.status(404).json({ error: 'Perfil de fletero no encontrado para el usuario actual' });
    }

    await fletero.update({ latitudActual: lat, longitudActual: lon });
    res.json({
      message: 'Ubicación actualizada correctamente',
      latitudActual: lat,
      longitudActual: lon
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la ubicación del fletero' });
  }
};

export const getFleteros = async (req: Request, res: Response): Promise<any> => {
  try {
    const fleteros = await Fletero.findAll();
    res.json(fleteros);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener fleteros' });
  }
};

export const getFleteroById = async (req: Request, res: Response): Promise<any> => {
  try {
    const fletero = await Fletero.findByPk(req.params.id);
    if (!fletero) return res.status(404).json({ error: 'Fletero no encontrado' });
    res.json(fletero);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el fletero' });
  }
};

export const createFletero = async (req: Request, res: Response): Promise<any> => {
  try {
    const existingFletero = await Fletero.findOne({ where: { usuarioId: req.body.usuarioId } });
    if (existingFletero) {
      return res.status(400).json({ error: 'El usuario ya tiene un perfil de fletero registrado' });
    }
    const nuevoFletero = await Fletero.create(req.body);
    res.status(201).json(nuevoFletero);
  } catch (error: any) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'El usuarioId especificado no existe' });
    }
    res.status(500).json({ error: 'Error al crear el fletero', detalles: error });
  }
};

export const updateFletero = async (req: Request, res: Response): Promise<any> => {
  try {
    const fletero = await Fletero.findByPk(req.params.id);
    if (!fletero) return res.status(404).json({ error: 'Fletero no encontrado' });
    
    await fletero.update(req.body);
    res.json(fletero);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el fletero', detalles: error });
  }
};

export const deleteFletero = async (req: Request, res: Response): Promise<any> => {
  try {
    const fletero = await Fletero.findByPk(req.params.id);
    if (!fletero) return res.status(404).json({ error: 'Fletero no encontrado' });
    
    await fletero.destroy();
    res.json({ message: 'Fletero eliminado correctamente' });
  } catch (error: any) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'No se puede eliminar el fletero porque tiene viajes asociados' });
    }
    res.status(500).json({ error: 'Error al eliminar el fletero' });
  }
};
