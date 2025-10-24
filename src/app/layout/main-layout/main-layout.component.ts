import { Component, OnInit, signal, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';

// Components
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { Toast, ToastModule } from "primeng/toast";

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    FooterComponent,
    ToastModule,
    Toast,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {
  // ✅ Estado: Sidebar aberto ou fechado
  sidebarOpen = signal(false);
  currentRoute = signal('');
  isMobile = signal(false);

  private platformId = inject(PLATFORM_ID);

  constructor(private router: Router) { }

  ngOnInit() {
    // Monitor route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => (event as NavigationEnd).url)
    ).subscribe(url => {
      this.currentRoute.set(url);
    });

    // ✅ Detecta mobile e define estado inicial
    if (isPlatformBrowser(this.platformId)) {
      this.checkIfMobile();
      window.addEventListener('resize', () => this.checkIfMobile());
    }
  }

  /**
   * ✅ Detecta se é mobile e ajusta estado inicial
   */
  private checkIfMobile() {
    if (isPlatformBrowser(this.platformId)) {
      const wasMobile = this.isMobile();
      const nowMobile = window.innerWidth <= 1024;
      this.isMobile.set(nowMobile);

      // ✅ Desktop: SEMPRE ABERTO (só fecha se clicar no X)
      // ✅ Mobile: SEMPRE FECHADO (abre com hamburger)
      if (wasMobile !== nowMobile) {
        if (nowMobile) {
          // Mudou para mobile: fecha sidebar
          this.sidebarOpen.set(false);
        } else {
          // Mudou para desktop: abre sidebar
          this.sidebarOpen.set(true);
        }
      } else if (!wasMobile && !nowMobile && !this.sidebarOpen()) {
        // Primeira vez no desktop: abre sidebar
        this.sidebarOpen.set(true);
      }
    }
  }

  /**
   * ✅ Toggle sidebar (hamburger - só mobile)
   */
  toggleSidebar() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  /**
   * ✅ Fecha sidebar (botão X ou overlay)
   */
  closeSidebar() {
    this.sidebarOpen.set(false);
  }
}
