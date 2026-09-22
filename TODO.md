# Plan de Tareas (TODO) — Proyecto rut.ar

> **Única Fuente de Verdad para Backlog y Tareas del Workspace**  
> Vinculado con el tablero Kanban oficial de [GitHub Projects](https://github.com/users/Gerster7/projects/3).

---

## 📋 Convención de Registro y Gobernanza de Tareas

Para garantizar la consistencia entre agentes de IA y desarrolladores, rigen las siguientes reglas estrictas de documentación y trazabilidad:

1. **Separación de Responsabilidades:**
   - **[`.agents/context.md`](./.agents/context.md):** Contexto técnico canónico puro y duro (dominio, modelo relacional, contratos de API, puertos, RBAC, algoritmos y pautas de ingeniería). **Prohibido incluir checklists de tareas, badges de pendientes o matrices de avance volátiles en dicho archivo.**
   - **[`TODO.md`](./TODO.md):** Única fuente de verdad local para el backlog del proyecto, tareas activas, estados de avance y vinculación con GitHub Issues.
   - **[`.agents/session-summary.md`](./.agents/session-summary.md):** Bitácora cronológica acumulativa que registra al término de cada sesión los objetivos, logros técnicos, evidencias de tests y próximos pasos.

2. **Nomenclatura Estandarizada de Issues y Tareas:**
   - `[BE] feat(...)` / `fix(...)`: Funcionalidades o correcciones de Backend.
   - `[BE-TEST] test(...)`: Suites de pruebas unitarias o de integración de Backend.
   - `[FE] feat(...)` / `fix(...)`: Componentes, vistas y lógica de Frontend.
   - `[FE-TEST] test(...)`: Pruebas unitarias (Vitest) o E2E (Playwright) de Frontend.
   - `[DEVOPS] ci(...)` / `deploy(...)`: Infraestructura, pipelines de CI/CD y despliegue.

3. **Ciclo de Cierre de una Tarea:**
   - Al completar la implementación y verificar las pruebas (`npx nx test`, `npx nx lint`, `npx nx build`):
     1. Marcar el checkbox correspondiente en este archivo (`[x]`).
     2. Redactar el commit en español con la directiva de GitHub: `tipo(scope): descripción (Closes #ID)`.
     3. Documentar en el resumen de sesión ([`.agents/session-summary.md`](./.agents/session-summary.md)) los cambios y las evidencias de validación.

---

## 1. Backend (Node.js v24 + Express + Sequelize)

### Completado ✅
- [x] **Base de Datos y Docker:** Modelos creados (`Usuario`, `Fletero`, `Negocio`, `Viaje`) y contenedor MySQL 8.0 en puerto `3307`.
- [x] **Seguridad & RBAC:** Autenticación JWT, hash de contraseñas con bcrypt (10 rounds) y control de roles (`ADMINISTRADOR`, `LOGISTICO`, `FLETERO`, `USUARIO`).
- [x] **Configuración de Entornos:** Desacople de infraestructura con `dotenv/config`, variables en `database.ts` y plantilla `.env.example`.
- [x] **Infraestructura y Puertos:** Estandarización oficial de puertos (Backend: `3333`, DB: `3307`, Frontend: `4200`) y suite `backend-e2e`.
- [x] **Telemetría y Control de Viajes:** `PATCH /api/fleteros/mi-ubicacion` y autorización en `PUT /api/viajes/:id` para transiciones de estado propias.
- [x] **CRUDs Completos del Dominio:**
  - `Usuario`: Registro público/admin, login, listado protegido, detalle, actualización y baja segura ([#10](https://github.com/Gerster7/rut.ar/issues/10)).
  - `Fletero`: Get all, Get by ID, Create, Update, Delete.
  - `Negocio`: Get all, Get by ID, Create, Update, Delete.
  - `Viaje`: Get all, Get by ID, Create, Update, Delete.
- [x] **Motor de Matching Canónico:**
  - Epic 1 (Matching inicial): `GET /api/negocios/:id/fleteros-disponibles` (filtro por peso/capacidad, descarte de fleteros ocupados y orden Haversine).
  - Epic 1 (Asignación atómica): `POST /api/negocios/:id/asignar-fletero` (transacción Sequelize atómica: Negocio -> 'asignado' y creación de Viaje).
  - Epic 2 (Retorno Vacío - Core DSW): `GET /api/viajes/:id/negocios-retorno` (búsqueda de oportunidades abiertas cercanas al destino de descarga).
- [x] **Validaciones y Hardening:** Validación y sanitización de esquemas de entrada con `express-validator` en todos los recursos ([#11](https://github.com/Gerster7/rut.ar/issues/11)).
- [x] **Testing Automatizado de Backend (Requisito Formal DSW):**
  - Unitario: Suite geodésica de fórmula Haversine con Jest ([#13](https://github.com/Gerster7/rut.ar/issues/13) - 9 tests en `matching.controller.spec.ts`).
  - Integración: Suite de Auth, RBAC y validaciones con Supertest ([#14](https://github.com/Gerster7/rut.ar/issues/14) - 27 tests en `auth.integration.spec.ts` y `validation.integration.spec.ts`).
  - Integración E2E: Suite base de backend con Axios (`backend-e2e`).

### Pendiente ⏳
- [ ] [#12](https://github.com/Gerster7/rut.ar/issues/12) - `[BE] feat(logging)`: Integrar logger estructurado `pino` y middleware `pino-http` en `main.ts`.

---

## 2. Frontend (Angular v22 Standalone)

### Completado ✅
- [x] **Scaffold del Proyecto:** Aplicación `frontend` en Nx monorepo con Angular v22 Standalone (Signals, `inject()`, sin `NgModule`).
- [x] **Configuración de Proxy:** Proxy reverso configurado en `frontend/proxy.conf.json` apuntando a `http://localhost:3333`.

### Pendiente ⏳
**1. Configuración Core & Auth:**
- [ ] [#15](https://github.com/Gerster7/rut.ar/issues/15) - `[FE] feat(core)`: Setup de Angular 22, `provideHttpClient(withInterceptors([...]))` y layout base responsive (breakpoints SM, MD, LG).
- [ ] [#16](https://github.com/Gerster7/rut.ar/issues/16) - `[FE] feat(auth)`: Módulo de autenticación (`AuthService`, `LoginComponent`, `RegisterComponent`, `AuthGuard`, `AuthInterceptor`).

**2. Vistas de Negocio y Mapas:**
- [ ] [#17](https://github.com/Gerster7/rut.ar/issues/17) - `[FE] feat(negocios)`: Vistas de listado con filtros (`NegociosList`) y formulario de alta de cargas/negocios.
- [ ] [#18](https://github.com/Gerster7/rut.ar/issues/18) - `[FE] feat(map)`: Componente de mapa interactivo con Leaflet.js y OpenStreetMap (`MapComponent`).
- [ ] [#19](https://github.com/Gerster7/rut.ar/issues/19) - `[FE] feat(matching)`: Detalle de negocio y flujo interactivo de búsqueda y asignación de fleteros (Epic 1 UI).
- [ ] [#20](https://github.com/Gerster7/rut.ar/issues/20) - `[FE] feat(viajes)`: Vistas de listado (`ViajesList`) y detalle (`ViajeDetail`) de viajes.
- [ ] [#21](https://github.com/Gerster7/rut.ar/issues/21) - `[FE] feat(retorno-vacio)`: Vista de sugerencias de cargas de retorno para fleteros en tránsito (Epic 2 UI).

**3. Testing Frontend:**
- [ ] [#22](https://github.com/Gerster7/rut.ar/issues/22) - `[FE-TEST] test(components)`: Prueba unitaria de componente Angular con Vitest.
- [ ] [#23](https://github.com/Gerster7/rut.ar/issues/23) - `[FE-TEST] test(e2e)`: Suite de pruebas End-to-End con Playwright (`frontend-e2e`).

---

## 3. DevOps, CI/CD y Entregas (Requisitos de Cátedra DSW) 📦

### Completado ✅
- [x] **Tablero Kanban:** Proyecto oficial en GitHub vinculando los issues #10 al #24 en columnas `Todo`, `In Progress`, `Done` ([rut.ar - Tareas](https://github.com/users/Gerster7/projects/3)).

### Pendiente ⏳
- [ ] [#24](https://github.com/Gerster7/rut.ar/issues/24) - `[DEVOPS] ci`: Pipeline de GitHub Actions para linter, tests y build + Despliegue en la nube (Backend + Frontend).
- [ ] **Documentación y Entrega DSW:** Registrar evidencias de ejecución de tests y video demostrativo para la cátedra.
