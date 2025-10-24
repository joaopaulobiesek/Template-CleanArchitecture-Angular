import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MenuModule } from 'primeng/menu';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BaseComponent } from '../../core/abstractions/class-parents/base.component';
import { ClientService } from './services/client.service';
import { Client } from '../../core/models/client.model';
import { SearchDebounceComponent } from '../../shared/components/search-debounce/search-debounce.component';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';

/**
 * 👥 CLIENTS COMPONENT
 *
 * Componente de listagem de clientes com:
 * - Paginação automática
 * - Filtros com URL sync
 * - Ordenação (sort)
 * - CRUD (Create, Read, Update, Delete)
 * - SSR (Server-Side Rendering)
 * - Estados de loading/erro
 * - I18N (Internacionalização)
 */
@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    PaginatorModule,
    ToastModule,
    ConfirmDialogModule,
    MenuModule,
    SearchDebounceComponent,
    TranslatePipe
  ],
  providers: [
    ConfirmationService,
    MessageService,
  ]
})
export class ClientsComponent extends BaseComponent<Client> {

  // ========================================
  // CONSTRUCTOR
  // ========================================
  constructor() {
    const clientService = inject(ClientService);
    super(clientService); // ⚠️ CRÍTICO: Passa service para BaseComponent
  }

  // ========================================
  // INJEÇÕES
  // ========================================
  private clientService = inject(ClientService);
  public translationService = inject(TranslationService); // ✅ Public para usar no template

  // ========================================
  // SETUP COMPONENT (Inicialização)
  // ========================================
  protected async setupComponent(): Promise<void> {
    // ⚠️ CRÍTICO: Aguarda traduções carregarem ANTES de configurar menu
    await this.translationService.loadFeatureTranslations('clients');

    // Configurar menu de ações (agora com traduções carregadas)
    this.setupMenuItems();
  }

  // ========================================
  // MENU DE AÇÕES (Editar/Deletar/Desativar)
  // ========================================
  private setupMenuItems(): void {
    // Menu de ações por linha (botão ... na tabela)
    this.setItems([
      {
        label: this.translationService.translate('common.actions'),
        items: [
          {
            label: this.translationService.translate('common.edit'),
            icon: 'pi pi-pencil',
            command: () => this.editClient()
          },
          {
            separator: true
          },
          {
            label: this.translationService.translate('common.delete'),
            icon: 'pi pi-trash',
            command: () => this.deleteClient(),
            styleClass: 'menu-item-danger'
          }
        ]
      }
    ]);

    // Menu de ações do header (ações em lote)
    this.setItemsHeader([
      {
        label: this.translationService.translate('common.actions'),
        items: [
          {
            label: this.translationService.translate('common.export'),
            icon: 'pi pi-download',
            command: () => this.exportClients()
          }
        ]
      }
    ]);
  }

  // ========================================
  // CRUD METHODS
  // ========================================
  private editClient(): void {
    if (!this.selectedItem) return;

    // Navega para página de edição com idioma
    const currentLang = this.translationService.getCurrentLanguage();
    this.router.navigate(['/', currentLang, 'clients', this.selectedItem.id, 'edit']);
  }

  private deactivateClient(): void {
    if (!this.selectedItem) return;

    this.confirmationService.confirm({
      message: `Deseja realmente desativar o cliente "${this.selectedItem.fullName}"?`,
      header: 'Confirmar Desativação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, desativar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          const result = await this.clientService.deactivate(
            this.selectedItem!.id,
            {
              successMessage: {
                title: 'Sucesso',
                message: 'Cliente desativado com sucesso!'
              },
              errorMessage: {
                title: 'Erro',
                message: 'Falha ao desativar cliente'
              }
            }
          );

          if (result.success) {
            await this.loadData(); // Recarrega lista
          }
        } catch (error) {
          console.error('Erro ao desativar cliente:', error);
        }
      }
    });
  }

  private deleteClient(): void {
    if (!this.selectedItem) return;

    this.confirmationService.confirm({
      message: `Deseja realmente excluir permanentemente o cliente "${this.selectedItem.fullName}"? Esta ação não pode ser desfeita!`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        try {
          const result = await this.clientService.delete(
            this.selectedItem!.id,
            {
              successMessage: {
                title: 'Sucesso',
                message: 'Cliente excluído com sucesso!'
              },
              errorMessage: {
                title: 'Erro',
                message: 'Falha ao excluir cliente'
              }
            }
          );

          if (result.success) {
            await this.loadData(); // Recarrega lista
          }
        } catch (error) {
          console.error('Erro ao excluir cliente:', error);
        }
      }
    });
  }

  private exportClients(): void {
    this.toastService.showInfo('Info', 'Exportação em desenvolvimento');
  }

  // ========================================
  // HELPERS (Formatação)
  // ========================================
  formatPhone(phone: string): string {
    if (!phone) return '-';
    // Formata telefone brasileiro: (11) 98888-8888
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
    }
    return phone;
  }

  formatDocument(doc: string): string {
    if (!doc) return '-';
    // Formata CPF: 123.456.789-00 ou CNPJ: 12.345.678/0001-00
    const cleaned = doc.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `${cleaned.substring(0, 3)}.${cleaned.substring(3, 6)}.${cleaned.substring(6, 9)}-${cleaned.substring(9)}`;
    } else if (cleaned.length === 14) {
      return `${cleaned.substring(0, 2)}.${cleaned.substring(2, 5)}.${cleaned.substring(5, 8)}/${cleaned.substring(8, 12)}-${cleaned.substring(12)}`;
    }
    return doc;
  }

  formatZipCode(zipCode: string): string {
    if (!zipCode) return '-';
    // Formata CEP: 12345-678
    const cleaned = zipCode.replace(/\D/g, '');
    if (cleaned.length === 8) {
      return `${cleaned.substring(0, 5)}-${cleaned.substring(5)}`;
    }
    return zipCode;
  }

  getStatusBadge(paid: boolean): { label: string; class: string } {
    return paid
      ? { label: 'Pago', class: 'status-badge-success' }
      : { label: 'Pendente', class: 'status-badge-warning' };
  }
}
