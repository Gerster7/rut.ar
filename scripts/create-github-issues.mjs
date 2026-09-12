#!/usr/bin/env node

/**
 * Script para crear automáticamente los Issues atómicos en GitHub para rut.ar (Gerster7/rut.ar)
 * 
 * Uso:
 *   GITHUB_TOKEN=tu_personal_access_token node scripts/create-github-issues.mjs
 * 
 * Opcional:
 *   REPO_OWNER=Gerster7 REPO_NAME=rut.ar GITHUB_TOKEN=... node scripts/create-github-issues.mjs
 */

const REPO_OWNER = process.env.REPO_OWNER || 'Gerster7';
const REPO_NAME = process.env.REPO_NAME || 'rut.ar';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('\x1b[31mError: Variable de entorno GITHUB_TOKEN no encontrada.\x1b[0m\n');
  console.log('Para ejecutar este script, genera un Personal Access Token (classic o fine-grained con permisos de "Issues: Read & Write") en:');
  console.log('👉 https://github.com/settings/tokens\n');
  console.log('Y luego ejecuta:');
  console.log('  \x1b[36mGITHUB_TOKEN="ghp_xxxx" node scripts/create-github-issues.mjs\x1b[0m\n');
  process.exit(1);
}

const issues = [
  {
    title: '[BE] feat(usuarios): completar CRUD formal de Usuario (GET, PUT, DELETE /:id)',
    labels: ['backend', 'dsw-core', 'enhancement'],
    body: `## Descripción
Para cumplir con los requerimientos académicos estrictos de la cátedra DSW (CRUD simple de Usuario), se deben implementar los endpoints faltantes para la gestión individual de usuarios.

## Tareas
- [ ] Implementar \`GET /api/usuarios/:id\` para consultar detalle de un usuario (excluyendo password).
- [ ] Implementar \`PUT /api/usuarios/:id\` para actualizar datos de perfil/email/rol.
- [ ] Implementar \`DELETE /api/usuarios/:id\` para dar de baja una cuenta.
- [ ] Configurar middlewares \`verifyToken\` y \`checkRole\` garantizando que un usuario solo modifique su propia cuenta o que sea \`ADMINISTRADOR\`.

## Criterios de Aceptación
- Un \`ADMINISTRADOR\` puede consultar, actualizar o eliminar cualquier usuario por ID.
- Un usuario común solo puede consultar/modificar sus propios datos.
- Las respuestas HTTP devuelven los códigos de estado adecuados (\`200\`, \`400\`, \`403\`, \`404\`, \`500\`).`
  },
  {
    title: '[BE] feat(validation): validación de esquemas y sanitización con express-validator',
    labels: ['backend', 'hardening'],
    body: `## Descripción
Incorporar validación robusta de datos de entrada utilizando \`express-validator\` en todos los endpoints de la API REST para prevenir inyecciones o datos malformados.

## Tareas
- [ ] Crear middleware reusable para capturar y formatear errores de validación (\`validationResult\`).
- [ ] Definir esquemas de validación para Auth (\`register\`, \`login\`).
- [ ] Definir esquemas de validación para \`Fletero\` (teléfono, patente, capacidad > 0, coordenadas).
- [ ] Definir esquemas de validación para \`Negocio\` (coordenadas de origen/destino válidas, peso > 0).
- [ ] Definir esquemas de validación para \`Viaje\` y asignación de fletero.

## Criterios de Aceptación
- Peticiones con cuerpos inválidos o campos requeridos faltantes retornan HTTP \`400 Bad Request\` con detalle explicativo del error.`
  },
  {
    title: '[BE] feat(logging): instrumentación de logging estructurado JSON con Pino',
    labels: ['backend', 'hardening'],
    body: `## Descripción
Integrar el logger de alto rendimiento \`pino\` y el middleware \`pino-http\` en el backend Express para trazabilidad y auditoría de peticiones, conforme a la propuesta académica.

## Tareas
- [ ] Configurar instancia de \`pino\` con formateo legible para desarrollo y JSON estructurado para producción.
- [ ] Integrar \`pino-http\` en \`backend/src/main.ts\` para registrar automáticamente método, ruta, status code y tiempo de respuesta de cada petición.
- [ ] Reemplazar llamadas a \`console.log\` / \`console.error\` por métodos del logger (\`logger.info\`, \`logger.error\`).

## Criterios de Aceptación
- Cada petición a la API genera un log estructurado con metadatos relevantes.
- Errores en controladores registran el stack trace a través de \`logger.error\`.`
  },
  {
    title: '[BE-TEST] test(geo): suite de pruebas unitarias para cálculo Haversine con Jest',
    labels: ['backend', 'testing', 'dsw-core'],
    body: `## Descripción
Implementar pruebas unitarias con Jest para validar la precisión y casos límite de la fórmula geodésica de Haversine utilizada en el motor de matching.

## Tareas
- [ ] Crear archivo de test unitario para \`calcularDistanciaHaversine\`.
- [ ] Probar cálculo de distancia entre coordenadas conocidas de ciudades argentinas (ej. Buenos Aires - Rosario aprox. 280-300 km).
- [ ] Probar caso de origen y destino idénticos (distancia = 0 km).
- [ ] Probar límites geográficos (coordenadas extremas y antipodales).

## Criterios de Aceptación
- \`npx nx test backend\` ejecuta los tests satisfactoriamente.`
  },
  {
    title: '[BE-TEST] test(auth): prueba de integración con Supertest para Auth y rutas protegidas',
    labels: ['backend', 'testing', 'dsw-core'],
    body: `## Descripción
Crear pruebas de integración automáticas con Supertest y Jest para verificar el flujo de autenticación JWT y la protección RBAC de rutas privadas.

## Tareas
- [ ] Crear test de integración para \`POST /api/usuarios/login\` (login exitoso con credenciales válidas y retorno de token JWT).
- [ ] Validar rechazo con \`401 Unauthorized\` ante credenciales incorrectas.
- [ ] Validar rechazo con \`401/403\` al acceder a rutas privadas sin token o con rol insuficiente.
- [ ] Actualizar \`backend/project.json\` eliminando \`"passWithNoTests": true\`.

## Criterios de Aceptación
- La suite de integración corre con \`npx nx test backend\` y genera evidencia de ejecución exitosa.`
  },
  {
    title: '[FE] feat(core): setup de Angular 22, HttpClient con interceptores y diseño base',
    labels: ['frontend', 'ux/ui'],
    body: `## Descripción
Configurar los cimientos de la aplicación frontend Standalone en Angular 22, incluyendo proveedores HTTP, interceptores, estilos globales y layout responsive.

## Tareas
- [ ] Configurar \`provideHttpClient(withInterceptors([authInterceptor]))\` en \`frontend/src/app/app.config.ts\`.
- [ ] Instalar y configurar librería de componentes o utilidades CSS (Tailwind CSS o Angular Material).
- [ ] Diseñar el layout base con Navbar responsive (Desktop / Mobile), menú de usuario y footer.
- [ ] Configurar rutas principales con lazy loading en \`app.routes.ts\`.

## Criterios de Aceptación
- La aplicación compila limpiamente con \`npx nx serve frontend\`.
- El layout responde fluidamente en breakpoints SM (<768px), MD (768-1024px) y LG (>1024px).`
  },
  {
    title: '[FE] feat(auth): módulo de autenticación (Login, Registro, AuthService, Guards)',
    labels: ['frontend', 'auth', 'dsw-core'],
    body: `## Descripción
Implementar el flujo completo de autenticación en frontend, gestión del token JWT en el cliente y protección de rutas según el rol del usuario.

## Tareas
- [ ] Crear \`AuthService\` con métodos \`login\`, \`register\`, \`logout\`, y señales de estado (\`currentUser\`, \`isAuthenticated\`, \`userRole\`).
- [ ] Crear componente Standalone de \`Login\` con formulario reactivo y validaciones visuales.
- [ ] Crear componente Standalone de \`Registro\` (selección de rol: \`USUARIO\` o \`FLETERO\`).
- [ ] Implementar \`AuthGuard\` funcional para restringir rutas a usuarios no autenticados.
- [ ] Implementar \`RoleGuard\` funcional para restringir secciones exclusivas (\`ADMINISTRADOR\`, \`LOGISTICO\`, \`FLETERO\`).
- [ ] Implementar \`AuthInterceptor\` para inyectar automáticamente el header \`Authorization: Bearer <token>\`.

## Criterios de Aceptación
- Inicio de sesión persistido en \`localStorage\` / Signals.
- Redirección automática a \`/login\` al expirar el token o intentar entrar a una ruta protegida.`
  },
  {
    title: '[FE] feat(negocios): vistas de listado con filtros y formulario de alta de negocios',
    labels: ['frontend', 'dsw-core'],
    body: `## Descripción
Desarrollar el módulo de gestión de demandas de carga (Negocios) para los operadores logísticos, con listado filtrable y formulario de publicación.

## Tareas
- [ ] Crear \`NegocioService\` para interactuar con los endpoints \`/api/negocios\`.
- [ ] Crear componente \`NegociosListComponent\` con tabla/cards responsive.
- [ ] Implementar filtros de búsqueda por estado (\`abierto\`, \`asignado\`, \`completado\`) y tipo de carga.
- [ ] Crear formulario de alta de nuevo negocio (\`NegocioCreateComponent\`) con selección de coordenadas de origen, destino, descripción y peso en kg.

## Criterios de Aceptación
- Un usuario con rol \`LOGISTICO\` puede publicar una nueva demanda de carga.
- El listado permite filtrar y ordenar cargas abiertas en tiempo real.`
  },
  {
    title: '[FE] feat(map): componente de mapa interactivo con Leaflet.js y OpenStreetMap',
    labels: ['frontend', 'maps'],
    body: `## Descripción
Crear un componente reutilizable de mapa interactivo basado en Leaflet.js y OpenStreetMap para visualizar geolocalizaciones de cargas, fleteros y trayectos.

## Tareas
- [ ] Instalar dependencias \`leaflet\` y \`@types/leaflet\`, e importar estilos en \`styles.scss\`.
- [ ] Crear componente Standalone reutilizable \`MapComponent\`.
- [ ] Soportar renderizado de marcadores personalizados (origen = verde, destino = rojo, fleteros = azul/camión).
- [ ] Soportar dibujo de líneas de ruta entre origen y destino.
- [ ] Agregar popups interactivos con detalles al hacer clic en los marcadores.

## Criterios de Aceptación
- El mapa se inicializa correctamente y ajusta su vista (\`fitBounds\`) para mostrar todos los puntos cargados.`
  },
  {
    title: '[FE] feat(matching): detalle de negocio y flujo de búsqueda y asignación de fleteros (Epic 1)',
    labels: ['frontend', 'epic-matching', 'dsw-core'],
    body: `## Descripción
Implementar el caso de uso central (Epic 1): el operador logístico consulta los fleteros más cercanos a la carga mediante el motor de matching y confirma la asignación.

## Tareas
- [ ] Crear vista \`NegocioDetailComponent\` que muestre la información completa del pedido.
- [ ] Integrar botón "Buscar Fleteros Disponibles" consumiendo \`GET /api/negocios/:id/fleteros-disponibles\`.
- [ ] Mostrar lista clasificada de candidatos con distancia en km, capacidad del vehículo y disponibilidad (\`inmediata\` vs \`proximo_a_destino\`).
- [ ] Sincronizar la lista de candidatos con el \`MapComponent\` (resaltar marcador al interactuar con la lista).
- [ ] Implementar modal de confirmación y ejecutar asignación vía \`POST /api/negocios/:id/asignar-fletero\`.

## Criterios de Aceptación
- Al confirmar la asignación, el negocio pasa a estado \`asignado\`, se crea el viaje y se actualiza la vista reactivamente.`
  },
  {
    title: '[FE] feat(viajes): vistas de listado y detalle de viajes para operadores y fleteros',
    labels: ['frontend', 'dsw-core'],
    body: `## Descripción
Desarrollar las vistas de seguimiento y gestión de viajes para operadores logísticos y fleteros.

## Tareas
- [ ] Crear \`ViajeService\` consumiendo los endpoints \`/api/viajes\`.
- [ ] Crear componente \`ViajesListComponent\` filtrable por estado (\`asignado\`, \`en curso\`, \`finalizado\`).
- [ ] Crear componente \`ViajeDetailComponent\` con datos del negocio asociado, fletero asignado, fechas y peso.
- [ ] Para el fletero asignado: agregar botones de acción para transicionar el estado del viaje (\`Iniciar Viaje\`, \`Finalizar Entrega\`).

## Criterios de Aceptación
- El fletero puede cambiar el estado de sus propios viajes asignados.
- El logístico puede auditar el progreso de cada viaje en tiempo real.`
  },
  {
    title: '[FE] feat(retorno-vacio): vista de sugerencias de cargas de retorno para fleteros en tránsito (Epic 2)',
    labels: ['frontend', 'epic-matching', 'dsw-core'],
    body: `## Descripción
Implementar el caso de uso de resolución del Retorno Vacío (Epic 2): sugerir oportunidades de carga abiertas cercanas al punto de descarga de un viaje activo.

## Tareas
- [ ] En la vista de detalle de viaje (\`ViajeDetailComponent\`) o panel del fletero, habilitar botón "Buscar Cargas de Retorno".
- [ ] Consumir \`GET /api/viajes/:id/negocios-retorno\`.
- [ ] Mostrar grilla/mapa con los negocios abiertos ordenados por menor desvío geográfico respecto al destino de entrega.
- [ ] Permitir al fletero u operador postularse o solicitar la carga de retorno.

## Criterios de Aceptación
- Se muestran únicamente negocios en estado \`abierto\` cuyo peso no exceda la capacidad del vehículo del fletero, ordenados por proximidad al punto de descarga.`
  },
  {
    title: '[FE-TEST] test(components): prueba unitaria de componente Angular con Vitest',
    labels: ['frontend', 'testing', 'dsw-core'],
    body: `## Descripción
Crear pruebas unitarias reactivas para componentes clave del frontend utilizando Vitest y Angular TestBed, conforme a los requisitos de aprobación directa.

## Tareas
- [ ] Configurar suite de pruebas unitarias para \`LoginComponent\` o \`NegociosListComponent\`.
- [ ] Validar renderizado de formularios, manejo de eventos de usuario y llamadas a servicios mocked.
- [ ] Ejecutar y validar con \`npx nx test frontend\`.

## Criterios de Aceptación
- La prueba unitaria pasa exitosamente y genera reporte de cobertura/ejecución.`
  },
  {
    title: '[FE-TEST] test(e2e): suite de pruebas End-to-End con Playwright',
    labels: ['frontend', 'testing', 'dsw-core'],
    body: `## Descripción
Implementar un flujo de prueba automatizado End-to-End (E2E) con Playwright en el proyecto \`frontend-e2e\`.

## Tareas
- [ ] Configurar prueba E2E de inicio de sesión con credenciales válidas.
- [ ] Navegar al listado de negocios y verificar la visualización correcta de los registros.
- [ ] Simular el flujo de apertura de detalle de un negocio.
- [ ] Ejecutar y validar con \`npx nx e2e frontend-e2e\`.

## Criterios de Aceptación
- La suite Playwright corre de punta a punta contra el entorno levantado.`
  },
  {
    title: '[DEVOPS] ci: pipeline de GitHub Actions para linter, tests y build + Despliegue',
    labels: ['devops', 'ci/cd', 'dsw-core'],
    body: `## Descripción
Configurar la integración continua (CI/CD) en GitHub Actions para validar calidad de código y preparar el despliegue cloud de la plataforma.

## Tareas
- [ ] Crear workflow \`.github/workflows/ci.yml\`.
- [ ] Configurar steps para instalación con \`pnpm\`, ejecución de linters (\`nx lint backend\`, \`nx lint frontend\`) y tests automáticos.
- [ ] Configurar despliegue de Backend y base de datos (Railway o Render).
- [ ] Configurar despliegue de Frontend (Vercel o Netlify).
- [ ] Actualizar \`docs/proposal.md\` con los enlaces definitivos a los deploys en producción y links a los PRs.

## Criterios de Aceptación
- Cada push o pull request a \`main\` dispara el pipeline de GitHub Actions exitosamente.`
  }
];

async function createIssues() {
  console.log(`\x1b[34m🚀 Creando ${issues.length} issues atómicos en ${REPO_OWNER}/${REPO_NAME}...\x1b[0m\n`);

  for (let i = 0; i < issues.length; i++) {
    const item = issues[i];
    console.log(`[${i + 1}/${issues.length}] Creando: "${item.title}"...`);

    try {
      const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`, {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: item.title,
          body: item.body,
          labels: item.labels
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`\x1b[31m❌ Error al crear issue: ${response.status} ${response.statusText}\x1b[0m`, errorData.message || errorData);
      } else {
        const data = await response.json();
        console.log(`\x1b[32m✅ Creado con éxito: #${data.number} -> ${data.html_url}\x1b[0m`);
      }
    } catch (err) {
      console.error(`\x1b[31m❌ Excepción de red:\x1b[0m`, err);
    }

    // Pequeño delay para respetar rate limiting de la API de GitHub
    await new Promise((r) => setTimeout(r, 1200));
  }

  console.log(`\n\x1b[32m🎉 ¡Proceso finalizado!\x1b[0m Puedes ver tus issues en: https://github.com/${REPO_OWNER}/${REPO_NAME}/issues`);
}

createIssues();
