import { Component, output } from '@angular/core';

@Component({
  selector: 'app-header',
  template: `
    <header class="topbar">
      <div class="topbar-left">
        <!-- Toggle Hamburguesa para Mobile -->
        <button class="menu-btn" (click)="toggleSidebar.emit()" aria-label="Abrir Menú">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div class="topbar-title-wrap">
          <h1 class="page-title">Centro de Operaciones Logísticas</h1>
          <span class="page-subtitle">Monitoreo de Cargas y Retorno Vacío</span>
        </div>
      </div>

      <div class="topbar-right">
        <!-- Badge de Estado de Conexión -->
        <div class="system-status">
          <span class="status-dot"></span>
          <span class="status-text">Backend API Conectado</span>
        </div>

        <button class="btn btn-primary btn-sm create-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span class="btn-text">Nueva Carga</span>
        </button>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      height: var(--topbar-height);
      background-color: var(--bg-topbar);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      position: sticky;
      top: 0;
      z-index: 900;
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .menu-btn {
      display: none;
      color: var(--text-primary);
      padding: 0.5rem;
      border-radius: var(--radius-sm);
      background: rgba(255, 255, 255, 0.05);

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }

    .topbar-title-wrap {
      display: flex;
      flex-direction: column;
    }

    .page-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.2;
    }

    .page-subtitle {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .system-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      background-color: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.25);
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--color-success);
      box-shadow: 0 0 8px var(--color-success);
    }

    .status-text {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-success);
    }

    /* Adaptación Responsive */
    @media (max-width: 767px) {
      .topbar {
        padding: 0 1rem;
      }

      .menu-btn {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .page-subtitle, .system-status {
        display: none;
      }

      .page-title {
        font-size: 0.95rem;
      }

      .create-btn .btn-text {
        display: none;
      }
    }
  `]
})
export class HeaderComponent {
  toggleSidebar = output<void>();
}
