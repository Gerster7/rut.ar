import { Request, Response } from 'express';
import { Fletero } from '../models';

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
    const nuevoFletero = await Fletero.create(req.body);
    res.status(201).json(nuevoFletero);
  } catch (error) {
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
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el fletero' });
  }
};
