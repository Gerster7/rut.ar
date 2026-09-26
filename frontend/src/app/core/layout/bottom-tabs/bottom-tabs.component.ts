import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-bottom-tabs',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="bottom-tabs" aria-label="Navegación Móvil">
      <a routerLink="/dashboard" routerLinkActive="active" class="tab-item">
        <span class="tab-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
        </span>
        <span class="tab-label">Cargas</span>
      </a>

      <a routerLink="/matching" routerLinkActive="active" class="tab-item">
        <span class="tab-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
        </span>
        <span class="tab-label">Matching</span>
      </a>

      <a routerLink="/viajes" routerLinkActive="active" class="tab-item">
        <span class="tab-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </span>
        <span class="tab-label">Viajes</span>
      </a>

      <a routerLink="/fleteros" routerLinkActive="active" class="tab-item">
        <span class="tab-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
        </span>
        <span class="tab-label">Fleteros</span>
      </a>
    </nav>
  `,
  styles: [`
    .bottom-tabs {
      display: none;
    }

    @media (max-width: 767px) {
      .bottom-tabs {
        display: flex;
        align-items: center;
        justify-content: space-around;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 62px;
        background-color: rgba(18, 14, 30, 0.96);
        backdrop-filter: blur(16px);
        border-top: 1px solid var(--border-subtle);
        z-index: 1000;
        padding-bottom: env(safe-area-inset-bottom, 0px);
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
      }

      .tab-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.25rem;
        flex: 1;
        height: 100%;
        color: var(--text-muted);
        text-decoration: none;
        transition: color 0.15s ease, transform 0.15s ease;
        position: relative;

        &:active {
          transform: scale(0.92);
        }

        &.active {
          color: var(--color-primary);

          .tab-icon {
            color: var(--color-primary);
          }

          &::after {
            content: '';
            position: absolute;
            top: 0;
            width: 32px;
            height: 3px;
            background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
            border-radius: 0 0 4px 4px;
          }
        }
      }

      .tab-icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .tab-label {
        font-size: 0.68rem;
        font-weight: 500;
        letter-spacing: 0.02em;
      }
    }
  `]
})
export class BottomTabsComponent {}
