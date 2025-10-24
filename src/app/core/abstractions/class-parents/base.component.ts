import { Directive, inject, signal, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';
import { Subscription } from 'rxjs';

import { ToastService } from '../toast/toast.service';
import { SSRStateManager } from '../../services/ssr-state-manager.service';
import { PaginatedList } from '../../interfaces/paginated-list.interface';
import { PageState } from '../../interfaces/page-state.interface';
import { PlatformService } from '../../services/platform.service';
import { Menu } from 'primeng/menu';
import { BaseService } from './base.service';

// ✅ Função helper movida para o componente (select-expo removido - não usa expo)
function getSelectExpoSelected(): { id: string } | null {
  // TODO: Implementar lógica se necessário no futuro
  // Por enquanto retorna null (não usa expo neste sistema)
  return null;
}

@Directive()
export abstract class BaseComponent<TResponse> implements OnInit, OnDestroy {
  @ViewChild('menu') menu!: Menu;
  @ViewChild('menuHeader') menuHeader!: Menu;
  // start
  protected platform = inject(PlatformService);
  protected get isBrowser(): boolean {
    return this.platform.isBrowser();
  }
  // end

  // Injeções
  protected abstract setupComponent(): Promise<void>;
  protected router = inject(Router);
  protected route = inject(ActivatedRoute);
  protected toastService = inject(ToastService);
  protected confirmationService = inject(ConfirmationService);
  protected stateManager = inject(SSRStateManager);

  // Estados do componente (compatível com seu código atual)
  public data = signal<PaginatedList<TResponse> | null>(null);
  public loading = signal<boolean>(false);
  public error = signal<HttpErrorResponse | null>(null);
  public selectedItem: TResponse | null = null;

  // Configurações (mantém compatibilidade)
  public currentFilter: string | null = null;
  public rowsPerPageOptions = [5, 10, 20, 50];
  public items: MenuItem[] = [];
  public itemsHeader: MenuItem[] = [];

  // Estado persistente - MUDOU DE PRIVATE PARA PROTECTED
  protected routeKey: string;
  private routeSubscription?: Subscription;

  constructor(protected service: BaseService) {
    this.routeKey = this.stateManager.generateRouteKey();
  }

  async ngOnInit(): Promise<void> {
    if (this.isBrowser) {
      // Sincroniza estado inicial da URL para SessionStorage
      this.syncUrlToSessionStorage();

      // Setup inicial
      await this.setupComponent();

      // Carrega dados
      await this.loadData();

      // Observa mudanças na URL para sincronizar estado
      this.watchUrlChanges();
    }
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  /**
   * Sincroniza os query parameters da URL para o SessionStorage
   */
  private syncUrlToSessionStorage(): void {
    const queryParams = this.route.snapshot.queryParams;

    if (Object.keys(queryParams).length > 0) {
      const urlState: PageState = {
        page: queryParams['page'] ? parseInt(queryParams['page'], 10) : 1,
        size: queryParams['size'] ? parseInt(queryParams['size'], 10) : 5,
        search: queryParams['search'] || undefined,
        filters: queryParams['filters'] ? JSON.parse(queryParams['filters']) : undefined,
        sort: queryParams['sortField'] && queryParams['sortDirection'] ? {
          field: queryParams['sortField'],
          direction: parseInt(queryParams['sortDirection'], 10) as 1 | -1
        } : undefined
      };

      this.stateManager.savePageState(this.routeKey, urlState);
    }
  }

  /**
   * Atualiza a URL com o estado atual do SessionStorage
   */
  private async updateUrlFromState(state: PageState): Promise<void> {
    const queryParams: any = {};

    if (state.page !== 1) queryParams.page = state.page;
    if (state.size !== 5) queryParams.size = state.size;
    if (state.search) queryParams.search = state.search;
    if (state.filters && Object.keys(state.filters).length > 0) {
      queryParams.filters = JSON.stringify(state.filters);
    }
    if (state.sort) {
      queryParams.sortField = state.sort.field;
      queryParams.sortDirection = state.sort.direction;
    }

    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'replace'
    });
  }

  async loadData(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    if (this.isBrowser) {
      try {
        // Obtém estado atual
        const state = this.stateManager.getPageState(this.routeKey);
        const searchParams = this.stateManager.pageStateToSearch(state);

        // Faz a busca
        const result = await this.service.search<TResponse>(searchParams);
        this.data.set(result);

      } catch (err) {
        this.error.set(err as HttpErrorResponse);
        this.toastService.showError('Erro', 'Falha ao carregar dados');
      } finally {
        this.loading.set(false);
      }
    }
  }

  async search(searchText?: string | any): Promise<void> {
    const currentState = this.stateManager.getPageState(this.routeKey);
    const newState: PageState = {
      ...currentState,
      search: searchText || undefined,
      page: 1 // Reset para primeira página
    };

    this.stateManager.savePageState(this.routeKey, newState);
    await this.updateUrlFromState(newState);
    await this.loadData();
  }

  async filterByCustom(filterValue: string | null): Promise<void> {
    this.currentFilter = filterValue;

    const currentState = this.stateManager.getPageState(this.routeKey);
    const newState: PageState = {
      ...currentState,
      filters: filterValue ? { status: filterValue } : undefined,
      page: 1
    };

    this.stateManager.savePageState(this.routeKey, newState);
    await this.updateUrlFromState(newState);
    await this.loadData();
  }

  async customSort(event: any): Promise<void> {
    const currentState = this.stateManager.getPageState(this.routeKey);
    const isCurrentField = currentState.sort?.field === event.field;
    const newDirection = isCurrentField ?
      (currentState.sort?.direction === 1 ? -1 : 1) : 1;

    const newState: PageState = {
      ...currentState,
      sort: {
        field: event.field,
        direction: newDirection as 1 | -1
      }
    };

    this.stateManager.savePageState(this.routeKey, newState);
    await this.updateUrlFromState(newState);
    await this.loadData();
  }

  async onPageChange(event: PaginatorState): Promise<void> {
    const page = (event.page || 0) + 1;
    const size = event.rows || 5;

    const currentState = this.stateManager.getPageState(this.routeKey);
    const newState: PageState = {
      ...currentState,
      page,
      size
    };

    this.stateManager.savePageState(this.routeKey, newState);
    await this.updateUrlFromState(newState);
    await this.loadData();
  }

  public min(a: number, b: number): number {
    return Math.min(a, b);
  }

  public get totalItems(): number {
    if (this.data == null) return 0;
    return this.data()?.totalItens || 0;
  }

  public get currentPage(): number {
    return this.stateManager.getPageState(this.routeKey).page;
  }

  public get numberOfRows(): number {
    return this.stateManager.getPageState(this.routeKey).size;
  }

  private watchUrlChanges(): void {
    this.routeSubscription = this.route.queryParams.subscribe(async (params) => {
      // Quando a URL muda (ex: botão voltar do navegador), sincroniza com SessionStorage
      const currentUrlState: PageState = {
        page: params['page'] ? parseInt(params['page'], 10) : 1,
        size: params['size'] ? parseInt(params['size'], 10) : 5,
        search: params['search'] || undefined,
        filters: params['filters'] ? JSON.parse(params['filters']) : undefined,
        sort: params['sortField'] && params['sortDirection'] ? {
          field: params['sortField'],
          direction: parseInt(params['sortDirection'], 10) as 1 | -1
        } : undefined
      };

      const currentSessionState = this.stateManager.getPageState(this.routeKey);

      // Se o estado da URL é diferente do SessionStorage, atualiza e recarrega
      if (JSON.stringify(currentUrlState) !== JSON.stringify(currentSessionState)) {
        this.stateManager.savePageState(this.routeKey, currentUrlState);
        await this.loadData();
      }
    });
  }

  // Métodos compatíveis que podem ser sobrescritos
  protected setItems(items: MenuItem[]): void {
    this.items = items;
  }

  protected setItemsHeader(items: MenuItem[]): void {
    this.itemsHeader = items;
  }

  protected getMenu(): Menu {
    return this.menu;
  }

  // Mantém compatibilidade com getMenuHeader()  
  protected getMenuHeader(): Menu {
    return this.menuHeader;
  }

  public openMenu(entity: TResponse, event: Event): void {
    this.selectedItem = entity;
    this.menu.toggle(event);
  }

  public openHeaderMenu(event: Event): void {
    this.menuHeader.toggle(event);
  }
}