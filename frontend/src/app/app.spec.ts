import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('debe crear el componente principal App', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
    expect(app.title).toContain('rut.ar');
  });

  it('debe alternar el estado de la barra lateral en mobile', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.mobileSidebarOpen()).toBe(false);

    app.toggleMobileSidebar();
    expect(app.mobileSidebarOpen()).toBe(true);

    app.closeMobileSidebar();
    expect(app.mobileSidebarOpen()).toBe(false);
  });

  it('debe renderizar la estructura del shell (sidebar, header, main)', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-sidebar')).toBeTruthy();
    expect(compiled.querySelector('app-header')).toBeTruthy();
    expect(compiled.querySelector('main.app-main-content')).toBeTruthy();
  });
});
