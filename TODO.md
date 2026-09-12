# Plan de Tareas (TODO) - Proyecto rut.ar

Este plan estructura las tareas pendientes basándose en los requerimientos de la materia para alcanzar la **Aprobación Directa**, cruzando lo que ya se completó en el Backend.

## 1. Backend (Node.js v24 + Express + Sequelize)
### Completado ✅
- [x] Base de Datos y Docker: Modelos creados (`Usuario`, `Fletero`, `Negocio`, `Viaje`) y contenedor MySQL 8.0 en puerto `3307`.
- [x] CRUDs Principales: Controladores y rutas operativas para `Fletero`, `Negocio` y `Viaje`.
- [x] Seguridad: Autenticación JWT, hash de contraseñas (bcrypt) y Autorización por Roles (RBAC).
- [x] Configuración de Entornos: Desacople de infraestructura con `dotenv/config`, variables en `database.ts` y plantilla `.env.example`.
- [x] Infraestructura y Puertos: Sincronización oficial de puertos (Backend: `3333`, DB: `3307`, Frontend: `4200`) y suite `backend-e2e`.
- [x] Permisos RBAC y Telemetría Fletero: Implementación de `PATCH /api/fleteros/mi-ubicacion` y autorización en `PUT /api/viajes/:id` para transicionar estados propios.
- [x] Motor de Matching Canónico: Implementación de `matching.controller.ts` con cálculo geodésico Haversine.
- [x] Epic 1 (Matching inicial): `GET /api/negocios/:id/fleteros-disponibles` (filtrado por capacidad, descarte de viajes ocupados y orden geodésico).
- [x] Epic 1 (Asignación atómica): `POST /api/negocios/:id/asignar-fletero` (transacción Sequelize: Negocio -> 'asignado', creación de Viaje con `fechaFinEstimada`).
- [x] Epic 2 (Retorno Vacío - Core DSW): `GET /api/viajes/:id/negocios-retorno` (búsqueda de oportunidades abiertas cercanas al destino del viaje).

### Pendiente (Vinculado con GitHub Issues) ⏳

**1. Backend & Hardening:**
- [x] [#10](https://github.com/Gerster7/rut.ar/issues/10) - `[BE] feat(usuarios)`: Completar CRUD formal de `Usuario` para cátedra DSW (`GET /:id`, `PUT /:id`, `DELETE /:id`).
- [ ] [#11](https://github.com/Gerster7/rut.ar/issues/11) - `[BE] feat(validation)`: Validar entradas con `express-validator` en todos los controladores.
- [ ] [#12](https://github.com/Gerster7/rut.ar/issues/12) - `[BE] feat(logging)`: Integrar logger estructurado `pino` y middleware `pino-http` en `main.ts`.

**2. Testing Automático (Backend):**
- [x] [#13](https://github.com/Gerster7/rut.ar/issues/13) - `[BE-TEST] test(geo)`: Suite de pruebas unitarias para cálculo Haversine con Jest (`calcularDistanciaHaversine`).
- [ ] [#14](https://github.com/Gerster7/rut.ar/issues/14) - `[BE-TEST] test(auth)`: Prueba de integración con Supertest sobre Auth y RBAC (`POST /api/usuarios/login`).

---

## 2. Frontend (Angular v22 Standalone)
### Completado ✅
- [x] Inicialización del proyecto (`frontend` en Nx monorepo con Angular v22 Standalone).
- [x] Configuración de proxy reverso en `frontend/proxy.conf.json` apuntando a `http://localhost:3333`.

### Pendiente (Vinculado con GitHub Issues) ⏳
**1. Configuración Core & Auth:**
- [ ] [#15](https://github.com/Gerster7/rut.ar/issues/15) - `[FE] feat(core)`: Setup de Angular 22, `provideHttpClient(withInterceptors([...]))` y diseño base responsive.
- [ ] [#16](https://github.com/Gerster7/rut.ar/issues/16) - `[FE] feat(auth)`: Módulo de autenticación (`AuthService`, `LoginComponent`, `RegisterComponent`, `AuthGuard`, `AuthInterceptor`).

**2. Vistas y Mapas:**
- [ ] [#17](https://github.com/Gerster7/rut.ar/issues/17) - `[FE] feat(negocios)`: Vistas de listado con filtros (`NegociosList`) y formulario de alta de negocios.
- [ ] [#18](https://github.com/Gerster7/rut.ar/issues/18) - `[FE] feat(map)`: Componente de mapa interactivo con Leaflet.js y OpenStreetMap (`MapComponent`).
- [ ] [#19](https://github.com/Gerster7/rut.ar/issues/19) - `[FE] feat(matching)`: Detalle de negocio y flujo de búsqueda y asignación de fleteros (Epic 1 UI).
- [ ] [#20](https://github.com/Gerster7/rut.ar/issues/20) - `[FE] feat(viajes)`: Vistas de listado (`ViajesList`) y detalle (`ViajeDetail`) de viajes.
- [ ] [#21](https://github.com/Gerster7/rut.ar/issues/21) - `[FE] feat(retorno-vacio)`: Vista de sugerencias de cargas de retorno para fleteros en tránsito (Epic 2 UI).

**3. Testing Frontend:**
- [ ] [#22](https://github.com/Gerster7/rut.ar/issues/22) - `[FE-TEST] test(components)`: Prueba unitaria de componente Angular con Vitest.
- [ ] [#23](https://github.com/Gerster7/rut.ar/issues/23) - `[FE-TEST] test(e2e)`: Suite de pruebas End-to-End con Playwright (`frontend-e2e`).

---

## 3. Entregas y Gestión de Proyecto (Requisitos de Cátedra) 📦
- [ ] [#24](https://github.com/Gerster7/rut.ar/issues/24) - `[DEVOPS] ci`: Pipeline de GitHub Actions para linter, tests y build + Despliegue en la nube (Backend + Frontend).
- [x] **GitHub Projects (Tablero Kanban):**
  - [x] Crear el proyecto en GitHub vinculando los issues #10 al #24 en columnas `Todo`, `In Progress`, `Done` ([rut.ar - Tareas](https://github.com/users/Gerster7/projects/3)).
  - [ ] Registrar evidencias para la cátedra DSW.
