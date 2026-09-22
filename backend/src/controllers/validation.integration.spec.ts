import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../app';
import { sequelize } from '../config/database';

const SECRET_KEY = process.env.JWT_SECRET || 'super_secret_key_123';

const adminToken = jwt.sign(
  { id: 1, email: 'admin@rutar.com', rol: 'ADMINISTRADOR' },
  SECRET_KEY,
  { expiresIn: '1h' }
);

const fleteroToken = jwt.sign(
  { id: 2, email: 'fletero1@rutar.com', rol: 'FLETERO' },
  SECRET_KEY,
  { expiresIn: '1h' }
);

const logisticoToken = jwt.sign(
  { id: 3, email: 'logistico1@rutar.com', rol: 'LOGISTICO' },
  SECRET_KEY,
  { expiresIn: '1h' }
);

describe('Suite de Integración - Validaciones con express-validator', () => {
  beforeAll(async () => {
    await sequelize.authenticate();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Validaciones de Usuarios (/api/usuarios)', () => {
    it('debe rechazar login con formato de email inválido (400 Bad Request)', async () => {
      const response = await request(app)
        .post('/api/usuarios/login')
        .send({
          email: 'email-invalido-sin-formato',
          password: 'PasswordValido123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('El email provisto no es válido');
      expect(response.body).toHaveProperty('errores');
      expect(Array.isArray(response.body.errores)).toBe(true);
    });

    it('debe rechazar login si la contraseña está vacía (400 Bad Request)', async () => {
      const response = await request(app)
        .post('/api/usuarios/login')
        .send({
          email: 'admin@rutar.com',
          password: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('La contraseña es requerida');
    });

    it('debe rechazar registro si la contraseña tiene menos de 6 caracteres (400 Bad Request)', async () => {
      const response = await request(app)
        .post('/api/usuarios/register')
        .send({
          email: 'nuevo-val@rutar.com',
          password: '123',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('La contraseña debe tener al menos 6 caracteres');
    });

    it('debe rechazar registro con un rol inválido que no pertenezca al catálogo (400 Bad Request)', async () => {
      const response = await request(app)
        .post('/api/usuarios/register')
        .send({
          email: 'nuevo-val@rutar.com',
          password: 'PasswordValido123',
          rol: 'ROL_INEXISTENTE',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Rol inválido');
    });

    it('debe rechazar consulta de usuario con parámetro :id no numérico (400 Bad Request)', async () => {
      const response = await request(app)
        .get('/api/usuarios/no-es-un-numero')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('El ID debe ser un número entero positivo');
    });
  });

  describe('Validaciones de Fleteros (/api/fleteros)', () => {
    it('debe rechazar actualización de ubicación GPS con latitud fuera de rango [-90, 90] (400 Bad Request)', async () => {
      const response = await request(app)
        .patch('/api/fleteros/mi-ubicacion')
        .set('Authorization', `Bearer ${fleteroToken}`)
        .send({
          latitud: 120.5,
          longitud: -58.38,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Coordenadas geográficas inválidas');
    });

    it('debe rechazar actualización de ubicación GPS si faltan latitud o longitud (400 Bad Request)', async () => {
      const response = await request(app)
        .patch('/api/fleteros/mi-ubicacion')
        .set('Authorization', `Bearer ${fleteroToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Latitud y longitud son requeridas');
    });

    it('debe rechazar creación de fletero si falta la capacidad o es <= 0 (400 Bad Request)', async () => {
      const response = await request(app)
        .post('/api/fleteros')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          usuarioId: 1,
          nombre: 'Fletero Prueba',
          telefono: '12345678',
          vehiculo: 'Furgón',
          patenteVehiculo: 'AA111BB',
          capacidadVehiculo: -500,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('La capacidad del vehículo debe ser un número mayor a 0');
    });
  });

  describe('Validaciones de Negocios (/api/negocios)', () => {
    it('debe rechazar creación de negocio con coordenadas geográficas fuera de rango (400 Bad Request)', async () => {
      const response = await request(app)
        .post('/api/negocios')
        .set('Authorization', `Bearer ${logisticoToken}`)
        .send({
          usuarioId: 1,
          descripcion: 'Carga de prueba',
          tipoCarga: 'Granel',
          origenLat: -95.0, // Inválida (< -90)
          origenLng: -58.0,
          destinoLat: -31.0,
          destinoLng: -64.0,
          pesoTotal: 1000,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('La latitud de origen debe estar entre -90 y 90');
    });

    it('debe rechazar creación de negocio con pesoTotal <= 0 (400 Bad Request)', async () => {
      const response = await request(app)
        .post('/api/negocios')
        .set('Authorization', `Bearer ${logisticoToken}`)
        .send({
          usuarioId: 1,
          descripcion: 'Carga de prueba',
          tipoCarga: 'Granel',
          origenLat: -34.6,
          origenLng: -58.3,
          destinoLat: -31.4,
          destinoLng: -64.1,
          pesoTotal: 0, // Inválido (debe ser > 0)
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('El peso total debe ser un número mayor a 0');
    });

    it('debe rechazar consulta de negocio con :id negativo o no entero (400 Bad Request)', async () => {
      const response = await request(app)
        .get('/api/negocios/invalido')
        .set('Authorization', `Bearer ${logisticoToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('El ID debe ser un número entero positivo');
    });
  });

  describe('Validaciones de Matching y Retorno Vacío', () => {
    it('debe rechazar búsqueda de fleteros con query param incluirEnTransito no booleano (400 Bad Request)', async () => {
      const response = await request(app)
        .get('/api/negocios/1/fleteros-disponibles?incluirEnTransito=invalido')
        .set('Authorization', `Bearer ${logisticoToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('incluirEnTransito debe ser un valor booleano');
    });

    it('debe rechazar asignación atómica sin fleteroId o con fleteroId inválido (400 Bad Request)', async () => {
      const response = await request(app)
        .post('/api/negocios/1/asignar-fletero')
        .set('Authorization', `Bearer ${logisticoToken}`)
        .send({
          fleteroId: -1,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('El campo fleteroId debe ser un número entero positivo');
    });

    it('debe rechazar asignación con fechaFinEstimada en formato incorrecto (400 Bad Request)', async () => {
      const response = await request(app)
        .post('/api/negocios/1/asignar-fletero')
        .set('Authorization', `Bearer ${logisticoToken}`)
        .send({
          fleteroId: 1,
          fechaFinEstimada: 'fecha-invalida-no-iso',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('fechaFinEstimada provista no es una fecha válida');
    });

    it('debe rechazar búsqueda de retorno vacío con radioMaxKm no numérico (400 Bad Request)', async () => {
      const response = await request(app)
        .get('/api/viajes/1/negocios-retorno?radioMaxKm=-20')
        .set('Authorization', `Bearer ${fleteroToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('radioMaxKm debe ser un número mayor a 0');
    });
  });

  describe('Validaciones de Viajes (/api/viajes)', () => {
    it('debe rechazar creación de viaje si falta fechaFinEstimada (400 Bad Request)', async () => {
      const response = await request(app)
        .post('/api/viajes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          negocioId: 1,
          fleteroId: 1,
          pesoAsignado: 500,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('fechaFinEstimada es obligatoria');
    });

    it('debe rechazar creación de viaje con estado fuera del catálogo (400 Bad Request)', async () => {
      const response = await request(app)
        .post('/api/viajes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          negocioId: 1,
          fleteroId: 1,
          fechaFinEstimada: '2026-10-01T12:00:00.000Z',
          pesoAsignado: 500,
          estado: 'ESTADO_INVENTADO',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Estado de viaje inválido');
    });
  });
});
