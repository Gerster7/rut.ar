import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="app-footer">
      <div class="footer-content">
        <div class="footer-brand">
          <strong>rut.ar</strong> &mdash; Plataforma de Optimización Logística y Retorno Vacío
        </div>
        <div class="footer-meta">
          <span>Desarrollo de Software (DSW) &bull; UTN FRRo</span>
          <span class="separator">|</span>
          <span>Legajo: <strong>43855</strong></span>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .app-footer {
      padding: 1.25rem 1.5rem;
      border-top: 1px solid var(--border-subtle);
      background-color: var(--bg-sidebar);
      color: var(--text-muted);
      font-size: 0.8rem;
    }

    .footer-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
      max-width: 1600px;
      margin: 0 auto;
    }

    .footer-brand strong {
      color: var(--text-secondary);
    }

    .footer-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .separator {
      color: var(--border-subtle);
    }

    @media (max-width: 767px) {
      .app-footer {
        padding: 1rem;
        text-align: center;
      }

      .footer-content {
        flex-direction: column;
        justify-content: center;
      }
    }
  `]
})
export class FooterComponent {}
