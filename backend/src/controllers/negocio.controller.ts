import { Request, Response } from 'express';
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

export const createNegocio = async (req: Request, res: Response): Promise<any> => {
  try {
    const nuevoNegocio = await Negocio.create(req.body);
    res.status(201).json(nuevoNegocio);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el negocio', detalles: error });
  }
};

export const updateNegocio = async (req: Request, res: Response): Promise<any> => {
  try {
    const negocio = await Negocio.findByPk(req.params.id);
    if (!negocio) return res.status(404).json({ error: 'Negocio no encontrado' });
    
    await negocio.update(req.body);
    res.json(negocio);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el negocio', detalles: error });
  }
};

export const deleteNegocio = async (req: Request, res: Response): Promise<any> => {
  try {
    const negocio = await Negocio.findByPk(req.params.id);
    if (!negocio) return res.status(404).json({ error: 'Negocio no encontrado' });
    
    await negocio.destroy();
    res.json({ message: 'Negocio eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el negocio' });
  }
};
