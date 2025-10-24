import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { PlatformService } from '../../core/services/platform.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

// ========================================
// INTERFACES
// ========================================
interface StatCard {
  title: string;
  value: string;
  icon: string;
  change: number;
  iconClass: string;
}

interface Order {
  id: string;
  client: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'delivered';
}

interface Activity {
  time: string;
  description: string;
  icon: string;
  iconClass: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    SkeletonModule,
    TableModule,
    ChartModule,
    TranslatePipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  // ========================================
  // INJEÇÕES
  // ========================================
  private platform = inject(PlatformService);
  public translationService = inject(TranslationService);

  // ========================================
  // SIGNALS
  // ========================================
  public loading = signal<boolean>(true);
  public statsCards = signal<StatCard[]>([]);
  public recentOrders = signal<Order[]>([]);
  public recentActivities = signal<Activity[]>([]);
  public salesChartData = signal<any>(null);
  public categoriesChartData = signal<any>(null);
  public chartOptions = signal<any>(null);

  // ========================================
  // COMPUTED PROPERTIES
  // ========================================
  get isBrowser(): boolean {
    return this.platform.isBrowser();
  }

  // ========================================
  // CONSTRUCTOR
  // ========================================
  constructor() {
    // Effect para atualizar gráficos quando idioma mudar (APENAS NO BROWSER)
    effect(() => {
      if (this.isBrowser) {
        const translations = this.translationService.translations();
        if (Object.keys(translations).length > 0) {
          this.initializeCharts();
        }
      }
    });
  }

  // ========================================
  // LIFECYCLE
  // ========================================
  async ngOnInit(): Promise<void> {
    // Carrega traduções
    await this.translationService.loadFeatureTranslations('dashboard');

    // ⚠️ SSR: Só carrega dados no browser
    if (this.isBrowser) {
      this.loadMockData();
    }
  }

  // ========================================
  // LOAD MOCK DATA
  // ========================================
  private loadMockData(): void {
    setTimeout(() => {
      this.loadStatsCards();
      this.loadRecentOrders();
      this.loadRecentActivities();
      this.initializeCharts();
      this.loading.set(false);
    }, 500);
  }

  // ========================================
  // STATS CARDS
  // ========================================
  private loadStatsCards(): void {
    this.statsCards.set([
      {
        title: 'dashboard.stats.totalSales',
        value: '1,542',
        icon: 'pi-shopping-cart',
        change: 12.5,
        iconClass: 'blue'
      },
      {
        title: 'dashboard.stats.totalClients',
        value: '342',
        icon: 'pi-users',
        change: 8.2,
        iconClass: 'green'
      },
      {
        title: 'dashboard.stats.totalOrders',
        value: '856',
        icon: 'pi-box',
        change: -3.1,
        iconClass: 'yellow'
      },
      {
        title: 'dashboard.stats.totalRevenue',
        value: 'R$ 45.280',
        icon: 'pi-dollar',
        change: 15.3,
        iconClass: 'red'
      }
    ]);
  }

  // ========================================
  // RECENT ORDERS
  // ========================================
  private loadRecentOrders(): void {
    this.recentOrders.set([
      { id: '#ORD-001', client: 'João Silva', date: '2024-01-15', total: 1250.00, status: 'completed' },
      { id: '#ORD-002', client: 'Maria Santos', date: '2024-01-15', total: 890.50, status: 'processing' },
      { id: '#ORD-003', client: 'Pedro Oliveira', date: '2024-01-14', total: 2100.00, status: 'delivered' },
      { id: '#ORD-004', client: 'Ana Costa', date: '2024-01-14', total: 450.00, status: 'pending' },
      { id: '#ORD-005', client: 'Carlos Lima', date: '2024-01-13', total: 1800.00, status: 'completed' }
    ]);
  }

  // ========================================
  // RECENT ACTIVITIES
  // ========================================
  private loadRecentActivities(): void {
    this.recentActivities.set([
      { time: '5 min atrás', description: 'Novo pedido #ORD-001 criado', icon: 'pi-shopping-cart', iconClass: 'blue' },
      { time: '15 min atrás', description: 'Cliente João Silva cadastrado', icon: 'pi-user-plus', iconClass: 'green' },
      { time: '1 hora atrás', description: 'Pedido #ORD-002 foi entregue', icon: 'pi-check-circle', iconClass: 'green' },
      { time: '2 horas atrás', description: 'Produto "Notebook" atualizado', icon: 'pi-pencil', iconClass: 'yellow' },
      { time: '3 horas atrás', description: 'Nova venda de R$ 1.250,00', icon: 'pi-dollar', iconClass: 'red' }
    ]);
  }

  // ========================================
  // INITIALIZE CHARTS
  // ========================================
  private initializeCharts(): void {
    // ⚠️ SSR: Só executa no browser
    if (!this.isBrowser) return;

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    // Sales Chart (Line)
    this.salesChartData.set({
      labels: [
        this.translationService.translate('dashboard.months.jul'),
        this.translationService.translate('dashboard.months.aug'),
        this.translationService.translate('dashboard.months.sep'),
        this.translationService.translate('dashboard.months.oct'),
        this.translationService.translate('dashboard.months.nov'),
        this.translationService.translate('dashboard.months.dec')
      ],
      datasets: [
        {
          label: this.translationService.translate('dashboard.charts.revenue'),
          data: [28000, 32000, 29000, 35000, 38000, 45000],
          fill: true,
          borderColor: documentStyle.getPropertyValue('--blue-500'),
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        },
        {
          label: this.translationService.translate('dashboard.charts.orders'),
          data: [420, 480, 450, 520, 580, 650],
          fill: true,
          borderColor: documentStyle.getPropertyValue('--green-500'),
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4
        }
      ]
    });

    // Categories Chart (Doughnut)
    this.categoriesChartData.set({
      labels: [
        this.translationService.translate('dashboard.categories.electronics'),
        this.translationService.translate('dashboard.categories.clothing'),
        this.translationService.translate('dashboard.categories.food'),
        this.translationService.translate('dashboard.categories.books'),
        this.translationService.translate('dashboard.categories.toys')
      ],
      datasets: [
        {
          data: [35, 25, 20, 12, 8],
          backgroundColor: [
            documentStyle.getPropertyValue('--blue-500'),
            documentStyle.getPropertyValue('--green-500'),
            documentStyle.getPropertyValue('--yellow-500'),
            documentStyle.getPropertyValue('--red-500'),
            documentStyle.getPropertyValue('--purple-500')
          ],
          hoverBackgroundColor: [
            documentStyle.getPropertyValue('--blue-400'),
            documentStyle.getPropertyValue('--green-400'),
            documentStyle.getPropertyValue('--yellow-400'),
            documentStyle.getPropertyValue('--red-400'),
            documentStyle.getPropertyValue('--purple-400')
          ]
        }
      ]
    });

    // Chart Options
    this.chartOptions.set({
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder
          }
        }
      }
    });
  }

  // ========================================
  // HELPERS
  // ========================================
  getStatusClass(status: string): string {
    const classes: any = {
      pending: 'status-badge pending',
      processing: 'status-badge processing',
      completed: 'status-badge completed',
      cancelled: 'status-badge cancelled',
      delivered: 'status-badge delivered'
    };
    return classes[status] || 'status-badge';
  }

  getStatusIcon(status: string): string {
    const icons: any = {
      pending: 'pi-clock',
      processing: 'pi-spinner',
      completed: 'pi-check-circle',
      cancelled: 'pi-times-circle',
      delivered: 'pi-check'
    };
    return icons[status] || 'pi-circle';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}
