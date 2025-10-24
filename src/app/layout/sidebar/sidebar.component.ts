import { Component, OnInit, output, signal, effect, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

// PrimeNG
import { ButtonModule } from 'primeng/button';

// Services
import { AuthService } from '../../core/services/auth/auth.service';
import { TranslationService } from '../../core/services/translation.service';

// Pipes
import { TranslatePipe } from '../../core/pipes/translate.pipe';

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
  responsibilities: string[];
  children?: NavigationItem[];
  route?: string;
  expanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TranslatePipe
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  // ✅ Input: Recebe estado de visibilidade do pai
  isOpen = input.required<boolean>();

  // ✅ Input: Recebe se é mobile ou não
  isMobile = input.required<boolean>();

  // ✅ Output: Notifica quando deve fechar
  closeRequest = output<void>();

  // ✅ State
  navigationItems = signal<NavigationItem[]>([]);
  currentRoute = signal<string>('');

  private router = inject(Router);
  private authService = inject(AuthService);
  private translationService = inject(TranslationService);

  constructor() {
    // 🔄 Effect que reage a mudanças no usuário autenticado
    effect(() => {
      const user = this.authService.user();
      if (user) {
        this.setupNavigation();
      }
    });

    // 🌍 Effect que reage a mudanças de idioma
    effect(() => {
      const translations = this.translationService.translations();
      if (Object.keys(translations).length > 0 && this.authService.user()) {
        this.setupNavigation();
      }
    });
  }

  ngOnInit() {
    // ✅ Pega rota ANTES de configurar navegação
    this.currentRoute.set(this.router.url);

    // ✅ Chama setupNavigation se usuário já estiver logado
    // (necessário porque effect pode executar antes de currentRoute ser setado)
    const user = this.authService.user();
    if (user) {
      this.setupNavigation();
    }

    // ✅ Monitora mudanças de rota
    this.trackCurrentRoute();
  }

  /**
   * 🧭 Monitora rota atual para destacar item ativo
   */
  private trackCurrentRoute() {
    // Monitora mudanças
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute.set(event.url);
      this.expandActiveGroup(); // ✅ Expande grupo ativo ao navegar
    });
  }

  /**
   * ✅ Expande automaticamente o grupo que contém a rota ativa
   */
  private expandActiveGroup() {
    const currentUrl = this.currentRoute();
    const items = this.navigationItems();

    const updatedItems = items.map(item => {
      // Se o grupo tem filhos, verifica se algum está ativo
      if (item.children && item.children.length > 0) {
        const hasActiveChild = item.children.some(child => {
          if (!child.route) return false;
          return currentUrl.startsWith(child.route);
        });

        // ✅ Se tem filho ativo, GARANTE que está expandido
        if (hasActiveChild) {
          return { ...item, expanded: true };
        }

        // ✅ Se NÃO tem filho ativo, PRESERVA estado atual (não colapsa automaticamente)
        return item;
      }

      return item;
    });

    this.navigationItems.set(updatedItems);
  }

  private setupNavigation() {
    const currentUrl = this.currentRoute(); // ✅ Pega rota atual
    const currentLang = this.translationService.getCurrentLanguage(); // ✅ Pega idioma atual

    const navigation: NavigationItem[] = [
      {
        id: 'dashboard',
        label: this.translationService.translate('menu.dashboard'),
        icon: 'pi pi-chart-line',
        responsibilities: ["ADMIN", "USER"],
        route: `/${currentLang}/dashboard`, // ✅ Inclui idioma
      },
      {
        id: "admin",
        label: this.translationService.translate('menu.admin'),
        icon: "pi pi-shield",
        // ✅ NÃO define expanded aqui, deixa undefined para ser calculado
        responsibilities: ["ADMIN"],
        children: [
          {
            id: 'admin-users',
            label: this.translationService.translate('menu.users'),
            icon: 'pi pi-users',
            route: `/${currentLang}/users`, // ✅ Inclui idioma
            responsibilities: ["ADMIN"],
          },
        ],
      },
      {
        id: "clients",
        label: this.translationService.translate('menu.clients'),
        icon: "pi pi-briefcase",
        responsibilities: ["ADMIN", "USER"],
        route: `/${currentLang}/clients` // ✅ Inclui idioma
      },
    ];

    // ✅ Filtra por roles
    const filteredNavigation = this.filterNavigationByRoles(navigation);

    // ✅ Expande grupos que têm rota ativa
    const expandedNavigation = filteredNavigation.map(item => {
      if (item.children && item.children.length > 0) {
        const hasActiveChild = item.children.some(child => {
          if (!child.route) return false;
          return currentUrl.startsWith(child.route);
        });

        if (hasActiveChild) {
          return { ...item, expanded: true };
        }
      }
      return item;
    });

    this.navigationItems.set(expandedNavigation);
  }

  private filterNavigationByRoles(items: NavigationItem[]): NavigationItem[] {
    const userRoles = this.authService.getUserRoles();
    const userRolesUpperCase = userRoles.map(role => role.toUpperCase());

    return items
      .filter(item => {
        const hasAccess = item.responsibilities.some(role =>
          userRolesUpperCase.includes(role.toUpperCase())
        );
        return hasAccess;
      })
      .map(item => {
        if (item.children && item.children.length > 0) {
          const filteredChildren = this.filterNavigationByRoles(item.children);
          return { ...item, children: filteredChildren };
        }
        return item;
      });
  }

  /**
   * ✅ Toggle de grupo (abre/fecha children)
   */
  toggleGroup(groupId: string) {
    const items = this.navigationItems();
    const updatedItems = items.map(item => {
      if (item.id === groupId) {
        return { ...item, expanded: !item.expanded };
      }
      return item;
    });

    this.navigationItems.set(updatedItems);
  }

  /**
   * ✅ Navega e FECHA o sidebar (SÓ NO MOBILE)
   */
  navigateTo(route: string) {
    this.router.navigate([route]);

    // ✅ Só fecha o sidebar no MOBILE
    if (this.isMobile()) {
      // Pequeno delay para animação da rota antes de fechar
      setTimeout(() => this.closeRequest.emit(), 150);
    }
    // ✅ No DESKTOP, não fecha (mantém sidebar aberto)
  }

  /**
   * ✅ Verifica se rota está ativa (remove idioma da URL para comparação)
   */
  isRouteActive(route?: string): boolean {
    if (!route) return false;
    const currentUrl = this.currentRoute();
    // Remove idioma da URL para comparação limpa
    const urlWithoutLang = currentUrl.replace(/^\/(pt-br|en-us|es-es)/, '');
    const routeWithoutLang = route.replace(/^\/(pt-br|en-us|es-es)/, '');
    return urlWithoutLang.startsWith(routeWithoutLang);
  }

  /**
   * ✅ Verifica se grupo tem rota ativa
   */
  isGroupActive(item: NavigationItem): boolean {
    if (item.route && this.isRouteActive(item.route)) {
      return true;
    }
    if (item.children) {
      return item.children.some(child => this.isRouteActive(child.route));
    }
    return false;
  }

  /**
   * ✅ Logout
   */
  logout() {
    this.authService.logout();
  }
}
