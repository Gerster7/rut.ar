import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CargaDemo {
  id: number;
  descripcion: string;
  tipoCarga: string;
  origen: string;
  origenCoords: [number, number]; // [latitud, longitud]
  destino: string;
  destinoCoords: [number, number]; // [latitud, longitud]
  pesoTotal: number;
  estado: 'abierto' | 'asignado' | 'en_proceso' | 'completado';
  fleteroSugerido?: string;
  distanciaKm: number;
}

export interface MapBounds {
  latMin: number;
  latMax: number;
  lngMin: number;
  lngMax: number;
  label: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      
      <!-- ==============================================================
           PANEL DE FILTROS SUPERIOR (Modal / Drawer desplegable)
           ============================================================== -->
      @if (filterDrawerOpen()) {
        <div 
          class="filter-backdrop" 
          (click)="closeFilterDrawer()"
          (keydown.escape)="closeFilterDrawer()"
          tabindex="0"
          role="button"
          aria-label="Cerrar panel de filtros"></div>
        <aside class="filter-drawer">
          <div class="drawer-header">
            <div class="drawer-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              <h3>Filtros de Búsqueda</h3>
            </div>
            <button class="close-btn" (click)="closeFilterDrawer()" aria-label="Cerrar filtros">&times;</button>
          </div>

          <div class="drawer-content">
            <div class="filter-group">
              <span class="filter-label">Estado de Carga</span>
              <div class="filter-options">
                <button 
                  class="option-pill" 
                  [class.active]="filterStatus() === 'todos'" 
                  (click)="filterStatus.set('todos')">
                  Todos
                </button>
                <button 
                  class="option-pill" 
                  [class.active]="filterStatus() === 'abierto'" 
                  (click)="filterStatus.set('abierto')">
                  Abiertos
                </button>
                <button 
                  class="option-pill" 
                  [class.active]="filterStatus() === 'asignado'" 
                  (click)="filterStatus.set('asignado')">
                  Asignados
                </button>
                <button 
                  class="option-pill" 
                  [class.active]="filterStatus() === 'completado'" 
                  (click)="filterStatus.set('completado')">
                  Completados
                </button>
              </div>
            </div>

            <div class="filter-group">
              <span class="filter-label">Encuadre Geográfico del Mapa</span>
              <div class="region-buttons">
                @for (region of regionPresets; track region.label) {
                  <button 
                    class="region-btn" 
                    [class.active]="currentBounds().label === region.label"
                    (click)="setRegion(region)">
                    {{ region.label }}
                  </button>
                }
              </div>
            </div>

            <div class="filter-group">
              <span class="filter-label">Sincronización Dinámica</span>
              <label class="toggle-control" for="syncToggle">
                <input id="syncToggle" type="checkbox" [checked]="syncBoundingBox()" (change)="toggleSync()" />
                <span class="toggle-text">Filtrar tabla según área visible del mapa</span>
              </label>
            </div>
          </div>

          <div class="drawer-footer">
            <button class="btn btn-secondary w-full" (click)="resetFilters()">Restablecer</button>
            <button class="btn btn-primary w-full" (click)="closeFilterDrawer()">Aplicar Filtros</button>
          </div>
        </aside>
      }

      <!-- ==============================================================
           MAPA INTERACTIVO CON DETALLES COMO POPUP EN EL MAPA
           ============================================================== -->
      <section class="map-section card">
        <div class="map-header">
          <div class="header-info">
            <div class="title-with-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                <line x1="8" y1="2" x2="8" y2="18" />
                <line x1="16" y1="6" x2="16" y2="22" />
              </svg>
              <h2>Mapa de Cargas y Fleteros</h2>
            </div>
            <span class="current-region-badge">
              📍 Área Visible: <strong>{{ currentBounds().label }}</strong>
            </span>
          </div>

          <div class="header-controls">
            <!-- Selector rápido de cuadrantes / Pan del Mapa -->
            <div class="pan-buttons">
              <button 
                class="pan-btn" 
                title="Desplazarse hacia el Oeste (Cañada de Gómez / Marcos Juárez)"
                [class.active]="currentBounds().label === 'Oeste (Cañada de Gómez)'"
                (click)="panTo('oeste')">
                &larr; Oeste
              </button>
              <button 
                class="pan-btn" 
                title="Ver Toda la Región"
                [class.active]="currentBounds().label === 'Toda la Región'"
                (click)="panTo('centro')">
                Toda la Región
              </button>
              <button 
                class="pan-btn" 
                title="Desplazarse hacia el Este (Rosario y Gran Rosario)"
                [class.active]="currentBounds().label === 'Este (Rosario)'"
                (click)="panTo('este')">
                Este &rarr;
              </button>
            </div>

            <!-- Botón Filtros (accesible directamente sobre el mapa) -->
            <button class="btn btn-secondary btn-sm" (click)="openFilterDrawer()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Filtros
            </button>
          </div>
        </div>

        <!-- Viewport del Mapa -->
        <div class="map-viewport">
          <svg class="map-svg-layer" viewBox="0 0 800 420" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#f59e0b" />
                <stop offset="100%" stop-color="#10b981" />
              </linearGradient>
              <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity="0.6"/>
              </filter>
            </defs>

            <!-- Territorio provincial base -->
            <rect width="800" height="420" fill="#0f172a" />
            <path d="M 40,30 L 760,20 L 730,400 L 60,390 Z" fill="#1b2438" opacity="0.5" />

            <!-- Red de Autopistas / Rutas provinciales y nacionales -->
            <path d="M 80,360 Q 280,270 480,240 T 700,140" stroke="#334155" stroke-width="3" fill="none" />
            <path d="M 220,400 L 480,240 L 520,40" stroke="#334155" stroke-width="2" stroke-dasharray="4" fill="none" />

            <!-- Rutas visibles de cargas -->
            @if (isCargaVisibleInMap(selectedCarga())) {
              <path 
                [attr.d]="getSvgRoutePath(selectedCarga())" 
                stroke="url(#routeGrad)" 
                stroke-width="4" 
                stroke-dasharray="6,6" 
                fill="none" 
                class="animated-route" />
            }

            <!-- Marcadores Geográficos Dinámicos (solo se dibujan si caen en el Bounding Box actual) -->
            @for (carga of visibleCargasInMap(); track carga.id) {
              <!-- Marcador de Origen -->
              <g 
                [attr.transform]="'translate(' + getSvgX(carga.origenCoords[1]) + ',' + getSvgY(carga.origenCoords[0]) + ')'"
                filter="url(#shadowFilter)"
                class="map-marker"
                [class.selected-marker]="selectedCarga()?.id === carga.id"
                (click)="selectCarga(carga)">
                <circle r="13" fill="#f59e0b" />
                <circle r="5" fill="#120e1e" />
                <text y="-18" text-anchor="middle" fill="#f8fafc" font-size="11" font-weight="600">
                  {{ carga.origen.split('(')[0] }}
                </text>
              </g>

              <!-- Marcador de Destino -->
              <g 
                [attr.transform]="'translate(' + getSvgX(carga.destinoCoords[1]) + ',' + getSvgY(carga.destinoCoords[0]) + ')'"
                filter="url(#shadowFilter)"
                class="map-marker"
                (click)="selectCarga(carga)">
                <circle r="14" fill="#10b981" />
                <path d="M -4,-2 L 0,-6 L 4,-2 L 2,-2 L 2,4 L -2,4 L -2,-2 Z" fill="#120e1e" />
                <text y="-18" text-anchor="middle" fill="#f8fafc" font-size="11" font-weight="600">
                  {{ carga.destino.split('(')[0] }}
                </text>
              </g>
            }

            <!-- Marcador de Fletero en Tránsito (si está en la zona visible) -->
            @if (isCoordsInBounds(-32.83, -61.15)) {
              <g 
                [attr.transform]="'translate(' + getSvgX(-61.15) + ',' + getSvgY(-32.83) + ')'"
                filter="url(#shadowFilter)"
                class="map-marker truck-marker">
                <circle r="11" fill="#3b82f6" />
                <circle r="4" fill="#ffffff" />
                <text y="22" text-anchor="middle" fill="#93c5fd" font-size="10" font-weight="600">
                  Camión Juan P. (5.000 kg)
                </text>
              </g>
            }
          </svg>

          <!-- ==========================================================
               POPUP FLOTANTE EN EL MAPA CON DETALLE DEL NEGOCIO SELECCIONADO
               ========================================================== -->
          @if (selectedCarga() && popupOpen()) {
            <div class="map-popup-card">
              <div class="popup-header">
                <div class="popup-title-wrap">
                  <span class="badge" [ngClass]="'badge-' + selectedCarga()!.estado">
                    {{ selectedCarga()!.estado }}
                  </span>
                  <h4>Carga #{{ selectedCarga()!.id }}: {{ selectedCarga()!.descripcion }}</h4>
                </div>
                <button class="popup-close-btn" (click)="closePopup()" aria-label="Cerrar Ficha">&times;</button>
              </div>

              <div class="popup-body">
                <div class="popup-route">
                  <div class="route-line">
                    <span class="route-origin">📍 {{ selectedCarga()!.origen }}</span>
                    <span class="route-arrow">&rarr;</span>
                    <span class="route-dest">🏁 {{ selectedCarga()!.destino }}</span>
                  </div>
                </div>

                <div class="popup-stats">
                  <div class="stat-pill">
                    <span class="stat-lbl">Peso:</span>
                    <strong>{{ selectedCarga()!.pesoTotal | number }} kg</strong>
                  </div>
                  <div class="stat-pill">
                    <span class="stat-lbl">Distancia:</span>
                    <strong>{{ selectedCarga()!.distanciaKm }} km</strong>
                  </div>
                  <div class="stat-pill">
                    <span class="stat-lbl">Tipo:</span>
                    <span>{{ selectedCarga()!.tipoCarga }}</span>
                  </div>
                </div>

                <div class="popup-matching">
                  <span class="matching-tag">Fletero Recomendado (Haversine):</span>
                  <div class="matching-driver">
                    <strong>{{ selectedCarga()!.fleteroSugerido || 'Calculando fleteros disponibles...' }}</strong>
                  </div>
                </div>
              </div>

              <div class="popup-footer">
                @if (selectedCarga()!.estado === 'abierto') {
                  <button class="btn btn-primary btn-sm w-full">
                    Asignar Fletero Óptimo
                  </button>
                } @else {
                  <button class="btn btn-secondary btn-sm w-full" disabled>
                    Carga Asignada (Viaje en Proceso)
                  </button>
                }
              </div>
            </div>
          }
        </div>
      </section>

      <!-- ==============================================================
           TABLA DE CARGAS SINCRONIZADA CON EL ENCUADRE DEL MAPA
           (Si te desplazás a la izquierda, lo de Rosario desaparece)
           ============================================================== -->
      <section class="table-section">
        <div class="table-container">
          <div class="table-toolbar">
            <div class="toolbar-title-group">
              <h3>Demandas de Transporte en el Área Visible</h3>
              <p class="sync-status">
                <span class="sync-dot"></span>
                Mostrando <strong>{{ displayedCargas().length }}</strong> cargas visibles en el encuadre 
                <em>({{ currentBounds().label }})</em>
              </p>
            </div>

            <!-- Resumen de Filtros Aplicados -->
            <div class="toolbar-actions">
              @if (currentBounds().label !== 'Toda la Región') {
                <button class="btn btn-secondary btn-sm" (click)="panTo('centro')">
                  Restablecer a Toda la Región
                </button>
              }
              <button class="btn btn-secondary btn-sm filter-pill-btn" (click)="openFilterDrawer()">
                Estado: <strong>{{ filterStatus() | uppercase }}</strong>
              </button>
            </div>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Descripción de Carga</th>
                <th>Tipo</th>
                <th>Origen</th>
                <th>Destino</th>
                <th>Peso</th>
                <th>Distancia</th>
                <th>Estado</th>
                <th class="text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              @if (displayedCargas().length === 0) {
                <tr>
                  <td colspan="9" class="empty-state">
                    No hay cargas registradas dentro del encuadre geográfico actual.
                    <button class="btn btn-link" (click)="panTo('centro')">Ver toda la región</button>
                  </td>
                </tr>
              }
              @for (carga of displayedCargas(); track carga.id) {
                <tr 
                  [class.selected]="selectedCarga()?.id === carga.id"
                  (click)="selectCarga(carga)">
                  <td class="highlight">#{{ carga.id }}</td>
                  <td class="font-medium text-white">{{ carga.descripcion }}</td>
                  <td>{{ carga.tipoCarga }}</td>
                  <td>{{ carga.origen }}</td>
                  <td>{{ carga.destino }}</td>
                  <td class="highlight">{{ carga.pesoTotal | number }} kg</td>
                  <td>{{ carga.distanciaKm }} km</td>
                  <td>
                    <span class="badge" [ngClass]="'badge-' + carga.estado">
                      {{ carga.estado }}
                    </span>
                  </td>
                  <td class="text-right">
                    <button class="btn btn-secondary btn-sm" (click)="selectCarga(carga); $event.stopPropagation()">
                      Ver en Mapa
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 1.5rem;
      max-width: 1600px;
      margin: 0 auto;
      width: 100%;
    }

    /* Header del Mapa */
    .map-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.85rem;
      background: rgba(0, 0, 0, 0.2);
    }

    .header-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .title-with-icon {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--color-primary);

      h2 {
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--text-primary);
      }
    }

    .current-region-badge {
      font-size: 0.75rem;
      padding: 0.25rem 0.65rem;
      border-radius: var(--radius-sm);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);

      strong {
        color: var(--color-accent);
      }
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .pan-buttons {
      display: flex;
      align-items: center;
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 2px;
    }

    .pan-btn {
      padding: 0.35rem 0.65rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--text-secondary);
      border-radius: var(--radius-sm);
      transition: all 0.15s ease;

      &:hover {
        color: var(--text-primary);
        background: rgba(255, 255, 255, 0.06);
      }

      &.active {
        background: var(--color-primary);
        color: #ffffff;
        font-weight: 600;
      }
    }

    /* Viewport del Mapa */
    .map-section {
      min-height: 440px;
      display: flex;
      flex-direction: column;
    }

    .map-viewport {
      flex: 1;
      position: relative;
      background: #0f172a;
      overflow: hidden;
      min-height: 380px;
    }

    .map-svg-layer {
      width: 100%;
      height: 100%;
      display: block;
    }

    .animated-route {
      animation: dash 20s linear infinite;
    }

    @keyframes dash {
      to {
        stroke-dashoffset: -1000;
      }
    }

    .map-marker {
      cursor: pointer;
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        transform: scale(1.2);
      }

      &.selected-marker circle:first-child {
        stroke: #ffffff;
        stroke-width: 3;
      }
    }

    /* Popup Flotante sobre el Mapa */
    .map-popup-card {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 340px;
      max-width: calc(100% - 2rem);
      background: rgba(18, 14, 30, 0.94);
      backdrop-filter: blur(16px);
      border: 1px solid var(--border-hover);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-elevated);
      z-index: 50;
      animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes popIn {
      from {
        opacity: 0;
        transform: translateY(-8px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .popup-header {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .popup-title-wrap {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;

      h4 {
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1.3;
      }
    }

    .popup-close-btn {
      font-size: 1.3rem;
      color: var(--text-muted);
      line-height: 1;
      padding: 0.2rem;

      &:hover {
        color: var(--text-primary);
      }
    }

    .popup-body {
      padding: 0.9rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .popup-route {
      font-size: 0.8rem;
      color: var(--text-secondary);
      background: rgba(255, 255, 255, 0.03);
      padding: 0.5rem 0.75rem;
      border-radius: var(--radius-sm);
    }

    .route-arrow {
      margin: 0 0.4rem;
      color: var(--color-accent);
      font-weight: bold;
    }

    .popup-stats {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .stat-pill {
      font-size: 0.75rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 0.3rem 0.55rem;
      display: flex;
      gap: 0.35rem;

      .stat-lbl {
        color: var(--text-muted);
      }

      strong {
        color: var(--color-accent);
      }
    }

    .popup-matching {
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.25);
      border-radius: var(--radius-sm);
      padding: 0.55rem 0.75rem;
    }

    .matching-tag {
      font-size: 0.68rem;
      text-transform: uppercase;
      color: #93c5fd;
      font-weight: 600;
      letter-spacing: 0.04em;
    }

    .matching-driver {
      font-size: 0.8rem;
      font-weight: 600;
      color: #ffffff;
      margin-top: 0.15rem;
    }

    .popup-footer {
      padding: 0.75rem 1rem;
      border-top: 1px solid var(--border-subtle);
    }

    /* Tabla y Sincronización */
    .table-section {
      width: 100%;
    }

    .table-toolbar {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
      background: rgba(0, 0, 0, 0.12);
    }

    .toolbar-title-group {
      h3 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-primary);
      }
    }

    .sync-status {
      font-size: 0.78rem;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 0.4rem;
      margin-top: 0.2rem;
    }

    .sync-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background-color: var(--color-success);
      box-shadow: 0 0 6px var(--color-success);
    }

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .filter-pill-btn {
      color: var(--color-accent);
      border-color: rgba(245, 158, 11, 0.3);
    }

    .data-table tr {
      cursor: pointer;

      &.selected {
        background: rgba(59, 130, 246, 0.12) !important;
        border-left: 3px solid var(--color-primary);
      }
    }

    .empty-state {
      text-align: center;
      padding: 2.5rem 1rem;
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    .btn-link {
      color: var(--color-primary);
      text-decoration: underline;
      margin-left: 0.5rem;
      font-weight: 600;
    }

    .text-right {
      text-align: right;
    }

    .w-full {
      width: 100%;
    }

    /* Drawer de Filtros */
    .filter-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      z-index: 1100;
    }

    .filter-drawer {
      position: fixed;
      top: 0;
      bottom: 0;
      right: 0;
      width: 320px;
      max-width: 90vw;
      background-color: var(--bg-card-elevated);
      border-left: 1px solid var(--border-subtle);
      z-index: 1101;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-elevated);
      animation: slideInRight 0.25s ease;
    }

    @keyframes slideInRight {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }

    .drawer-header {
      padding: 1.25rem;
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .drawer-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--color-accent);

      h3 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-primary);
      }
    }

    .close-btn {
      font-size: 1.4rem;
      color: var(--text-muted);
      padding: 0.2rem;

      &:hover { color: var(--text-primary); }
    }

    .drawer-content {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      flex: 1;
      overflow-y: auto;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .filter-label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }

    .filter-options, .region-buttons {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .option-pill, .region-btn {
      padding: 0.55rem 0.85rem;
      border-radius: var(--radius-md);
      font-size: 0.82rem;
      color: var(--text-secondary);
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle);
      text-align: left;
      transition: all 0.15s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.08);
        color: var(--text-primary);
      }

      &.active {
        background: var(--color-primary);
        color: #ffffff;
        border-color: var(--color-primary);
        font-weight: 600;
      }
    }

    .toggle-control {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      font-size: 0.82rem;
      color: var(--text-secondary);
      cursor: pointer;
    }

    .drawer-footer {
      padding: 1rem 1.25rem;
      border-top: 1px solid var(--border-subtle);
      display: flex;
      gap: 0.75rem;
    }

    /* Adaptaciones Mobile */
    @media (max-width: 767px) {
      .dashboard-container {
        padding: 0.85rem;
        gap: 1rem;
      }

      .map-popup-card {
        top: auto;
        bottom: 0.75rem;
        right: 0.75rem;
        left: 0.75rem;
        width: auto;
      }

      .header-controls {
        width: 100%;
        justify-content: space-between;
      }
    }
  `]
})
export class DashboardComponent {
  cargas = signal<CargaDemo[]>([
    {
      id: 1,
      descripcion: 'Repuestos Automotrices & Maquinaria',
      tipoCarga: 'Pallets Cerrados',
      origen: 'Cañada de Gómez (RN9 Km 368)',
      origenCoords: [-32.8167, -61.3833],
      destino: 'Rosario (Parque Industrial)',
      destinoCoords: [-32.9468, -60.6393],
      pesoTotal: 4500,
      estado: 'abierto',
      fleteroSugerido: 'Juan Pérez (Mercedes 1620 - 5.000 kg)',
      distanciaKm: 72.4,
    },
    {
      id: 2,
      descripcion: 'Bobinas de Acero y Perfiles',
      tipoCarga: 'Metalúrgica',
      origen: 'Rosario (Zona Sur)',
      origenCoords: [-32.9800, -60.6500],
      destino: 'Casilda (Ruta 33)',
      destinoCoords: [-33.0442, -61.1681],
      pesoTotal: 8200,
      estado: 'asignado',
      fleteroSugerido: 'Carlos Rodríguez (Semirremolque 12.000 kg)',
      distanciaKm: 56.1,
    },
    {
      id: 3,
      descripcion: 'Cereales y Semillas en Big Bags',
      tipoCarga: 'Granel Agrícola',
      origen: 'San Jorge (Ruta 13)',
      origenCoords: [-31.8964, -61.8592],
      destino: 'Puerto San Lorenzo',
      destinoCoords: [-32.7489, -60.7328],
      pesoTotal: 14000,
      estado: 'abierto',
      fleteroSugerido: 'Transporte El Ceibo (Acoplado 15.000 kg)',
      distanciaKm: 142.8,
    },
    {
      id: 4,
      descripcion: 'Alimentos no perecederos',
      tipoCarga: 'Cajas Estibadas',
      origen: 'Santa Fe Capital',
      origenCoords: [-31.6333, -60.7000],
      destino: 'Rosario (Centro de Distribución)',
      destinoCoords: [-32.9468, -60.6393],
      pesoTotal: 3200,
      estado: 'completado',
      fleteroSugerido: 'Martín Gómez (Furgón Térmico 4.000 kg)',
      distanciaKm: 168.0,
    },
  ]);

  regionPresets: MapBounds[] = [
    {
      label: 'Toda la Región',
      latMin: -33.5,
      latMax: -31.2,
      lngMin: -62.5,
      lngMax: -60.0,
    },
    {
      label: 'Oeste (Cañada de Gómez)',
      latMin: -33.2,
      latMax: -32.4,
      lngMin: -62.2,
      lngMax: -61.1, // Rosario (-60.63) queda afuera
    },
    {
      label: 'Este (Rosario)',
      latMin: -33.3,
      latMax: -32.5,
      lngMin: -61.0, // Cañada de Gómez (-61.38) queda afuera
      lngMax: -60.2,
    },
    {
      label: 'Norte (San Jorge / Santa Fe)',
      latMin: -32.2,
      latMax: -31.2,
      lngMin: -62.2,
      lngMax: -60.4,
    },
  ];

  currentBounds = signal<MapBounds>(this.regionPresets[0]);
  selectedCarga = signal<CargaDemo | null>(this.cargas()[0]);
  popupOpen = signal<boolean>(true);
  filterDrawerOpen = signal<boolean>(false);
  filterStatus = signal<string>('todos');
  syncBoundingBox = signal<boolean>(true);

  // Cargas que caen dentro del encuadre geográfico actual del mapa
  visibleCargasInMap = computed(() => {
    const bounds = this.currentBounds();
    return this.cargas().filter((carga) => {
      const [lat, lng] = carga.origenCoords;
      return (
        lat >= bounds.latMin &&
        lat <= bounds.latMax &&
        lng >= bounds.lngMin &&
        lng <= bounds.lngMax
      );
    });
  });

  // Cargas a renderizar en la tabla: sincronizadas con el Bounding Box del mapa + filtro de estado
  displayedCargas = computed(() => {
    let list = this.syncBoundingBox() ? this.visibleCargasInMap() : this.cargas();
    const status = this.filterStatus();
    if (status !== 'todos') {
      list = list.filter((c) => c.estado === status);
    }
    return list;
  });

  selectCarga(carga: CargaDemo) {
    this.selectedCarga.set(carga);
    this.popupOpen.set(true);
  }

  closePopup() {
    this.popupOpen.set(false);
  }

  openFilterDrawer() {
    this.filterDrawerOpen.set(true);
  }

  closeFilterDrawer() {
    this.filterDrawerOpen.set(false);
  }

  toggleSync() {
    this.syncBoundingBox.update((val) => !val);
  }

  resetFilters() {
    this.filterStatus.set('todos');
    this.currentBounds.set(this.regionPresets[0]);
    this.syncBoundingBox.set(true);
  }

  setRegion(region: MapBounds) {
    this.currentBounds.set(region);
  }

  panTo(direction: 'oeste' | 'centro' | 'este') {
    if (direction === 'oeste') {
      this.currentBounds.set(this.regionPresets[1]); // Cañada de Gómez
    } else if (direction === 'este') {
      this.currentBounds.set(this.regionPresets[2]); // Rosario
    } else {
      this.currentBounds.set(this.regionPresets[0]); // Toda la región
    }
  }

  isCoordsInBounds(lat: number, lng: number): boolean {
    const b = this.currentBounds();
    return lat >= b.latMin && lat <= b.latMax && lng >= b.lngMin && lng <= b.lngMax;
  }

  isCargaVisibleInMap(carga: CargaDemo | null): boolean {
    if (!carga) return false;
    return this.isCoordsInBounds(carga.origenCoords[0], carga.origenCoords[1]);
  }

  // Mapeo geográfico de longitud a coordenada X SVG (800 px)
  getSvgX(lng: number): number {
    const b = this.currentBounds();
    const ratio = (lng - b.lngMin) / (b.lngMax - b.lngMin);
    return Math.max(50, Math.min(750, ratio * 700 + 50));
  }

  // Mapeo geográfico de latitud a coordenada Y SVG (420 px invertido para latitud)
  getSvgY(lat: number): number {
    const b = this.currentBounds();
    const ratio = (b.latMax - lat) / (b.latMax - b.latMin);
    return Math.max(40, Math.min(380, ratio * 340 + 40));
  }

  getSvgRoutePath(carga: CargaDemo | null): string {
    if (!carga) return '';
    const x1 = this.getSvgX(carga.origenCoords[1]);
    const y1 = this.getSvgY(carga.origenCoords[0]);
    const x2 = this.getSvgX(carga.destinoCoords[1]);
    const y2 = this.getSvgY(carga.destinoCoords[0]);
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2 - 25;
    return `M ${x1},${y1} Q ${cx},${cy} ${x2},${y2}`;
  }
}
