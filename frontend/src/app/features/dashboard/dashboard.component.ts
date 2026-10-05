import { 
  Component, 
  signal, 
  computed, 
  AfterViewInit, 
  OnDestroy, 
  ElementRef, 
  viewChild 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

export interface CargaDemo {
  id: number;
  descripcion: string;
  tipoCarga: string;
  origen: string;
  origenCoords: [number, number]; // [lat, lng]
  destino: string;
  destinoCoords: [number, number]; // [lat, lng]
  pesoTotal: number;
  estado: 'abierto' | 'asignado' | 'en_proceso' | 'completado';
  fleteroSugerido?: string;
  distanciaKm: number;
}

export interface FleteroDemo {
  id: number;
  nombre: string;
  telefono: string;
  vehiculo: string;
  patente: string;
  capacidadKg: number;
  coords: [number, number];
  localidad: string;
  disponible: boolean;
}

export interface MapBounds {
  latMin: number;
  latMax: number;
  lngMin: number;
  lngMax: number;
  label: string;
}

export type BaseLayerType = 'relieve' | 'oscuro' | 'calles' | 'satelite';

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
              <h3>Filtros & Opciones</h3>
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
                  Todos ({{ cargas().length }})
                </button>
                <button 
                  class="option-pill" 
                  [class.active]="filterStatus() === 'abierto'" 
                  (click)="filterStatus.set('abierto')">
                  Abiertos ({{ countByStatus('abierto') }})
                </button>
                <button 
                  class="option-pill" 
                  [class.active]="filterStatus() === 'asignado'" 
                  (click)="filterStatus.set('asignado')">
                  Asignados ({{ countByStatus('asignado') }})
                </button>
                <button 
                  class="option-pill" 
                  [class.active]="filterStatus() === 'en_proceso'" 
                  (click)="filterStatus.set('en_proceso')">
                  En Proceso ({{ countByStatus('en_proceso') }})
                </button>
                <button 
                  class="option-pill" 
                  [class.active]="filterStatus() === 'completado'" 
                  (click)="filterStatus.set('completado')">
                  Completados ({{ countByStatus('completado') }})
                </button>
              </div>
            </div>

            <div class="filter-group">
              <span class="filter-label">Capa del Mapa</span>
              <div class="layer-selector-list">
                <button 
                  class="layer-option" 
                  [class.active]="activeLayer() === 'relieve'" 
                  (click)="changeBaseLayer('relieve')">
                  ⛰️ Relieve & Topografía (Esri Topo)
                </button>
                <button 
                  class="layer-option" 
                  [class.active]="activeLayer() === 'oscuro'" 
                  (click)="changeBaseLayer('oscuro')">
                  🌙 Modo Oscuro (CartoDB Dark)
                </button>
                <button 
                  class="layer-option" 
                  [class.active]="activeLayer() === 'calles'" 
                  (click)="changeBaseLayer('calles')">
                  🗺️ Calles (OpenStreetMap)
                </button>
                <button 
                  class="layer-option" 
                  [class.active]="activeLayer() === 'satelite'" 
                  (click)="changeBaseLayer('satelite')">
                  🛰️ Satelital (Esri World Imagery)
                </button>
              </div>
            </div>

            <div class="filter-group">
              <span class="filter-label">Sincronización Geoespacial</span>
              <label class="toggle-control" for="syncToggle">
                <input id="syncToggle" type="checkbox" [checked]="syncBoundingBox()" (change)="toggleSync()" />
                <span class="toggle-text">Filtrar tabla según área visible en el mapa</span>
              </label>
            </div>
          </div>

          <div class="drawer-footer">
            <button class="btn btn-secondary w-full" (click)="resetFilters()">Restablecer</button>
            <button class="btn btn-primary w-full" (click)="closeFilterDrawer()">Aplicar</button>
          </div>
        </aside>
      }

      <!-- ==============================================================
           MAPA INTERACTIVO LEAFLET CON CAPAS Y RELIEVE
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
              <h2>Mapa Interactivo de Cargas & Fleteros</h2>
            </div>
            <span class="current-region-badge">
              📍 Región: <strong>{{ currentBounds().label }}</strong> &bull; {{ visibleCargasInMap().length }} cargas &bull; {{ visibleFleterosInMap().length }} fleteros
            </span>
          </div>

          <div class="header-controls">
            <!-- Selector rápido de Capas Base (Relieve, Oscuro, Calles, Satélite) -->
            <div class="layer-pill-group">
              <button 
                class="layer-pill" 
                [class.active]="activeLayer() === 'relieve'" 
                (click)="changeBaseLayer('relieve')"
                title="Ver mapa con curvas de nivel y relieve de elevación">
                ⛰️ Relieve
              </button>
              <button 
                class="layer-pill" 
                [class.active]="activeLayer() === 'oscuro'" 
                (click)="changeBaseLayer('oscuro')"
                title="Ver mapa en modo oscuro contrastado">
                🌙 Oscuro
              </button>
              <button 
                class="layer-pill" 
                [class.active]="activeLayer() === 'calles'" 
                (click)="changeBaseLayer('calles')"
                title="Ver mapa urbano de calles">
                🗺️ Calles
              </button>
              <button 
                class="layer-pill" 
                [class.active]="activeLayer() === 'satelite'" 
                (click)="changeBaseLayer('satelite')"
                title="Ver vista satelital">
                🛰️ Satélite
              </button>
            </div>

            <!-- Botones de Paneo Rápido -->
            <div class="pan-buttons">
              <button 
                class="pan-btn" 
                title="Desplazarse al Oeste (Cañada de Gómez / Armstrong)"
                (click)="flyToZone('oeste')">
                &larr; Cañada de Gómez
              </button>
              <button 
                class="pan-btn" 
                title="Centrar en toda la región"
                (click)="flyToZone('centro')">
                Toda la Región
              </button>
              <button 
                class="pan-btn" 
                title="Desplazarse al Este (Rosario)"
                (click)="flyToZone('este')">
                Rosario &rarr;
              </button>
              <button 
                class="pan-btn" 
                title="Desplazarse al Norte (Santa Fe / Rafaela)"
                (click)="flyToZone('norte')">
                &uarr; Santa Fe
              </button>
            </div>

            <!-- Botón Filtros -->
            <button class="btn btn-secondary btn-sm" (click)="openFilterDrawer()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Filtros
            </button>
          </div>
        </div>

        <!-- Contenedor del Mapa Leaflet -->
        <div class="map-viewport-container">
          <div #mapContainer class="leaflet-map-host" id="leafletMapHost"></div>

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

          <!-- POPUP DE FLETERO SELECCIONADO -->
          @if (selectedFletero() && fleteroPopupOpen()) {
            <div class="map-popup-card fletero-card">
              <div class="popup-header">
                <div class="popup-title-wrap">
                  <span class="badge badge-asignado">FLETERO EN LÍNEA</span>
                  <h4>{{ selectedFletero()!.nombre }}</h4>
                </div>
                <button class="popup-close-btn" (click)="closeFleteroPopup()" aria-label="Cerrar">&times;</button>
              </div>
              <div class="popup-body">
                <div class="stat-pill">
                  <span class="stat-lbl">Vehículo:</span>
                  <strong>{{ selectedFletero()!.vehiculo }}</strong>
                </div>
                <div class="stat-pill">
                  <span class="stat-lbl">Patente:</span>
                  <strong>{{ selectedFletero()!.patente }}</strong>
                </div>
                <div class="stat-pill">
                  <span class="stat-lbl">Capacidad:</span>
                  <strong>{{ selectedFletero()!.capacidadKg | number }} kg</strong>
                </div>
                <div class="stat-pill">
                  <span class="stat-lbl">Ubicación Actual:</span>
                  <span>{{ selectedFletero()!.localidad }}</span>
                </div>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- ==============================================================
           TABLA DE CARGAS SINCRONIZADA CON EL ENCUADRE DEL MAPA
           ============================================================== -->
      <section class="table-section">
        <div class="table-container">
          <div class="table-toolbar">
            <div class="toolbar-title-group">
              <h3>Demandas de Transporte en el Área Visible del Mapa</h3>
              <p class="sync-status">
                <span class="sync-dot"></span>
                Mostrando <strong>{{ displayedCargas().length }}</strong> de {{ cargas().length }} cargas en 
                <em>({{ currentBounds().label }})</em>
              </p>
            </div>

            <!-- Acciones de Toolbar -->
            <div class="toolbar-actions">
              <button class="btn btn-secondary btn-sm" (click)="flyToZone('centro')">
                Restablecer Vista Completa
              </button>
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
                    No hay cargas registradas en la porción de mapa visible actualmente.
                    <button class="btn btn-link" (click)="flyToZone('centro')">Ver toda la región</button>
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
      flex-wrap: wrap;
    }

    /* Selector de Capas Base */
    .layer-pill-group {
      display: flex;
      align-items: center;
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 2px;
      gap: 2px;
    }

    .layer-pill {
      padding: 0.35rem 0.65rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--text-secondary);
      border-radius: var(--radius-sm);
      transition: all 0.15s ease;

      &:hover {
        color: var(--text-primary);
        background: rgba(255, 255, 255, 0.08);
      }

      &.active {
        background: var(--color-accent);
        color: #120e1e;
        font-weight: 700;
      }
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
    }

    /* Viewport del Mapa Leaflet */
    .map-section {
      min-height: 480px;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .map-viewport-container {
      flex: 1;
      position: relative;
      min-height: 480px;
      height: 480px;
      overflow: hidden;
      background: #0f172a;
    }

    .leaflet-map-host {
      width: 100%;
      height: 100%;
      min-height: 480px;
      display: block;
      z-index: 10;
    }

    /* Popup Flotante sobre el Mapa */
    .map-popup-card {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 340px;
      max-width: calc(100% - 2rem);
      background: rgba(18, 14, 30, 0.95);
      backdrop-filter: blur(16px);
      border: 1px solid var(--border-hover);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-elevated);
      z-index: 500;
      animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .fletero-card {
      right: auto;
      left: 1rem;
      border-color: rgba(59, 130, 246, 0.4);
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

    .filter-options, .layer-selector-list {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .option-pill, .layer-option {
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

      .map-viewport-container {
        min-height: 380px;
        height: 380px;
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

      .layer-pill-group {
        width: 100%;
        overflow-x: auto;
      }
    }
  `]
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  mapContainer = viewChild<ElementRef<HTMLDivElement>>('mapContainer');
  private map: L.Map | null = null;
  private tileLayers: Partial<Record<BaseLayerType, L.TileLayer>> = {};
  private markersLayer: L.LayerGroup | null = null;
  private routePolyline: L.Polyline | null = null;

  activeLayer = signal<BaseLayerType>('relieve');

  // Catálogo completo de 15 Cargas / Negocios realistas en Santa Fe y alrededores
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
      tipoCarga: 'Metalúrgica Pesada',
      origen: 'Rosario (Zona Sur)',
      origenCoords: [-32.9800, -60.6500],
      destino: 'Casilda (Ruta 33)',
      destinoCoords: [-33.0442, -61.1681],
      pesoTotal: 8200,
      estado: 'asignado',
      fleteroSugerido: 'Carlos Rodríguez (Scania R450 - 28.000 kg)',
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
      fleteroSugerido: 'Transporte El Ceibo (Volvo FH16 - 15.000 kg)',
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
      fleteroSugerido: 'Martín Gómez (Iveco Daily - 4.000 kg)',
      distanciaKm: 168.0,
    },
    {
      id: 5,
      descripcion: 'Maquinaria Agrícola e Implementos',
      tipoCarga: 'Carga Indivisible',
      origen: 'Armstrong (Parque Industrial)',
      origenCoords: [-32.7833, -61.6000],
      destino: 'Venado Tuerto (Ruta 8)',
      destinoCoords: [-33.7456, -61.9688],
      pesoTotal: 9800,
      estado: 'abierto',
      fleteroSugerido: 'Transportes Litoral (Mercedes Actros - 24.000 kg)',
      distanciaKm: 114.5,
    },
    {
      id: 6,
      descripcion: 'Envases y Embalajes Plásticos',
      tipoCarga: 'Volumen Ligero',
      origen: 'Pérez (Área Industrial)',
      origenCoords: [-32.9983, -60.7681],
      destino: 'Rafaela (Parque de Actividades)',
      destinoCoords: [-31.2526, -61.4916],
      pesoTotal: 5100,
      estado: 'en_proceso',
      fleteroSugerido: 'Lucas Ferreyra (Ford Cargo - 8.500 kg)',
      distanciaKm: 218.0,
    },
    {
      id: 7,
      descripcion: 'Carga Refrigerada de Carnes',
      tipoCarga: 'Termocontrolada (-18°C)',
      origen: 'Villa Gobernador Gálvez',
      origenCoords: [-33.0306, -60.6406],
      destino: 'San Lorenzo (Dársena Norte)',
      destinoCoords: [-32.7489, -60.7328],
      pesoTotal: 11500,
      estado: 'asignado',
      fleteroSugerido: 'Carlos Rodríguez (Scania R450 - 28.000 kg)',
      distanciaKm: 42.3,
    },
    {
      id: 8,
      descripcion: 'Harinas Especiales y Premezclas',
      tipoCarga: 'Bolsas Paletizadas',
      origen: 'Cañada de Gómez (Molino)',
      origenCoords: [-32.8167, -61.3833],
      destino: 'San Nicolás de los Arroyos',
      destinoCoords: [-33.3333, -60.2167],
      pesoTotal: 18000,
      estado: 'abierto',
      fleteroSugerido: 'Transporte Don Pedro (Semirremolque - 20.000 kg)',
      distanciaKm: 138.2,
    },
    {
      id: 9,
      descripcion: 'Repuestos Hidráulicos y Filtros',
      tipoCarga: 'Cajas Seguras',
      origen: 'Casilda (Zona Centro)',
      origenCoords: [-33.0442, -61.1681],
      destino: 'Armstrong',
      destinoCoords: [-32.7833, -61.6000],
      pesoTotal: 2800,
      estado: 'abierto',
      fleteroSugerido: 'Juan Pérez (Mercedes 1620 - 5.000 kg)',
      distanciaKm: 52.8,
    },
    {
      id: 10,
      descripcion: 'Quesos Duros y Lácteos Frescos',
      tipoCarga: 'Refrigerado (4°C)',
      origen: 'Rafaela (Cuenca Lechera)',
      origenCoords: [-31.2526, -61.4916],
      destino: 'Santa Fe Capital (Abasto)',
      destinoCoords: [-31.6333, -60.7000],
      pesoTotal: 6400,
      estado: 'completado',
      fleteroSugerido: 'Walter Benítez (Chasis con Lona - 10.000 kg)',
      distanciaKm: 98.4,
    },
    {
      id: 11,
      descripcion: 'Fertilizantes y Nutrientes Granulados',
      tipoCarga: 'Granel Químico',
      origen: 'Puerto San Lorenzo',
      origenCoords: [-32.7489, -60.7328],
      destino: 'Venado Tuerto',
      destinoCoords: [-33.7456, -61.9688],
      pesoTotal: 22000,
      estado: 'abierto',
      fleteroSugerido: 'Transportes Litoral (Mercedes Actros - 24.000 kg)',
      distanciaKm: 172.0,
    },
    {
      id: 12,
      descripcion: 'Aceite Vegetal en Tambores',
      tipoCarga: 'Carga General',
      origen: 'San Lorenzo (Aceitera)',
      origenCoords: [-32.7489, -60.7328],
      destino: 'Cañada de Gómez',
      destinoCoords: [-32.8167, -61.3833],
      pesoTotal: 7500,
      estado: 'abierto',
      fleteroSugerido: 'Lucas Ferreyra (Ford Cargo - 8.500 kg)',
      distanciaKm: 68.6,
    },
    {
      id: 13,
      descripcion: 'Ladrillos Huecos y Viguetas',
      tipoCarga: 'Materiales Construcción',
      origen: 'Rosario (Oeste)',
      origenCoords: [-32.9600, -60.7100],
      destino: 'Casilda',
      destinoCoords: [-33.0442, -61.1681],
      pesoTotal: 12300,
      estado: 'asignado',
      fleteroSugerido: 'Transporte Don Pedro (Semirremolque - 20.000 kg)',
      distanciaKm: 48.0,
    },
    {
      id: 14,
      descripcion: 'Soja y Maíz para Molienda',
      tipoCarga: 'Granel Agrícola',
      origen: 'Marcos Juárez (Límite Cba/SF)',
      origenCoords: [-32.6961, -62.1067],
      destino: 'Puerto San Lorenzo',
      destinoCoords: [-32.7489, -60.7328],
      pesoTotal: 26000,
      estado: 'en_proceso',
      fleteroSugerido: 'Carlos Rodríguez (Scania R450 - 28.000 kg)',
      distanciaKm: 156.4,
    },
    {
      id: 15,
      descripcion: 'Agroquímicos y Sanitarios',
      tipoCarga: 'Sustancias Controladas',
      origen: 'Santa Fe Capital',
      origenCoords: [-31.6333, -60.7000],
      destino: 'San Jorge',
      destinoCoords: [-31.8964, -61.8592],
      pesoTotal: 8900,
      estado: 'abierto',
      fleteroSugerido: 'Transporte El Ceibo (Volvo FH16 - 15.000 kg)',
      distanciaKm: 122.1,
    },
  ]);

  // Flota de 8 Fleteros con posiciones activas en la región
  fleteros = signal<FleteroDemo[]>([
    {
      id: 1,
      nombre: 'Juan Pérez',
      telefono: '03471-15523412',
      vehiculo: 'Mercedes Benz 1620',
      patente: 'AF123BC',
      capacidadKg: 5000,
      coords: [-32.8200, -61.3700],
      localidad: 'Cañada de Gómez',
      disponible: true,
    },
    {
      id: 2,
      nombre: 'Carlos Rodríguez',
      telefono: '0341-156789123',
      vehiculo: 'Scania R450 Bitrén',
      patente: 'AG987ZZ',
      capacidadKg: 28000,
      coords: [-32.7500, -60.7300],
      localidad: 'San Lorenzo',
      disponible: false,
    },
    {
      id: 3,
      nombre: 'Transporte El Ceibo',
      telefono: '03406-15498123',
      vehiculo: 'Volvo FH16 Acoplado',
      patente: 'AE456CD',
      capacidadKg: 15000,
      coords: [-31.9000, -61.8500],
      localidad: 'San Jorge',
      disponible: true,
    },
    {
      id: 4,
      nombre: 'Martín Gómez',
      telefono: '0341-153123456',
      vehiculo: 'Iveco Daily Térmico',
      patente: 'AD789EF',
      capacidadKg: 4000,
      coords: [-32.9100, -60.6700],
      localidad: 'Rosario Norte',
      disponible: true,
    },
    {
      id: 5,
      nombre: 'Lucas Ferreyra',
      telefono: '03464-15445566',
      vehiculo: 'Ford Cargo 1722 Chasis',
      patente: 'AC321GH',
      capacidadKg: 8500,
      coords: [-33.0400, -61.1600],
      localidad: 'Casilda',
      disponible: true,
    },
    {
      id: 6,
      nombre: 'Transportes Litoral',
      telefono: '03471-15987654',
      vehiculo: 'Mercedes Actros 2645',
      patente: 'AB654JK',
      capacidadKg: 24000,
      coords: [-32.7800, -61.6000],
      localidad: 'Armstrong',
      disponible: true,
    },
    {
      id: 7,
      nombre: 'Walter Benítez',
      telefono: '0342-154332211',
      vehiculo: 'Volkswagen Constellation',
      patente: 'AF876LM',
      capacidadKg: 10000,
      coords: [-31.6200, -60.6900],
      localidad: 'Santa Fe Capital',
      disponible: true,
    },
    {
      id: 8,
      nombre: 'Transporte Don Pedro',
      telefono: '03462-15556677',
      vehiculo: 'Renault Premium Semirremolque',
      patente: 'AE112NO',
      capacidadKg: 20000,
      coords: [-33.7400, -61.9600],
      localidad: 'Venado Tuerto',
      disponible: true,
    },
  ]);

  currentBounds = signal<MapBounds>({
    latMin: -34.0,
    latMax: -31.0,
    lngMin: -62.5,
    lngMax: -60.0,
    label: 'Toda la Región',
  });

  selectedCarga = signal<CargaDemo | null>(this.cargas()[0]);
  selectedFletero = signal<FleteroDemo | null>(null);
  popupOpen = signal<boolean>(true);
  fleteroPopupOpen = signal<boolean>(false);
  filterDrawerOpen = signal<boolean>(false);
  filterStatus = signal<string>('todos');
  syncBoundingBox = signal<boolean>(true);

  // Cargas que caen dentro del área visible del mapa
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

  // Fleteros que caen dentro del área visible del mapa
  visibleFleterosInMap = computed(() => {
    const bounds = this.currentBounds();
    return this.fleteros().filter((f) => {
      const [lat, lng] = f.coords;
      return (
        lat >= bounds.latMin &&
        lat <= bounds.latMax &&
        lng >= bounds.lngMin &&
        lng <= bounds.lngMax
      );
    });
  });

  // Cargas a renderizar en la tabla: sincronizadas con el Bounding Box de Leaflet + filtro de estado
  displayedCargas = computed(() => {
    let list = this.syncBoundingBox() ? this.visibleCargasInMap() : this.cargas();
    const status = this.filterStatus();
    if (status !== 'todos') {
      list = list.filter((c) => c.estado === status);
    }
    return list;
  });

  ngAfterViewInit(): void {
    // Timeout para garantizar que el DOM esté completamente montado y dimensionado
    setTimeout(() => {
      this.initLeafletMap();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private initLeafletMap(): void {
    const container = this.mapContainer()?.nativeElement;
    if (!container) return;

    // Inicializar mapa centrado en el corredor Santa Fe - Rosario - Cañada de Gómez
    this.map = L.map(container, {
      center: [-32.85, -61.1],
      zoom: 9,
      zoomControl: true,
      minZoom: 6,
      maxZoom: 18,
    });

    // Definición de Capas Base de alta confiabilidad
    this.tileLayers = {
      // Esri World Topo Map: relieve de elevación y topografía de altísima velocidad y estabilidad
      relieve: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: 'Tiles &copy; Esri &mdash; Fuentes: USGS, Intermap, SRTM',
      }),
      // CartoDB Dark Matter: modo oscuro contrastado
      oscuro: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      }),
      // OpenStreetMap estándar
      calles: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }),
      // Esri World Imagery (satélite)
      satelite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: 'Tiles &copy; Esri, Earthstar Geographics',
      }),
    };

    // Añadir capa inicial (Relieve Topográfico)
    this.tileLayers.relieve?.addTo(this.map);

    // Capa de marcadores y polilíneas
    this.markersLayer = L.layerGroup().addTo(this.map);

    // Escuchar eventos de movimiento y zoom para actualizar el Bounding Box en tiempo real
    this.map.on('moveend zoomend', () => {
      this.updateBoundsFromLeaflet();
    });

    // Forzar redibujado de tamaño
    setTimeout(() => {
      this.map?.invalidateSize();
      this.renderMarkersOnMap();
      this.updateBoundsFromLeaflet();
    }, 150);
  }

  changeBaseLayer(layer: BaseLayerType): void {
    if (!this.map) return;
    this.activeLayer.set(layer);

    // Remover capas existentes y agregar la elegida
    Object.values(this.tileLayers).forEach((tl) => {
      if (tl && this.map?.hasLayer(tl)) {
        this.map.removeLayer(tl);
      }
    });

    this.tileLayers[layer]?.addTo(this.map);
  }

  private updateBoundsFromLeaflet(): void {
    if (!this.map) return;
    const b = this.map.getBounds();
    const center = this.map.getCenter();

    let label = 'Toda la Región';
    if (center.lng < -61.4) {
      label = 'Zona Oeste (Cañada de Gómez / Armstrong / Cba)';
    } else if (center.lng > -60.8) {
      label = 'Zona Este (Rosario / Gran Rosario / San Lorenzo)';
    } else if (center.lat > -32.0) {
      label = 'Zona Norte (Santa Fe Capital / Rafaela)';
    } else if (center.lat < -33.4) {
      label = 'Zona Sur (Venado Tuerto / Casilda)';
    } else {
      label = 'Corredor Central Santa Fe';
    }

    this.currentBounds.set({
      latMin: b.getSouth(),
      latMax: b.getNorth(),
      lngMin: b.getWest(),
      lngMax: b.getEast(),
      label,
    });
  }

  private renderMarkersOnMap(): void {
    if (!this.markersLayer || !this.map) return;
    this.markersLayer.clearLayers();

    // Íconos personalizados usando divIcon (estables, sin bug de salto)
    const originIcon = (label: string, id: number) => L.divIcon({
      className: 'leaflet-custom-marker-wrapper',
      html: `
        <div class="leaflet-marker-pin origin-pin" title="Carga #${id}: ${label}">
          <span class="pin-dot"></span>
          <span class="pin-title">#${id} ${label}</span>
        </div>
      `,
      iconSize: [120, 36],
      iconAnchor: [12, 12],
    });

    const destIcon = (label: string, id: number) => L.divIcon({
      className: 'leaflet-custom-marker-wrapper',
      html: `
        <div class="leaflet-marker-pin dest-pin" title="Destino Carga #${id}: ${label}">
          <span class="pin-dot"></span>
          <span class="pin-title">🏁 ${label}</span>
        </div>
      `,
      iconSize: [120, 36],
      iconAnchor: [12, 12],
    });

    const truckIcon = (nombre: string, cap: number) => L.divIcon({
      className: 'leaflet-custom-marker-wrapper',
      html: `
        <div class="leaflet-marker-pin truck-pin" title="Fletero: ${nombre}">
          <span class="pin-dot"></span>
          <span class="pin-title">🚛 ${nombre} (${Math.round(cap / 1000)}t)</span>
        </div>
      `,
      iconSize: [150, 36],
      iconAnchor: [12, 12],
    });

    // 1. Renderizar todas las 15 Cargas
    this.cargas().forEach((carga) => {
      // Origen
      const originMarker = L.marker(carga.origenCoords, {
        icon: originIcon(carga.origen.split('(')[0].trim(), carga.id),
      });
      originMarker.on('click', () => this.selectCarga(carga));
      this.markersLayer?.addLayer(originMarker);

      // Destino
      const destMarker = L.marker(carga.destinoCoords, {
        icon: destIcon(carga.destino.split('(')[0].trim(), carga.id),
      });
      destMarker.on('click', () => this.selectCarga(carga));
      this.markersLayer?.addLayer(destMarker);
    });

    // 2. Renderizar los 8 Fleteros con camiones
    this.fleteros().forEach((f) => {
      const truckMarker = L.marker(f.coords, {
        icon: truckIcon(f.nombre, f.capacidadKg),
      });
      truckMarker.on('click', () => this.selectFletero(f));
      this.markersLayer?.addLayer(truckMarker);
    });

    // Trazar ruta de la carga seleccionada
    this.updateRoutePolyline();
  }

  private updateRoutePolyline(): void {
    if (!this.markersLayer) return;

    if (this.routePolyline) {
      this.markersLayer.removeLayer(this.routePolyline);
      this.routePolyline = null;
    }

    const carga = this.selectedCarga();
    if (!carga) return;

    this.routePolyline = L.polyline([carga.origenCoords, carga.destinoCoords], {
      color: '#f59e0b',
      dashArray: '8, 8',
      weight: 4,
      opacity: 0.9,
    });

    this.markersLayer.addLayer(this.routePolyline);
  }

  selectCarga(carga: CargaDemo): void {
    this.selectedCarga.set(carga);
    this.popupOpen.set(true);
    this.fleteroPopupOpen.set(false);
    this.updateRoutePolyline();

    if (this.map) {
      this.map.panTo(carga.origenCoords, { animate: true });
    }
  }

  selectFletero(f: FleteroDemo): void {
    this.selectedFletero.set(f);
    this.fleteroPopupOpen.set(true);
    this.popupOpen.set(false);

    if (this.map) {
      this.map.panTo(f.coords, { animate: true });
    }
  }

  flyToZone(zone: 'oeste' | 'centro' | 'este' | 'norte'): void {
    if (!this.map) return;
    if (zone === 'oeste') {
      // Cañada de Gómez y Armstrong
      this.map.flyTo([-32.81, -61.45], 11, { duration: 1.2 });
    } else if (zone === 'este') {
      // Rosario y Gran Rosario
      this.map.flyTo([-32.95, -60.66], 11, { duration: 1.2 });
    } else if (zone === 'norte') {
      // Santa Fe Capital y Rafaela
      this.map.flyTo([-31.50, -61.0], 9, { duration: 1.2 });
    } else {
      // Toda la región
      this.map.flyTo([-32.85, -61.1], 9, { duration: 1.2 });
    }
  }

  closePopup(): void {
    this.popupOpen.set(false);
  }

  closeFleteroPopup(): void {
    this.fleteroPopupOpen.set(false);
  }

  openFilterDrawer(): void {
    this.filterDrawerOpen.set(true);
  }

  closeFilterDrawer(): void {
    this.filterDrawerOpen.set(false);
  }

  toggleSync(): void {
    this.syncBoundingBox.update((val) => !val);
  }

  resetFilters(): void {
    this.filterStatus.set('todos');
    this.syncBoundingBox.set(true);
    this.flyToZone('centro');
    this.changeBaseLayer('relieve');
  }

  countByStatus(status: 'abierto' | 'asignado' | 'en_proceso' | 'completado'): number {
    return this.cargas().filter((c) => c.estado === status).length;
  }
}
