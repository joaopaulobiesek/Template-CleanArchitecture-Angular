import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { BaseComponent } from '../../../core/abstractions/class-parents/base.component';
import { UserResponse } from '../../../core/abstractions/http/models/response/auth/user';
import { Rule } from '../../../core/abstractions/http/models/response/user/rule.response';
import { Policy } from '../../../core/abstractions/http/models/response/user/policy.response';
import { SearchDebounceComponent } from '../../../shared/components/search-debounce/search-debounce.component';
import { RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UserDatasourceService } from '../services/user-datasource.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

// ========================================
// INTERFACES PARA REQUESTS
// ========================================
interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  roles: string[];
  policies: string[];
}

interface UpdateUserRequest {
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  roles: string[];
  policies: string[];
}

@Component({
  selector: 'app-admin-user',
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    TableModule,
    PaginatorModule,
    ToastModule,
    ConfirmDialogModule,
    MenuModule,
    DialogModule,
    InputTextModule,
    MultiSelectModule,
    ButtonModule,
    SearchDebounceComponent,
    TranslatePipe
  ],
  providers: [
    ConfirmationService,
    MessageService,
  ]
})
export class UserComponent extends BaseComponent<UserResponse> {

  // ========================================
  // INJEÇÕES
  // ========================================
  private translationService = inject(TranslationService);

  // ========================================
  // CONSTRUCTOR
  // ========================================
  constructor() {
    const userService = inject(UserDatasourceService);
    super(userService);

    // ⚠️ CRÍTICO: Inicializar forms no constructor para SSR
    this.createUserForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phoneNumber: [''],
      roles: [[], Validators.required],
      policies: [[], Validators.required]
    });

    this.updateUserForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      roles: [[], Validators.required],
      policies: [[], Validators.required]
    });
  }

  // ========================================
  // INJEÇÕES
  // ========================================
  private userService = inject(UserDatasourceService);
  private fb = inject(FormBuilder);

  // ========================================
  // SIGNALS (Estado Local)
  // ========================================
  public showCreateModal = signal<boolean>(false);
  public showUpdateModal = signal<boolean>(false);
  public showPermissionsModal = signal<boolean>(false);
  public rulesList = signal<Rule[]>([]);
  public policiesList = signal<Policy[]>([]);
  public selectedUser = signal<UserResponse | null>(null);

  // ========================================
  // FORMS
  // ========================================
  createUserForm: FormGroup;
  updateUserForm: FormGroup;

  // ========================================
  // SETUP COMPONENT
  // ========================================
  protected async setupComponent(): Promise<void> {
    // ⚠️ CRÍTICO: Aguarda traduções carregarem primeiro
    await this.translationService.loadFeatureTranslations('admin/users');

    if (this.isBrowser) {
      // Carrega roles e policies disponíveis
      setTimeout(async () => {
        this.rulesList.set(await this.userService.getRoles());
        this.policiesList.set(await this.userService.getPolicies());
      });
    }

    this.setupMenuItems();
  }

  // ========================================
  // SETUP MENU ITEMS (PrimeNG Menu)
  // ========================================
  private setupMenuItems(): void {
    this.setItems([
      {
        label: this.translationService.translate('common.actions'),
        items: [
          {
            label: this.translationService.translate('users.viewPermissions'),
            icon: 'pi pi-eye',
            command: () => this.viewPermissions()
          },
          {
            label: this.translationService.translate('common.edit'),
            icon: 'pi pi-pencil',
            command: () => this.editUser()
          },
          {
            separator: true
          },
          {
            label: this.translationService.translate('common.delete'),
            icon: 'pi pi-trash',
            command: () => this.deleteUser(),
            styleClass: 'menu-item-danger'
          }
        ]
      }
    ]);
  }

  // ========================================
  // MENU ACTIONS
  // ========================================
  override openMenu(user: UserResponse, event: Event): void {
    this.selectedItem = user;
    this.menu.toggle(event);
  }

  // ========================================
  // CRUD METHODS
  // ========================================
  public viewPermissions(): void {
    if (!this.selectedItem) return;
    this.selectedUser.set(this.selectedItem);
    this.showPermissionsModal.set(true);
  }

  private editUser(): void {
    if (!this.selectedItem) return;

    const user = this.selectedItem;
    this.updateUserForm.patchValue({
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      roles: user.roles || [],
      policies: user.policies || []
    });

    this.showUpdateModal.set(true);
  }

  private async deleteUser(): Promise<void> {
    if (!this.selectedItem) return;

    const user = this.selectedItem;

    this.confirmationService.confirm({
      message: `Deseja realmente excluir o usuário "${user.fullName}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'btn btn-danger',
      rejectButtonStyleClass: 'btn btn-secondary',
      accept: async () => {
        try {
          // Usa o método delete do BaseService
          const result = await this.userService.delete(user.id, {
            successMessage: {
              title: 'Sucesso',
              message: 'Usuário excluído com sucesso!'
            },
            errorMessage: {
              title: 'Erro',
              message: 'Falha ao excluir usuário'
            }
          });

          if (result.success) {
            await this.loadData();
          }
        } catch (error: any) {
          console.error('Erro ao excluir usuário:', error);
        }
      },
      reject: () => {
        this.toastService.showInfo('Cancelado', 'Exclusão cancelada');
      }
    });
  }

  // ========================================
  // MODAL ACTIONS
  // ========================================
  openCreateModal(): void {
    this.createUserForm.reset({
      fullName: '',
      email: '',
      password: '',
      phoneNumber: '',
      roles: [],
      policies: []
    });
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.createUserForm.reset();
  }

  closeUpdateModal(): void {
    this.showUpdateModal.set(false);
    this.updateUserForm.reset();
  }

  closePermissionsModal(): void {
    this.showPermissionsModal.set(false);
    this.selectedUser.set(null);
  }

  async onSubmitCreate(): Promise<void> {
    if (this.createUserForm.invalid) {
      this.toastService.showError('Campos obrigatórios', 'Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const formValue = this.createUserForm.value;
      const payload: CreateUserRequest = {
        name: formValue.fullName,
        email: formValue.email,
        password: formValue.password,
        phoneNumber: formValue.phoneNumber || '',
        roles: formValue.roles,
        policies: formValue.policies
      };

      // Usa o método create do BaseService
      const result = await this.userService.create<CreateUserRequest, UserResponse>(payload, {
        successMessage: {
          title: 'Sucesso',
          message: 'Usuário criado com sucesso!'
        },
        errorMessage: {
          title: 'Erro',
          message: 'Falha ao criar usuário'
        }
      });

      if (result.success) {
        this.closeCreateModal();
        await this.loadData();
      }
    } catch (err) {
      console.error('Erro ao criar usuário:', err);
    }
  }

  async onSubmitUpdate(): Promise<void> {
    if (this.updateUserForm.invalid || !this.selectedItem) {
      this.toastService.showError('Campos obrigatórios', 'Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const formValue = this.updateUserForm.value;
      const payload: UpdateUserRequest = {
        userId: this.selectedItem.id,
        name: formValue.fullName,
        email: formValue.email,
        phoneNumber: formValue.phoneNumber || '',
        roles: formValue.roles,
        policies: formValue.policies
      };

      // Usa o método update do BaseService
      const result = await this.userService.update<UpdateUserRequest, UserResponse>(
        this.selectedItem.id,
        payload,
        {
          successMessage: {
            title: 'Sucesso',
            message: 'Usuário atualizado com sucesso!'
          },
          errorMessage: {
            title: 'Erro',
            message: 'Falha ao atualizar usuário'
          }
        }
      );

      if (result.success) {
        this.closeUpdateModal();
        await this.loadData();
      }
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
    }
  }

  // ========================================
  // HELPERS
  // ========================================
  getRoleDisplayName(roleKey: string): string {
    const role = this.rulesList().find(r => r.key === roleKey);
    return role?.value || roleKey;
  }

  getPolicyDisplayName(policyKey: string): string {
    const policy = this.policiesList().find(p => p.key === policyKey);
    return policy?.value || policyKey;
  }

  getUserInitials(fullName: string): string {
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  }
}
