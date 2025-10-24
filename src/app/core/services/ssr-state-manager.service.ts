import { Injectable, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PlatformService } from '../services/platform.service';
import { PageState } from '../interfaces/page-state.interface';

@Injectable({
  providedIn: 'root'
})
export class SSRStateManager {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platform = inject(PlatformService);

  private readonly DEFAULT_STATE: PageState = {
    page: 1,
    size: 10
  };

  /**
   * Obtém o estado atual da página combinando URL e SessionStorage
   * SSR-Safe: funciona no servidor e no browser
   */
  getPageState(routeKey: string): PageState {
    // 1. Primeiro tenta obter da URL (prioridade máxima)
    const urlState = this.getStateFromUrl();
    
    // 2. Se não tem na URL e está no browser, tenta SessionStorage
    const storageState = this.platform.isBrowser() 
      ? this.getStateFromStorage(routeKey)
      : null;

    // 3. Combina os estados com fallback para padrão
    return {
      ...this.DEFAULT_STATE,
      ...storageState,
      ...urlState // URL sempre sobrescreve storage
    };
  }

  /**
   * Salva o estado na URL e SessionStorage (se browser)
   */
  savePageState(routeKey: string, state: PageState): void {
    // 1. Sempre salva na URL para compatibilidade SSR
    this.saveStateToUrl(state);
    
    // 2. Se está no browser, salva também no SessionStorage
    if (this.platform.isBrowser()) {
      this.saveStateToStorage(routeKey, state);
    }
  }

  /**
   * Limpa o estado salvo (útil para reset)
   */
  clearPageState(routeKey: string): void {
    // Remove da URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });

    // Remove do storage se browser
    if (this.platform.isBrowser()) {
      sessionStorage.removeItem(`page_state_${routeKey}`);
    }
  }

  /**
   * Extrai estado dos query parameters da URL
   */
  private getStateFromUrl(): Partial<PageState> {
    const queryParams = this.route.snapshot.queryParams;
    const state: Partial<PageState> = {};

    // Page
    if (queryParams['page']) {
      const page = parseInt(queryParams['page'], 10);
      if (page > 0) state.page = page;
    }

    // Size
    if (queryParams['size']) {
      const size = parseInt(queryParams['size'], 10);
      if (size > 0) state.size = size;
    }

    // Search
    if (queryParams['search']) {
      state.search = queryParams['search'];
    }

    // Sort
    if (queryParams['sort']) {
      const [field, direction] = queryParams['sort'].split(':');
      if (field) {
        state.sort = {
          field,
          direction: direction === 'desc' ? -1 : 1
        };
      }
    }

    // Filters (JSON encoded)
    if (queryParams['filters']) {
      try {
        state.filters = JSON.parse(queryParams['filters']);
      } catch (e) {
        console.warn('Invalid filters in URL:', queryParams['filters']);
      }
    }

    return state;
  }

  /**
   * Obtém estado do SessionStorage (SSR-safe)
   */
  private getStateFromStorage(routeKey: string): PageState | null {
    try {
      const stored = sessionStorage.getItem(`page_state_${routeKey}`);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.warn('Failed to parse stored state:', e);
      return null;
    }
  }

  /**
   * Salva estado na URL como query parameters
   */
  private saveStateToUrl(state: PageState): void {
    const queryParams: Record<string, string> = {};

    // Page (só adiciona se diferente do padrão)
    if (state.page !== this.DEFAULT_STATE.page) {
      queryParams['page'] = state.page.toString();
    }

    // Size (só adiciona se diferente do padrão)  
    if (state.size !== this.DEFAULT_STATE.size) {
      queryParams['size'] = state.size.toString();
    }

    // Search
    if (state.search) {
      queryParams['search'] = state.search;
    }

    // Sort
    if (state.sort) {
      const direction = state.sort.direction === -1 ? 'desc' : 'asc';
      queryParams['sort'] = `${state.sort.field}:${direction}`;
    }

    // Filters (encode como JSON)
    if (state.filters && Object.keys(state.filters).length > 0) {
      queryParams['filters'] = JSON.stringify(state.filters);
    }

    // Atualiza URL sem recarregar página
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'replace',
      replaceUrl: true
    });
  }

  /**
   * Salva estado no SessionStorage
   */
  private saveStateToStorage(routeKey: string, state: PageState): void {
    try {
      sessionStorage.setItem(`page_state_${routeKey}`, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save state to storage:', e);
    }
  }

  /**
   * Gera uma chave única para a rota atual
   */
  generateRouteKey(): string {
    const urlTree = this.router.parseUrl(this.router.url);
    const path = urlTree.root.children['primary']?.segments.map(s => s.path).join('/') || 'root';
    return path.replace(/[^a-zA-Z0-9]/g, '_');
  }

  /**
   * Converte PageState para Search (compatibilidade com seu sistema)
   */
  pageStateToSearch(state: PageState): any {
    return {
      pageNumber: state.page,
      pageSize: state.size,
      searchText: state.search,
      columnName: state.sort?.field,
      ascDes: state.sort?.direction,
      customFilter: state.filters
    };
  }

  /**
   * Converte Search para PageState (compatibilidade com seu sistema)
   */
  searchToPageState(search: any): PageState {
    return {
      page: search.pageNumber || 1,
      size: search.pageSize || 10,
      search: search.searchText,
      sort: search.columnName ? {
        field: search.columnName,
        direction: search.ascDes || 1
      } : undefined,
      filters: search.customFilter
    };
  }
}