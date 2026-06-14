import { Request, Response } from 'express';
import { Viaje } from '../models';

export const getViajes = async (req: Request, res: Response): Promise<any> => {
  try {
    const viajes = await Viaje.findAll();
    res.json(viajes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener viajes' });
  }
};

export const getViajeById = async (req: Request, res: Response): Promise<any> => {
  try {
    const viaje = await Viaje.findByPk(req.params.id);
    if (!viaje) return res.status(404).json({ error: 'Viaje no encontrado' });
    res.json(viaje);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el viaje' });
  }
};

export const createViaje = async (req: Request, res: Response): Promise<any> => {
  try {
    const nuevoViaje = await Viaje.create(req.body);
    res.status(201).json(nuevoViaje);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el viaje', detalles: error });
  }
};

export const updateViaje = async (req: Request, res: Response): Promise<any> => {
  try {
    const viaje = await Viaje.findByPk(req.params.id);
    if (!viaje) return res.status(404).json({ error: 'Viaje no encontrado' });
    
    await viaje.update(req.body);
    res.json(viaje);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el viaje', detalles: error });
  }
};

export const deleteViaje = async (req: Request, res: Response): Promise<any> => {
  try {
    const viaje = await Viaje.findByPk(req.params.id);
    if (!viaje) return res.status(404).json({ error: 'Viaje no encontrado' });
    
    await viaje.destroy();
    res.json({ message: 'Viaje eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el viaje' });
  }
};
