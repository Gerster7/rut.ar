import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CargaDemo {
  id: number;
  descripcion: string;
  tipoCarga: string;
  origen: string;
  origenCoords: [number, number];
  destino: string;
  destinoCoords: [number, number];
  pesoTotal: number;
  estado: 'abierto' | 'asignado' | 'en_proceso' | 'completado';
  fleteroSugerido?: string;
  distanciaKm: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      
      <!-- ==============================================================
           FILA SUPERIOR: MAPA (65%) + PANEL DE ACCIÓN Y DETALLE (35%)
           ============================================================== -->
      <section class="top-grid">
        
        <!-- Contenedor del Mapa -->
        <div class="map-card card">
          <div class="card-header">
            <div class="header-left">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                <line x1="8" y1="2" x2="8" y2="18" />
                <line x1="16" y1="6" x2="16" y2="22" />
              </svg>
              <h2>Monitoreo Geográfico de Cargas</h2>
            </div>
            <div class="header-actions">
              <span class="region-badge">Santa Fe &bull; Rosario</span>
            </div>
          </div>

          <!-- Lienzo / Canvas del Mapa -->
          <div class="map-viewport">
            <!-- Representación vectorial estilizada del mapa interactivo -->
            <div class="map-mockup">
              <!-- Grid Geográfico SVG -->
              <svg class="map-svg-layer" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#f59e0b" />
                    <stop offset="100%" stop-color="#10b981" />
                  </linearGradient>
                  <!-- Filtro de sombra para marcadores -->
                  <filter id="markerShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.5"/>
                  </filter>
                </defs>

                <!-- Fondo territorial provincial simplificado -->
                <path d="M 50,50 L 750,30 L 720,420 L 80,410 Z" fill="#1b2438" opacity="0.4" />
                <!-- Líneas de Rutas Principales (RN9 / AP01) -->
                <path d="M 120,380 Q 320,280 480,240 T 640,160" stroke="#334155" stroke-width="3" fill="none" />
                <path d="M 280,410 L 480,240 L 520,60" stroke="#334155" stroke-width="2" stroke-dasharray="4" fill="none" />

                <!-- Ruta de la carga seleccionada -->
                <path d="M 240,290 C 350,270 420,255 580,230" stroke="url(#routeGrad)" stroke-width="4" stroke-dasharray="6,6" fill="none" class="animated-route" />

                <!-- Marcador Origen: Cañada de Gómez -->
                <g transform="translate(240, 290)" filter="url(#markerShadow)" class="map-marker origin-marker">
                  <circle r="14" fill="#f59e0b" />
                  <circle r="6" fill="#120e1e" />
                  <text y="-20" text-anchor="middle" fill="#f8fafc" font-size="12" font-weight="600">
                    Cañada de Gómez (Origen)
                  </text>
                </g>

                <!-- Marcador Destino: Rosario -->
                <g transform="translate(580, 230)" filter="url(#markerShadow)" class="map-marker dest-marker">
                  <circle r="16" fill="#10b981" />
                  <path d="M -5,-3 L 0,-8 L 5,-3 L 2,-3 L 2,5 L -2,5 L -2,-3 Z" fill="#120e1e" />
                  <text y="-22" text-anchor="middle" fill="#f8fafc" font-size="12" font-weight="700">
                    Rosario (Destino)
                  </text>
                </g>

                <!-- Marcador de Fletero en Proximidad -->
                <g transform="translate(290, 280)" filter="url(#markerShadow)" class="map-marker truck-marker">
                  <circle r="11" fill="#3b82f6" />
                  <circle r="4" fill="#ffffff" />
                  <text y="24" text-anchor="middle" fill="#93c5fd" font-size="11" font-weight="500">
                    Camión Juan P. (a 18 km)
                  </text>
                </g>
              </svg>

              <!-- Widget flotante de telemetría del mapa -->
              <div class="map-overlay-widget">
                <div class="widget-row">
                  <span class="widget-label">Distancia Geodésica:</span>
                  <span class="widget-value">{{ selectedCarga().distanciaKm }} km (Haversine)</span>
                </div>
                <div class="widget-row">
                  <span class="widget-label">Tramo:</span>
                  <span class="widget-value">{{ selectedCarga().origen }} &rarr; {{ selectedCarga().destino }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel Lateral Derecho: Ficha y Acción Rápida -->
        <div class="detail-card card">
          <div class="card-header">
            <div class="header-left">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <h2>Detalle de Demanda</h2>
            </div>
            <span class="badge" [ngClass]="'badge-' + selectedCarga().estado">
              {{ selectedCarga().estado }}
            </span>
          </div>

          <div class="detail-body">
            <div class="detail-item main-item">
              <span class="label">Carga Seleccionada</span>
              <span class="value">{{ selectedCarga().descripcion }}</span>
              <span class="sub-value">Tipo: {{ selectedCarga().tipoCarga }}</span>
            </div>

            <div class="metrics-grid">
              <div class="metric-box">
                <span class="metric-label">Peso Requerido</span>
                <span class="metric-value">{{ selectedCarga().pesoTotal | number }} <small>kg</small></span>
              </div>
              <div class="metric-box">
                <span class="metric-label">Distancia</span>
                <span class="metric-value">{{ selectedCarga().distanciaKm }} <small>km</small></span>
              </div>
            </div>

            <div class="route-summary">
              <div class="point-step">
                <div class="step-dot origin"></div>
                <div class="step-content">
                  <span class="step-title">Punto de Carga</span>
                  <span class="step-desc">{{ selectedCarga().origen }}</span>
                </div>
              </div>
              <div class="step-connector"></div>
              <div class="point-step">
                <div class="step-dot dest"></div>
                <div class="step-content">
                  <span class="step-title">Punto de Descarga</span>
                  <span class="step-desc">{{ selectedCarga().destino }}</span>
                </div>
              </div>
            </div>

            <!-- Sugerencia del Motor de Matching -->
            <div class="matching-box">
              <div class="matching-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>Fletero Óptimo Detectado</span>
              </div>
              <div class="fletero-name">{{ selectedCarga().fleteroSugerido || 'Calculando fleteros disponibles...' }}</div>
              <div class="fletero-meta">Capacidad compatible (5.000 kg) &bull; Disponibilidad Inmediata</div>
            </div>

            <!-- Botones de Acción -->
            <div class="action-buttons">
              @if (selectedCarga().estado === 'abierto') {
                <button class="btn btn-primary w-full">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Asignar Fletero Óptimo
                </button>
              } @else {
                <button class="btn btn-secondary w-full" disabled>
                  Carga Asignada (Viaje en Curso)
                </button>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- ==============================================================
           FILA INFERIOR: TABLA DE DATOS A ANCHO COMPLETO
           ============================================================== -->
      <section class="bottom-section">
        <div class="table-container">
          <div class="table-toolbar">
            <div class="toolbar-title">
              <h3>Listado de Demandas de Transporte</h3>
              <p>Haga clic en cualquier fila para inspeccionar en el mapa y asignar fleteros</p>
            </div>
            <div class="toolbar-filters">
              <button 
                class="filter-pill" 
                [class.active]="filterStatus() === 'todos'" 
                (click)="filterStatus.set('todos')">
                Todos ({{ cargas().length }})
              </button>
              <button 
                class="filter-pill" 
                [class.active]="filterStatus() === 'abierto'" 
                (click)="filterStatus.set('abierto')">
                Abiertos ({{ countByStatus('abierto') }})
              </button>
              <button 
                class="filter-pill" 
                [class.active]="filterStatus() === 'asignado'" 
                (click)="filterStatus.set('asignado')">
                Asignados ({{ countByStatus('asignado') }})
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
                <th>Peso (kg)</th>
                <th>Distancia</th>
                <th>Estado</th>
                <th class="text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              @for (carga of filteredCargas(); track carga.id) {
                <tr 
                  [class.selected]="selectedCarga().id === carga.id"
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

    /* Grilla Superior */
    .top-grid {
      display: grid;
      grid-template-columns: 1.8fr 1fr;
      gap: 1.5rem;
      align-items: stretch;
    }

    .card-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(0, 0, 0, 0.15);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      color: var(--color-primary);

      h2 {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--text-primary);
      }
    }

    .region-badge {
      font-size: 0.75rem;
      padding: 0.25rem 0.65rem;
      border-radius: var(--radius-sm);
      background-color: rgba(255, 255, 255, 0.06);
      color: var(--text-secondary);
      font-weight: 500;
    }

    /* Viewport del Mapa */
    .map-card {
      display: flex;
      flex-direction: column;
      min-height: 440px;
    }

    .map-viewport {
      flex: 1;
      position: relative;
      background: #0f172a;
      overflow: hidden;
      display: flex;
    }

    .map-mockup {
      width: 100%;
      height: 100%;
      position: relative;
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
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.15);
      }
    }

    .map-overlay-widget {
      position: absolute;
      bottom: 1rem;
      left: 1rem;
      background: rgba(18, 14, 30, 0.9);
      backdrop-filter: blur(8px);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 0.75rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      box-shadow: var(--shadow-sm);
    }

    .widget-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
    }

    .widget-label {
      color: var(--text-muted);
    }

    .widget-value {
      color: var(--text-primary);
      font-weight: 600;
    }

    /* Panel de Detalle Derecho */
    .detail-card {
      display: flex;
      flex-direction: column;
    }

    .detail-body {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;

      .label {
        font-size: 0.75rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0.25rem;
      }

      .value {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .sub-value {
        font-size: 0.8rem;
        color: var(--text-secondary);
        margin-top: 0.15rem;
      }
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .metric-box {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
    }

    .metric-label {
      font-size: 0.7rem;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .metric-value {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--color-accent);
      margin-top: 0.2rem;

      small {
        font-size: 0.75rem;
        color: var(--text-secondary);
        font-weight: normal;
      }
    }

    .route-summary {
      background: rgba(0, 0, 0, 0.2);
      border-radius: var(--radius-md);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .point-step {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .step-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-top: 0.3rem;
      flex-shrink: 0;

      &.origin {
        background-color: var(--color-accent);
        box-shadow: 0 0 8px var(--color-accent);
      }

      &.dest {
        background-color: var(--color-success);
        box-shadow: 0 0 8px var(--color-success);
      }
    }

    .step-connector {
      width: 2px;
      height: 14px;
      background: var(--border-subtle);
      margin-left: 4px;
    }

    .step-content {
      display: flex;
      flex-direction: column;
    }

    .step-title {
      font-size: 0.7rem;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .step-desc {
      font-size: 0.85rem;
      color: var(--text-primary);
      font-weight: 500;
    }

    .matching-box {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(16, 185, 129, 0.08));
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: var(--radius-md);
      padding: 0.9rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .matching-title {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: #93c5fd;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .fletero-name {
      font-size: 0.95rem;
      font-weight: 700;
      color: #ffffff;
    }

    .fletero-meta {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .w-full {
      width: 100%;
    }

    /* Tabla de Datos Inferior */
    .bottom-section {
      width: 100%;
    }

    .table-toolbar {
      padding: 1.25rem;
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      background: rgba(0, 0, 0, 0.1);
    }

    .toolbar-title {
      h3 {
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      p {
        font-size: 0.8rem;
        color: var(--text-muted);
        margin-top: 0.15rem;
      }
    }

    .toolbar-filters {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .filter-pill {
      padding: 0.4rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--text-secondary);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-subtle);
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
      }

      &.active {
        background: var(--color-primary);
        color: #ffffff;
        border-color: var(--color-primary);
        font-weight: 600;
      }
    }

    .data-table tr {
      cursor: pointer;

      &.selected {
        background: rgba(59, 130, 246, 0.12) !important;
        border-left: 3px solid var(--color-primary);
      }
    }

    .text-right {
      text-align: right;
    }

    /* ==============================================================
       ADAPTACIONES RESPONSIVE (DSW: SM <768px, MD 768-1024px, LG >1024px)
       ============================================================== */

    @media (max-width: 1024px) {
      .top-grid {
        grid-template-columns: 1fr;
      }

      .map-card {
        min-height: 360px;
      }
    }

    @media (max-width: 767px) {
      .dashboard-container {
        padding: 1rem;
        gap: 1rem;
      }

      .map-card {
        min-height: 280px;
      }

      .table-toolbar {
        flex-direction: column;
        align-items: flex-start;
      }

      .toolbar-filters {
        width: 100%;
        overflow-x: auto;
        padding-bottom: 0.25rem;
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
      fleteroSugerido: 'Juan Pérez (Camión Mercedes 1620 - 5.000 kg)',
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

  selectedCarga = signal<CargaDemo>(this.cargas()[0]);
  filterStatus = signal<string>('todos');

  filteredCargas() {
    const status = this.filterStatus();
    if (status === 'todos') {
      return this.cargas();
    }
    return this.cargas().filter(c => c.estado === status);
  }

  selectCarga(carga: CargaDemo) {
    this.selectedCarga.set(carga);
  }

  countByStatus(status: 'abierto' | 'asignado' | 'en_proceso' | 'completado'): number {
    return this.cargas().filter(c => c.estado === status).length;
  }
}
