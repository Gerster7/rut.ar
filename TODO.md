# Plan de Tareas (TODO) - Proyecto rut.ar

Este plan estructura las tareas pendientes basándose en los requerimientos de la materia para alcanzar la **Aprobación Directa**, cruzando lo que ya se completó en el Backend.

## 1. Backend (Node.js + Express + Sequelize)
### Completado ✅
- [x] Base de Datos y Docker: Modelos creados (`Usuario`, `Fletero`, `Negocio`, `Viaje`).
- [x] CRUDs Completos: Controladores y rutas para todas las entidades (requisito de Aprobación Directa).
- [x] Seguridad: Autenticación JWT, hash de contraseñas (bcrypt) y Autorización por Roles (RBAC).
- [x] Configuración de Entornos (`.env`).

### Pendiente (Tests & Epics) ⏳
- [x] **Validación Manual:** Probar endpoints protegidos y flujos de login. *(Completado hoy)*

**Epics (Lógica de Matching):**
- [ ] Crear archivo `matching.controller.ts`.
- [ ] Implementar función utilitaria (Haversine) para calcular distancias entre coordenadas.
- [ ] Implementar endpoint `GET /api/matching/fleteros` (Buscar fleteros disponibles según ubicación de un negocio).
- [ ] Implementar endpoint `POST /api/matching/asignar` (Cambiar estado del Negocio y generar un Viaje con el Fletero).
- [ ] Crear archivo `matching.routes.ts` e importarlo en `main.ts`.

**Testing Automático (Backend):**
- [ ] Configurar entorno de testing (Jest o similar si Nx no lo dejó listo).
- [ ] Escribir 1 Test Unitario (ej: validar la función de cálculo de distancia).
- [ ] Escribir 1 Test de Integración (ej: probar el endpoint de Login o Creación de Usuario).

---

## 2. Frontend (Angular v21)
### Completado ✅
- [x] Inicialización del proyecto (`frontend` en Nx workspace).

### Pendiente (Tareas Granulares) ⏳
**1. Configuración Core:**
- [ ] Instalar UI Library (Material, PrimeNG o Tailwind).
- [ ] Configurar NgRx SignalStore (setup inicial).
- [ ] Instalar Leaflet.js y configurar los estilos base del mapa en `styles.css`.

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

**5. Flujo de Matching (Epic):**
- [ ] Crear componente reutilizable de Mapa (`MapComponent`) con Leaflet.
- [ ] Integrar `MapComponent` en la vista de detalle de Negocio.
- [ ] Crear botón y lógica en UI para "Buscar Fleteros Cercanos".
- [ ] Mostrar fleteros candidatos en el mapa con marcadores.
- [ ] Agregar botón y flujo para "Confirmar Asignación" desde la UI.

**6. Testing y UX:**
- [ ] Revisar diseño responsive (Mobile-first, SM, MD, LG).
- [ ] Escribir 1 Test Unitario para un Componente (ej: Login o Listado).
- [ ] Escribir 1 Test E2E para el flujo principal (Cypress o Playwright provisto por Nx).

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
