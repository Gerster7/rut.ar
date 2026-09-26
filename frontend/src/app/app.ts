import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './core/layout/sidebar/sidebar.component';
import { HeaderComponent } from './core/layout/header/header.component';
import { FooterComponent } from './core/layout/footer/footer.component';
import { BottomTabsComponent } from './core/layout/bottom-tabs/bottom-tabs.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    FooterComponent,
    BottomTabsComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  title = 'rut.ar - Plataforma Logística';
  mobileSidebarOpen = signal<boolean>(false);

  toggleMobileSidebar() {
    this.mobileSidebarOpen.update((open) => !open);
  }

  closeMobileSidebar() {
    this.mobileSidebarOpen.set(false);
  }
}
