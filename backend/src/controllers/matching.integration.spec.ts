import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../app';
import { sequelize } from '../config/database';
import { Negocio, Fletero, Viaje } from '../models';

const SECRET_KEY = process.env.JWT_SECRET || 'super_secret_key_123';

const adminToken = jwt.sign(
  { id: 1, email: 'admin@rutar.com', rol: 'ADMINISTRADOR' },
  SECRET_KEY,
  { expiresIn: '1h' }
);

const logisticoToken = jwt.sign(
  { id: 2, email: 'logistico1@rutar.com', rol: 'LOGISTICO' },
  SECRET_KEY,
  { expiresIn: '1h' }
);

describe('Suite de Integración - Motor de Matching y Retorno Vacío (Epics 1 y 2)', () => {
  let testNegocio: Negocio;
  let testFletero: Fletero;
  let testViajeAsignado: Viaje | null = null;

  beforeAll(async () => {
    await sequelize.authenticate();

    // 1. Obtener o crear un fletero libre con coordenadas y capacidad para pruebas
    const [fletero] = await Fletero.findOrCreate({
      where: { patenteVehiculo: 'TEST-MATCH-999' },
      defaults: {
        usuarioId: 1,
        nombre: 'Fletero Matching Test',
        telefono: '11223344',
        vehiculo: 'Camión Mediano',
        patenteVehiculo: 'TEST-MATCH-999',
        capacidadVehiculo: 3000,
        latitudActual: -34.6037, // Buenos Aires
        longitudActual: -58.3816,
      },
    });
    testFletero = fletero;

    // Asegurar que las coordenadas del fletero estén activas
    await testFletero.update({
      latitudActual: -34.6037,
      longitudActual: -58.3816,
      capacidadVehiculo: 3000,
    });

    // 2. Crear negocio de prueba abierto en Rosario
    testNegocio = await Negocio.create({
      usuarioId: 1,
      descripcion: 'Carga de prueba para matching',
      tipoCarga: 'Industrial',
      estado: 'abierto',
      origenLat: -32.9468, // Rosario
      origenLng: -60.6393,
      destinoLat: -31.4201, // Córdoba
      destinoLng: -64.1888,
      pesoTotal: 1500,
    });
  });

  afterAll(async () => {
    if (testViajeAsignado) {
      await testViajeAsignado.destroy();
    }
    if (testNegocio) {
      await testNegocio.destroy();
    }
    if (testFletero) {
      await testFletero.destroy();
    }
    await sequelize.close();
  });

  describe('Epic 1: Búsqueda de Fleteros Disponibles (GET /api/negocios/:id/fleteros-disponibles)', () => {
    it('debe listar fleteros disponibles ordenados por proximidad geográfica Haversine', async () => {
      const response = await request(app)
        .get(`/api/negocios/${testNegocio.id}/fleteros-disponibles`)
        .set('Authorization', `Bearer ${logisticoToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      if (response.body.length > 0) {
        // Verificar estructura del primer fletero sugerido
        const primerCandidato = response.body[0];
        expect(primerCandidato).toHaveProperty('id');
        expect(primerCandidato).toHaveProperty('nombre');
        expect(primerCandidato).toHaveProperty('distanciaKm');
        expect(primerCandidato).toHaveProperty('disponibilidad');
        expect(primerCandidato.capacidadVehiculo).toBeGreaterThanOrEqual(testNegocio.pesoTotal);

        // Verificar orden ascendente por distancia geodésica
        for (let i = 1; i < response.body.length; i++) {
          expect(response.body[i].distanciaKm).toBeGreaterThanOrEqual(
            response.body[i - 1].distanciaKm
          );
        }
      }
    });

    it('debe rechazar la búsqueda si el negocio no existe (404 Not Found)', async () => {
      const response = await request(app)
        .get('/api/negocios/999999/fleteros-disponibles')
        .set('Authorization', `Bearer ${logisticoToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Negocio no encontrado');
    });
  });

  describe('Epic 1: Asignación Atómica de Fletero (POST /api/negocios/:id/asignar-fletero)', () => {
    it('debe asignar el fletero, transicionar el negocio a "asignado" y crear el viaje atómicamente', async () => {
      const response = await request(app)
        .post(`/api/negocios/${testNegocio.id}/asignar-fletero`)
        .set('Authorization', `Bearer ${logisticoToken}`)
        .send({
          fleteroId: testFletero.id,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('mensaje', 'Fletero asignado exitosamente y viaje creado');
      expect(response.body).toHaveProperty('viaje');
      expect(response.body).toHaveProperty('negocio');

      testViajeAsignado = await Viaje.findByPk(response.body.viaje.id);
      expect(testViajeAsignado).not.toBeNull();
      expect(testViajeAsignado!.estado).toBe('asignado');
      expect(testViajeAsignado!.fleteroId).toBe(testFletero.id);
      expect(testViajeAsignado!.fechaFinEstimada).toBeDefined();

      // Verificar que el negocio en la base de datos pasó a 'asignado'
      const negocioActualizado = await Negocio.findByPk(testNegocio.id);
      expect(negocioActualizado!.estado).toBe('asignado');
    });

    it('debe rechazar una re-asignación si el negocio ya fue asignado previamente (400 Bad Request)', async () => {
      const response = await request(app)
        .post(`/api/negocios/${testNegocio.id}/asignar-fletero`)
        .set('Authorization', `Bearer ${logisticoToken}`)
        .send({
          fleteroId: testFletero.id,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('El negocio no está disponible para asignación');
    });
  });

  describe('Epic 2: Sugerencia de Negocios de Retorno Vacío (GET /api/viajes/:id/negocios-retorno)', () => {
    it('debe sugerir oportunidades de carga abiertas ordenadas por cercanía al punto de descarga', async () => {
      expect(testViajeAsignado).not.toBeNull();

      const response = await request(app)
        .get(`/api/viajes/${testViajeAsignado!.id}/negocios-retorno`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      if (response.body.length > 0) {
        const retorno = response.body[0];
        expect(retorno).toHaveProperty('distanciaRetornoKm');
        expect(retorno.estado).toBe('abierto');
        expect(retorno.pesoTotal).toBeLessThanOrEqual(testFletero.capacidadVehiculo);
      }
    });

    it('debe rechazar la consulta de retorno para un viaje inexistente (404 Not Found)', async () => {
      const response = await request(app)
        .get('/api/viajes/999999/negocios-retorno')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Viaje no encontrado');
    });
  });
});
