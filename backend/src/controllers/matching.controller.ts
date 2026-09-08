import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { sequelize } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Negocio, Fletero, Viaje } from '../models';

/**
 * Calcula la distancia ortodrómica en kilómetros entre dos puntos geográficos
 * utilizando la fórmula de Haversine.
 */
export function calcularDistanciaHaversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (
    lat1 === null ||
    lat1 === undefined ||
    isNaN(lat1) ||
    lon1 === null ||
    lon1 === undefined ||
    isNaN(lon1) ||
    lat2 === null ||
    lat2 === undefined ||
    isNaN(lat2) ||
    lon2 === null ||
    lon2 === undefined ||
    isNaN(lon2)
  ) {
    throw new Error('Coordenadas geográficas inválidas para el cálculo de Haversine');
  }

  const R = 6371; // Radio medio de la Tierra en kilómetros
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c * 100) / 100; // Distancia en km redondeada a 2 decimales
}

/**
 * Epic 1: Busca fleteros disponibles para un negocio específico.
 * Filtra por capacidad de vehículo (capacidadVehiculo >= pesoTotal).
 * Retorna fleteros desocupados (disponibilidad inmediata) y, opcionalmente,
 * fleteros en tránsito próximos a completar su descarga (retorno anticipado).
 * Endpoint: GET /api/negocios/:id/fleteros-disponibles?incluirEnTransito=true&radioDestinoKm=50
 */
export const getFleterosDisponibles = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const negocioId = req.params.id;
    const incluirEnTransito = req.query.incluirEnTransito === 'true';
    const radioDestinoMaxKm = req.query.radioDestinoKm
      ? Number(req.query.radioDestinoKm)
      : 50;

    const negocio = await Negocio.findByPk(negocioId);

    if (!negocio) {
      return res.status(404).json({ error: 'Negocio no encontrado' });
    }

    if (negocio.origenLat == null || negocio.origenLng == null) {
      return res.status(400).json({
        error: 'El negocio no dispone de coordenadas de origen válidas para geolocalización'
      });
    }

    // 1. Identificar viajes activos o en curso
    const viajesActivos = await Viaje.findAll({
      where: {
        estado: {
          [Op.in]: ['asignado', 'activo', 'en curso']
        }
      },
      include: [Negocio, Fletero]
    });

    const fleterosOcupadosIds = Array.from(
      new Set(viajesActivos.map((v) => v.fleteroId))
    );

    // 2. Buscar fleteros con capacidad suficiente, ubicación registrada y sin viajes en curso
    const fleterosLibres = await Fletero.findAll({
      where: {
        capacidadVehiculo: {
          [Op.gte]: negocio.pesoTotal
        },
        latitudActual: {
          [Op.ne]: null
        },
        longitudActual: {
          [Op.ne]: null
        },
        ...(fleterosOcupadosIds.length > 0
          ? { id: { [Op.notIn]: fleterosOcupadosIds } }
          : {})
      }
    });

    // 3. Mapear fleteros libres con disponibilidad inmediata
    const resultados: any[] = fleterosLibres.map((fletero) => {
      const distanciaKm = calcularDistanciaHaversine(
        fletero.latitudActual,
        fletero.longitudActual,
        negocio.origenLat,
        negocio.origenLng
      );

      return {
        ...fletero.toJSON(),
        disponibilidad: 'inmediata',
        distanciaKm
      };
    });

    // 4. Si se solicita incluirEnTransito, evaluar fleteros en viaje próximos a destino
    if (incluirEnTransito) {
      for (const viaje of viajesActivos) {
        const fletero = viaje.fletero || (await Fletero.findByPk(viaje.fleteroId));
        const negocioViaje =
          viaje.negocio || (await Negocio.findByPk(viaje.negocioId));

        if (
          !fletero ||
          !negocioViaje ||
          fletero.latitudActual == null ||
          fletero.longitudActual == null
        ) {
          continue;
        }

        if (fletero.capacidadVehiculo < negocio.pesoTotal) {
          continue;
        }

        if (negocioViaje.destinoLat == null || negocioViaje.destinoLng == null) {
          continue;
        }

        // Distancia restante para que el fletero complete su viaje actual
        const distanciaRestanteDestinoKm = calcularDistanciaHaversine(
          fletero.latitudActual,
          fletero.longitudActual,
          negocioViaje.destinoLat,
          negocioViaje.destinoLng
        );

        if (distanciaRestanteDestinoKm <= radioDestinoMaxKm) {
          // Distancia desde el punto de descarga hacia el origen del nuevo negocio
          const distanciaAlNuevoOrigenKm = calcularDistanciaHaversine(
            negocioViaje.destinoLat,
            negocioViaje.destinoLng,
            negocio.origenLat,
            negocio.origenLng
          );

          resultados.push({
            ...fletero.toJSON(),
            disponibilidad: 'proximo_a_destino',
            distanciaKm: distanciaAlNuevoOrigenKm,
            viajeActual: {
              viajeId: viaje.id,
              distanciaRestanteDestinoKm,
              destinoDescargaLat: negocioViaje.destinoLat,
              destinoDescargaLng: negocioViaje.destinoLng,
              fechaFinEstimada: viaje.fechaFinEstimada
            }
          });
        }
      }
    }

    // 5. Ordenar ascendentemente por cercanía geográfica
    resultados.sort((a, b) => a.distanciaKm - b.distanciaKm);

    return res.json(resultados);
  } catch (error) {
    return res.status(500).json({
      error: 'Error al buscar fleteros disponibles',
      detalles: error
    });
  }
};

/**
 * Epic 1: Asignación atómica de fletero a un negocio.
 * Actualiza el negocio a 'asignado' y crea un registro de Viaje dentro de una transacción Sequelize.
 * Endpoint: POST /api/negocios/:id/asignar-fletero
 */
export const asignarFletero = async (
  req: Request,
  res: Response
): Promise<any> => {
  const t = await sequelize.transaction();

  try {
    const negocioId = req.params.id;
    const { fleteroId, fechaFinEstimada } = req.body;

    if (!fleteroId) {
      await t.rollback();
      return res.status(400).json({ error: 'El campo fleteroId es obligatorio' });
    }

    const negocio = await Negocio.findByPk(negocioId, { transaction: t });
    if (!negocio) {
      await t.rollback();
      return res.status(404).json({ error: 'Negocio no encontrado' });
    }

    if (negocio.estado !== 'abierto') {
      await t.rollback();
      return res.status(400).json({
        error: `El negocio no está disponible para asignación (estado actual: ${negocio.estado})`
      });
    }

    const fletero = await Fletero.findByPk(fleteroId, { transaction: t });
    if (!fletero) {
      await t.rollback();
      return res.status(404).json({ error: 'Fletero no encontrado' });
    }

    if (fletero.capacidadVehiculo < negocio.pesoTotal) {
      await t.rollback();
      return res.status(400).json({
        error: `Capacidad vehicular insuficiente (${fletero.capacidadVehiculo} kg vs ${negocio.pesoTotal} kg requeridos)`
      });
    }

    // Verificar que el fletero no tenga un viaje activo concurrente
    const viajeExistente = await Viaje.findOne({
      where: {
        fleteroId: fletero.id,
        estado: {
          [Op.in]: ['asignado', 'activo', 'en curso']
        }
      },
      transaction: t
    });

    if (viajeExistente) {
      await t.rollback();
      return res.status(400).json({
        error: 'El fletero ya tiene un viaje asignado o en curso'
      });
    }

    // Determinar fechaFinEstimada (si no fue provista, se proyecta según distancia del negocio)
    let fechaFin: Date;
    if (fechaFinEstimada) {
      fechaFin = new Date(fechaFinEstimada);
      if (isNaN(fechaFin.getTime())) {
        await t.rollback();
        return res.status(400).json({ error: 'fechaFinEstimada provista no es una fecha válida' });
      }
    } else {
      const distanciaRutaKm = calcularDistanciaHaversine(
        negocio.origenLat,
        negocio.origenLng,
        negocio.destinoLat,
        negocio.destinoLng
      );
      // Promedio 60 km/h + 2 horas de margen operativo
      const horasEstimadas = Math.max(2, Math.ceil(distanciaRutaKm / 60) + 2);
      fechaFin = new Date(Date.now() + horasEstimadas * 3600 * 1000);
    }

    // 1. Transicionar negocio a 'asignado'
    await negocio.update({ estado: 'asignado' }, { transaction: t });

    // 2. Crear registro canónico de Viaje
    const nuevoViaje = await Viaje.create(
      {
        negocioId: negocio.id,
        fleteroId: fletero.id,
        fechaInicio: new Date(),
        fechaFinEstimada: fechaFin,
        estado: 'asignado',
        pesoAsignado: negocio.pesoTotal
      },
      { transaction: t }
    );

    await t.commit();

    return res.status(201).json({
      mensaje: 'Fletero asignado exitosamente y viaje creado',
      viaje: nuevoViaje,
      negocio
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({
      error: 'Error al asignar el fletero al negocio',
      detalles: error
    });
  }
};

/**
 * Epic 2: Retorno Vacío (Core DSW).
 * Para un viaje en curso, busca negocios con estado 'abierto' cercanos a la zona
 * de descarga del viaje actual, minimizando el kilometraje en vacío del fletero.
 * Endpoint: GET /api/viajes/:id/negocios-retorno
 */
export const getNegociosRetorno = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const viajeId = req.params.id;

    const viaje = await Viaje.findByPk(viajeId, {
      include: [Negocio, Fletero]
    });

    if (!viaje) {
      return res.status(404).json({ error: 'Viaje no encontrado' });
    }

    // Control de acceso para rol FLETERO: solo puede consultar retornos de su propio viaje
    if (req.user?.rol === 'FLETERO') {
      const fletero = await Fletero.findOne({ where: { usuarioId: req.user.id } });
      if (!fletero || viaje.fleteroId !== fletero.id) {
        return res.status(403).json({
          error: 'No tienes permisos para consultar retornos de este viaje'
        });
      }
    }

    // Carga defensiva en caso de que las asociaciones no vengan cargadas por lazy loading
    const negocioOrigen = viaje.negocio || (await Negocio.findByPk(viaje.negocioId));
    const fleteroAsignado = viaje.fletero || (await Fletero.findByPk(viaje.fleteroId));

    if (!negocioOrigen) {
      return res.status(400).json({ error: 'El viaje no cuenta con un negocio asociado válido' });
    }

    const { destinoLat, destinoLng } = negocioOrigen;
    if (destinoLat == null || destinoLng == null) {
      return res.status(400).json({
        error: 'El negocio asociado no posee coordenadas de destino válidas'
      });
    }

    const capacidadMaxima = fleteroAsignado
      ? fleteroAsignado.capacidadVehiculo
      : viaje.pesoAsignado;

    // Buscar oportunidades abiertas de carga que soporten la capacidad del fletero
    const negociosAbiertos = await Negocio.findAll({
      where: {
        id: { [Op.ne]: viaje.negocioId },
        estado: 'abierto',
        pesoTotal: { [Op.lte]: capacidadMaxima }
      }
    });

    // Calcular la distancia desde el punto de descarga actual al punto de carga de cada negocio
    const retornosConDistancia = negociosAbiertos
      .filter((n) => n.origenLat != null && n.origenLng != null)
      .map((n) => {
        const distanciaRetornoKm = calcularDistanciaHaversine(
          destinoLat,
          destinoLng,
          n.origenLat,
          n.origenLng
        );

        return {
          ...n.toJSON(),
          distanciaRetornoKm
        };
      });

    // Ordenar por menor desvío geográfico
    retornosConDistancia.sort((a, b) => a.distanciaRetornoKm - b.distanciaRetornoKm);

    return res.json(retornosConDistancia);
  } catch (error) {
    return res.status(500).json({
      error: 'Error al buscar oportunidades de negocio de retorno',
      detalles: error
    });
  }
};
