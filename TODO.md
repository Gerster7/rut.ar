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

### Pendiente (Tests & Deuda Técnica) ⏳
**Deuda Técnica y Hardening:**
- [ ] Completar CRUD formal de `Usuario` para cátedra DSW (`GET /api/usuarios/:id`, `PUT /api/usuarios/:id`, `DELETE /api/usuarios/:id`).
- [ ] Validar entradas con `express-validator` en los controladores (reemplazar asignaciones directas de `req.body`).
- [ ] Integrar logger estructurado `pino` y middleware `pino-http` en `main.ts`.

**Testing Automático (Backend):**
- [ ] Escribir 1 Test Unitario con Jest para la función de cálculo de distancia Haversine (`calcularDistanciaHaversine`).
- [ ] Escribir 1 Test de Integración con Supertest sobre el endpoint de autenticación (`POST /api/usuarios/login`).
- [ ] Eliminar `"passWithNoTests": true` de `backend/project.json` tras incorporar los tests activos.

---

## 2. Frontend (Angular v22 Standalone)
### Completado ✅
- [x] Inicialización del proyecto (`frontend` en Nx monorepo con Angular v22 Standalone).
- [x] Configuración de proxy reverso en `frontend/proxy.conf.json` apuntando a `http://localhost:3333`.

### Pendiente (Tareas Granulares) ⏳
**1. Configuración Core:**
- [ ] Configurar `provideHttpClient(withInterceptors([...]))` en `frontend/src/app/app.config.ts`.
- [ ] Instalar UI Library (Tailwind, Material o PrimeNG).
- [ ] Configurar NgRx SignalStore (setup inicial).
- [ ] Instalar Leaflet.js y configurar los estilos base del mapa en `styles.scss`.

**2. Autenticación (Auth):**
- [ ] Crear `AuthService` para peticiones HTTP de login/registro.
- [ ] Crear componente UI de `Login`.
- [ ] Crear `AuthGuard` para proteger las rutas privadas.
- [ ] Crear `AuthInterceptor` para inyectar automáticamente el JWT en las cabeceras HTTP.

**3. Vistas - Negocios:**
- [ ] Crear `NegocioService` para peticiones al backend.
- [ ] Crear componente `NegociosList` (Grilla/Tabla de negocios).
- [ ] Agregar filtros de búsqueda en `NegociosList`.
- [ ] Crear componente `NegocioDetail` para ver la vista detallada al hacer click.

**4. Vistas - Viajes:**
- [ ] Crear `ViajeService` para peticiones HTTP.
- [ ] Crear componente `ViajesList` (Grilla de viajes activos/históricos).
- [ ] Crear componente `ViajeDetail`.

**5. Flujo de Matching (Epic UI):**
- [ ] Crear componente reutilizable de Mapa (`MapComponent`) con Leaflet.
- [ ] Integrar `MapComponent` en la vista de detalle de Negocio.
- [ ] Crear botón y lógica en UI para "Buscar Fleteros Cercanos".
- [ ] Mostrar fleteros candidatos en el mapa con marcadores.
- [ ] Agregar botón y flujo para "Confirmar Asignación" desde la UI.
- [ ] Flujo de búsqueda de retorno vacío para fleteros con viaje activo.

**6. Testing y UX:**
- [ ] Revisar diseño responsive (Mobile-first, SM, MD, LG).
- [ ] Escribir 1 Test Unitario para un Componente con Vitest (ej: Login o Listado).
- [ ] Escribir 1 Test E2E para el flujo principal con Playwright (`frontend-e2e`).

---

## 3. Entregas y Gestión de Proyecto (Requisitos de Cátedra) 📦
*Se dejan aquí registrados para no olvidarlos de cara a las revisiones y entregas finales.*

- [ ] **GitHub Projects (Metodología Ágil):** 
  - [ ] Volcar estas tareas en un tablero (Kanban/Scrum) en la pestaña "Projects" de GitHub.
  - [ ] Generar evidencias de asignación de tareas, minutas o progreso.
- [ ] **Gestión de Repositorio:**
  - [ ] Trabajar con Ramas/Branches y hacer Pull Requests (la cátedra exige links a los PRs en la `proposal.md`).
- [ ] **Deploy y CI/CD (GitHub Actions):**
  - [ ] Implementar un pipeline básico (GitHub Actions) que corra los tests (para generar la "evidencia" exigida por la cátedra).
  - [ ] Desplegar el Backend (ej: Render, Railway).
  - [ ] Desplegar el Frontend (ej: Vercel, Netlify).
