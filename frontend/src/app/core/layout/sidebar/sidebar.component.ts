import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <!-- Overlay móvil para cerrar sidebar al hacer clic afuera -->
    @if (mobileOpen()) {
      <div 
        class="sidebar-overlay" 
        (click)="closeMobile.emit()"
        (keydown.escape)="closeMobile.emit()"
        tabindex="0"
        role="button"
        aria-label="Cerrar navegación móvil"></div>
    }

    <aside class="sidebar" [class.mobile-open]="mobileOpen()">
      <!-- Brand / Logo -->
      <div class="sidebar-header">
        <div class="brand-logo">
          <div class="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 3h15v13H1z" />
              <path d="M16 8h4l3 3v5h-7V8z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-name">rut<span class="brand-highlight">.ar</span></span>
            <span class="brand-sub">Logística & Retorno</span>
          </div>
        </div>
      </div>

      <!-- Menú de Navegación -->
      <nav class="sidebar-nav">
        <div class="nav-section-title">Principal</div>

        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" (click)="closeMobile.emit()">
          <span class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
          </span>
          <span class="nav-label">Dashboard & Cargas</span>
        </a>

        <a routerLink="/matching" routerLinkActive="active" class="nav-item" (click)="closeMobile.emit()">
          <span class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
          </span>
          <span class="nav-label">Mapa & Matching</span>
        </a>

        <a routerLink="/viajes" routerLinkActive="active" class="nav-item" (click)="closeMobile.emit()">
          <span class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </span>
          <span class="nav-label">Viajes de Retorno</span>
        </a>

        <div class="nav-section-title">Gestión</div>

        <a routerLink="/fleteros" routerLinkActive="active" class="nav-item" (click)="closeMobile.emit()">
          <span class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </span>
          <span class="nav-label">Fleteros</span>
        </a>
      </nav>

      <!-- Usuario y Rol Actual -->
      <div class="sidebar-footer">
        <div class="user-card">
          <div class="user-avatar">CG</div>
          <div class="user-info">
            <div class="user-name">Operador Logístico</div>
            <div class="user-role">LOGISTICO</div>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(4px);
      z-index: 998;
    }

    .sidebar {
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      width: var(--sidebar-width);
      background-color: var(--bg-sidebar);
      border-right: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      z-index: 999;
      transition: transform 0.25s ease, width 0.25s ease;
    }

    .sidebar-header {
      padding: 1.25rem 1.2rem;
      border-bottom: 1px solid var(--border-subtle);
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, var(--color-primary), #1d4ed8);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
      flex-shrink: 0;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      white-space: nowrap;
    }

    .brand-name {
      font-size: 1.2rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text-primary);
    }

    .brand-highlight {
      color: var(--color-accent);
    }

    .brand-sub {
      font-size: 0.7rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      overflow-y: auto;
    }

    .nav-section-title {
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 0.75rem 0.6rem 0.25rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.7rem 0.85rem;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.15s ease;

      &:hover {
        background-color: rgba(255, 255, 255, 0.05);
        color: var(--text-primary);
      }

      &.active {
        background-color: var(--color-primary-light);
        color: var(--color-primary);
        font-weight: 600;
        box-shadow: inset 3px 0 0 var(--color-primary);
      }
    }

    .nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .sidebar-footer {
      padding: 1rem 0.85rem;
      border-top: 1px solid var(--border-subtle);
      background: rgba(0, 0, 0, 0.15);
    }

    .user-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      border-radius: var(--radius-md);
      background-color: var(--bg-card);
      border: 1px solid var(--border-subtle);
    }

    .user-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-accent), #d97706);
      color: #120e1e;
      font-weight: 700;
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      white-space: nowrap;
    }

    .user-name {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-primary);
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .user-role {
      font-size: 0.68rem;
      color: var(--color-accent);
      font-weight: 600;
    }

    /* Adaptaciones Responsive */
    @media (max-width: 767px) {
      .sidebar {
        transform: translateX(-100%);
        width: 260px;
      }

      .sidebar.mobile-open {
        transform: translateX(0);
      }
    }

    @media (min-width: 768px) and (max-width: 1024px) {
      .sidebar {
        width: var(--sidebar-collapsed-width);
      }

      .brand-text, .nav-label, .nav-section-title, .user-info {
        display: none;
      }

      .sidebar-header, .sidebar-footer {
        padding: 1rem 0.5rem;
        display: flex;
        justify-content: center;
      }

      .nav-item {
        justify-content: center;
        padding: 0.75rem 0;
      }
    }
  `]
})
export class SidebarComponent {
  mobileOpen = input<boolean>(false);
  closeMobile = output<void>();
}
