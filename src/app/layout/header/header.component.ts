import { Component, OnInit, signal, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

// Services
import { AuthService } from '../../core/services/auth/auth.service';
import { TranslationService } from '../../core/services/translation.service';

// Components
import { LanguageSelectorComponent } from '../../shared/components/language-selector/language-selector.component';

// Pipes
import { TranslatePipe } from '../../core/pipes/translate.pipe';

interface BreadcrumbItem {
  label: string;
  route?: string;
  active: boolean;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    LanguageSelectorComponent,
    TranslatePipe
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  public translationService = inject(TranslationService);

  // ✅ Inputs e Outputs para controle do sidebar
  sidebarOpen = input<boolean>(false);
  toggleSidebar = output<void>();

  breadcrumbs = signal<BreadcrumbItem[]>([]);
  currentUser = this.authService.user;
  currentDate = signal('');
  currentYear = new Date().getFullYear(); // Para template

  ngOnInit() {
    this.updateCurrentDate();
    this.setupBreadcrumbTracking();

    // Update date every minute
    setInterval(() => this.updateCurrentDate(), 60000);
  }

  // ✅ Emite evento para abrir/fechar sidebar
  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  private updateCurrentDate() {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };

    const dateStr = now.toLocaleDateString('pt-BR', options);
    this.currentDate.set(dateStr);
  }

  private setupBreadcrumbTracking() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateBreadcrumbs(event.url);
    });

    // Initial breadcrumb
    this.updateBreadcrumbs(this.router.url);
  }

  private updateBreadcrumbs(url: string) {
    const segments = url.split('/').filter(segment => segment);

    // Remove idioma da URL para breadcrumbs
    const lang = this.translationService.getCurrentLanguage();
    const filteredSegments = segments.filter(segment => segment !== lang);

    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', route: `/${lang}`, active: false }
    ];

    let currentPath = `/${lang}`;
    filteredSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === filteredSegments.length - 1;

      breadcrumbs.push({
        label: this.getSegmentLabel(segment),
        route: isLast ? undefined : currentPath,
        active: isLast
      });
    });

    this.breadcrumbs.set(breadcrumbs);
  }

  private getSegmentLabel(segment: string): string {
    // Remove query parameters e decode URL
    const cleanSegment = segment.split('?')[0].toLowerCase();

    const labelMap: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'documentos': 'Documentos',
      'document': 'Documentos',     // ← Adicione esta linha
      'eventos': 'Eventos',
      'financeiro': 'Financeiro',
      'administracao': 'Administração',
      'admin': 'Admin'              // ← Corrigido para 'Admin' (com maiúscula)
    };

    return labelMap[cleanSegment] || cleanSegment.charAt(0).toUpperCase() + cleanSegment.slice(1);
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user || !user.name) return 'AD';

    const names = user.name.split(' ');
    if (names.length >= 2) {
      return names[0].charAt(0) + names[names.length - 1].charAt(0);
    }
    return names[0].charAt(0) + (names[0].charAt(1) || 'D');
  }

  getUserFirstName(): string {
    const user = this.currentUser();
    if (!user || !user.name) return 'Administrador';

    return user.name.split(' ')[0] || 'Administrador';
  }

  getDisplayName(): string {
    const user = this.currentUser();
    return user?.name || 'Administrador';
  }
}