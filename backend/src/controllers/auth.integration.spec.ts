import request from 'supertest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { app } from '../app';
import { sequelize } from '../config/database';
import { Usuario } from '../models';

describe('Suite de Integración - Autenticación y RBAC (/api/usuarios)', () => {
  const TEST_EMAIL_NUEVO = 'test-nuevo-integracion@rutar.com';

  beforeAll(async () => {
    await sequelize.authenticate();

    // Asegurar que los usuarios de prueba existan independientemente del estado previo de la BD
    const passwordHash = await bcrypt.hash('Prueba123', 10);

    await Usuario.findOrCreate({
      where: { email: 'admin@rutar.com' },
      defaults: {
        email: 'admin@rutar.com',
        password: passwordHash,
        rol: 'ADMINISTRADOR',
      },
    });

    await Usuario.findOrCreate({
      where: { email: 'fletero1@rutar.com' },
      defaults: {
        email: 'fletero1@rutar.com',
        password: passwordHash,
        rol: 'FLETERO',
      },
    });

    // Limpieza preventiva de usuarios temporales
    await Usuario.destroy({ where: { email: TEST_EMAIL_NUEVO } });
  });

  afterAll(async () => {
    // Limpieza de datos creados en las pruebas
    await Usuario.destroy({ where: { email: TEST_EMAIL_NUEVO } });
    await sequelize.close();
  });

  describe('POST /api/usuarios/login', () => {
    it('debe autenticar exitosamente con credenciales válidas y retornar JWT con datos del usuario (200 OK)', async () => {
      const response = await request(app)
        .post('/api/usuarios/login')
        .send({
          email: 'admin@rutar.com',
          password: 'Prueba123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Login exitoso');
      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');
      expect(response.body).toHaveProperty('usuario');
      expect(response.body.usuario).toMatchObject({
        email: 'admin@rutar.com',
        rol: 'ADMINISTRADOR',
      });
      expect(response.body.usuario.id).toBeDefined();

      // Verificar que el JWT contiene los claims esperados
      const decoded = jwt.decode(response.body.token) as {
        id: number;
        email: string;
        rol: string;
        exp: number;
      };
      expect(decoded).toBeDefined();
      expect(decoded.email).toBe('admin@rutar.com');
      expect(decoded.rol).toBe('ADMINISTRADOR');
      expect(decoded.id).toBe(response.body.usuario.id);
      expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });

    it('debe rechazar el inicio de sesión si el usuario no existe (404 Not Found)', async () => {
      const response = await request(app)
        .post('/api/usuarios/login')
        .send({
          email: 'no_existe_usuario_aleatorio@rutar.com',
          password: 'PasswordInexistente123',
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Usuario no encontrado');
      expect(response.body.token).toBeUndefined();
    });

    it('debe rechazar el inicio de sesión si la contraseña es incorrecta (401 Unauthorized)', async () => {
      const response = await request(app)
        .post('/api/usuarios/login')
        .send({
          email: 'admin@rutar.com',
          password: 'PasswordIncorrecto999!',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Contraseña incorrecta');
      expect(response.body.token).toBeUndefined();
    });
  });

  describe('Control de Acceso y RBAC (GET /api/usuarios)', () => {
    it('debe rechazar la petición sin token de autenticación (401 Unauthorized)', async () => {
      const response = await request(app).get('/api/usuarios');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        'error',
        'Acceso denegado, token no proporcionado'
      );
    });

    it('debe rechazar la petición con un token JWT inválido o corrupto (401 Unauthorized)', async () => {
      const response = await request(app)
        .get('/api/usuarios')
        .set('Authorization', 'Bearer token_invalido_o_corrupto_123');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Token inválido o expirado');
    });

    it('debe denegar el acceso a usuarios con rol insuficiente (403 Forbidden)', async () => {
      // 1. Obtener token con rol FLETERO
      const loginFletero = await request(app)
        .post('/api/usuarios/login')
        .send({
          email: 'fletero1@rutar.com',
          password: 'Prueba123',
        });

      expect(loginFletero.status).toBe(200);
      const fleteroToken = loginFletero.body.token;

      // 2. Intentar consultar endpoint exclusivo de ADMINISTRADOR
      const response = await request(app)
        .get('/api/usuarios')
        .set('Authorization', `Bearer ${fleteroToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('No tienes los permisos necesarios');
      expect(response.body.error).toContain('ADMINISTRADOR');
    });

    it('debe permitir acceso con rol ADMINISTRADOR y excluir las contraseñas del listado (200 OK)', async () => {
      // 1. Obtener token con rol ADMINISTRADOR
      const loginAdmin = await request(app)
        .post('/api/usuarios/login')
        .send({
          email: 'admin@rutar.com',
          password: 'Prueba123',
        });

      expect(loginAdmin.status).toBe(200);
      const adminToken = loginAdmin.body.token;

      // 2. Consultar listado de usuarios
      const response = await request(app)
        .get('/api/usuarios')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // 3. Verificar que ninguna entidad expone el hash de contraseña
      response.body.forEach((user: { password?: string; email: string; rol: string }) => {
        expect(user.password).toBeUndefined();
        expect(user.email).toBeDefined();
        expect(user.rol).toBeDefined();
      });
    });
  });

  describe('Registro de Usuarios (POST /api/usuarios/register)', () => {
    it('debe permitir el registro público de un nuevo usuario con rol por defecto USUARIO (201 Created)', async () => {
      const response = await request(app)
        .post('/api/usuarios/register')
        .send({
          email: TEST_EMAIL_NUEVO,
          password: 'PasswordSeguro123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Usuario creado con éxito');
      expect(response.body.usuario).toMatchObject({
        email: TEST_EMAIL_NUEVO,
        rol: 'USUARIO',
      });
    });

    it('debe rechazar el registro con email ya existente (400 Bad Request)', async () => {
      const response = await request(app)
        .post('/api/usuarios/register')
        .send({
          email: 'admin@rutar.com',
          password: 'PasswordSeguro123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'El email ya está registrado');
    });

    it('debe rechazar la creación de rol privilegiado (LOGISTICO o ADMINISTRADOR) sin token de admin (403 Forbidden)', async () => {
      const response = await request(app)
        .post('/api/usuarios/register')
        .send({
          email: 'intento_privilegiado@rutar.com',
          password: 'PasswordSeguro123',
          rol: 'ADMINISTRADOR',
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain(
        'Solo un ADMINISTRADOR puede registrar usuarios con rol ADMINISTRADOR'
      );
    });
  });
});
