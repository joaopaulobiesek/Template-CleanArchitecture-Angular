import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ClientService } from '../services/client.service';
import { Client, CreateClientRequest, UpdateClientRequest } from '../../../core/models/client.model';
import { ToastService } from '../../../core/abstractions/toast/toast.service';
import { PlatformService } from '../../../core/services/platform.service';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

/**
 * 📝 CLIENT FORM COMPONENT
 *
 * Componente de formulário para criar/editar clientes
 * Usado para:
 * - /clients/new (criar novo cliente)
 * - /clients/:id/edit (editar cliente existente)
 */
@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    InputTextModule,
    InputMaskModule,
    CheckboxModule,
    ButtonModule,
    ToastModule,
    TranslatePipe
  ],
  providers: [MessageService]
})
export class ClientFormComponent implements OnInit {

  // ========================================
  // INJEÇÕES
  // ========================================
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private clientService = inject(ClientService);
  private toastService = inject(ToastService);
  private platform = inject(PlatformService);
  public translationService = inject(TranslationService); // ✅ Public para usar no template

  // ========================================
  // SIGNALS (Estado)
  // ========================================
  public loading = signal<boolean>(false);
  public isEditMode = signal<boolean>(false);
  public clientId = signal<string | null>(null);

  // ========================================
  // FORMULÁRIO
  // ========================================
  public clientForm!: FormGroup;

  // ========================================
  // GETTERS PARA FACILITAR ACESSO NO TEMPLATE
  // ========================================
  get isBrowser(): boolean {
    return this.platform.isBrowser();
  }

  get fullName() { return this.clientForm.get('fullName'); }
  get documentNumber() { return this.clientForm.get('documentNumber'); }
  get email() { return this.clientForm.get('email'); }
  get phone() { return this.clientForm.get('phone'); }
  get zipCode() { return this.clientForm.get('zipCode'); }
  get paid() { return this.clientForm.get('paid'); }

  // ========================================
  // LIFECYCLE
  // ========================================
  constructor() {
    // ⚠️ Form DEVE ser inicializado no constructor (SSR)
    this.initializeForm();
  }

  async ngOnInit(): Promise<void> {
    // ✅ Carrega traduções de clients
    await this.translationService.loadFeatureTranslations('clients');

    if (this.isBrowser) {
      // Verifica se é modo de edição
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.isEditMode.set(true);
        this.clientId.set(id);
        await this.loadClient(id);
      }
    }
  }

  // ========================================
  // INICIALIZAÇÃO DO FORMULÁRIO
  // ========================================
  private initializeForm(): void {
    this.clientForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      documentNumber: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      zipCode: ['', [Validators.required]],
      paid: [false]
    });
  }

  // ========================================
  // CARREGAR CLIENTE (Modo Edição)
  // ========================================
  private async loadClient(id: string): Promise<void> {
    this.loading.set(true);
    try {
      const response = await this.clientService.getById<Client>(id, {
        hiddenToast: true
      });

      if (response.success && response.data) {
        // Preenche o formulário com os dados do cliente
        this.clientForm.patchValue({
          fullName: response.data.fullName,
          documentNumber: response.data.documentNumber,
          email: response.data.email,
          phone: response.data.phone,
          zipCode: response.data.zipCode,
          paid: response.data.paid
        });

        // documentNumber não pode ser editado
        this.clientForm.get('documentNumber')?.disable();
      }
    } catch (error) {
      console.error('Erro ao carregar cliente:', error);
      this.toastService.showError('Erro', 'Falha ao carregar dados do cliente');
      this.router.navigate(['/clients']);
    } finally {
      this.loading.set(false);
    }
  }

  // ========================================
  // SUBMISSÃO DO FORMULÁRIO
  // ========================================
  async onSubmit(): Promise<void> {
    if (this.clientForm.invalid) {
      this.markFormGroupTouched(this.clientForm);
      this.toastService.showWarn('Atenção', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    this.loading.set(true);

    try {
      if (this.isEditMode()) {
        await this.updateClient();
      } else {
        await this.createClient();
      }
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
    } finally {
      this.loading.set(false);
    }
  }

  // ========================================
  // CRIAR NOVO CLIENTE
  // ========================================
  private async createClient(): Promise<void> {
    const formValue = this.clientForm.value;

    const request = CreateClientRequest.fromObject({
      fullName: formValue.fullName,
      documentNumber: formValue.documentNumber,
      email: formValue.email,
      phone: formValue.phone,
      zipCode: formValue.zipCode,
      paid: formValue.paid
    });

    const response = await this.clientService.create<CreateClientRequest, Client>(
      request,
      {
        successMessage: {
          title: 'Sucesso',
          message: 'Cliente cadastrado com sucesso!'
        },
        errorMessage: {
          title: 'Erro',
          message: 'Falha ao cadastrar cliente'
        }
      }
    );

    if (response.success) {
      this.router.navigate(['/clients']);
    }
  }

  // ========================================
  // ATUALIZAR CLIENTE EXISTENTE
  // ========================================
  private async updateClient(): Promise<void> {
    const formValue = this.clientForm.getRawValue(); // getRawValue pega campos disabled também

    const request = UpdateClientRequest.fromObject({
      id: this.clientId()!,
      fullName: formValue.fullName,
      email: formValue.email,
      phone: formValue.phone,
      documentNumber: formValue.documentNumber,
      zipCode: formValue.zipCode,
      paid: formValue.paid
    });

    const response = await this.clientService.update<UpdateClientRequest, Client>(
      this.clientId()!,
      request,
      {
        successMessage: {
          title: 'Sucesso',
          message: 'Cliente atualizado com sucesso!'
        },
        errorMessage: {
          title: 'Erro',
          message: 'Falha ao atualizar cliente'
        }
      }
    );

    if (response.success) {
      this.router.navigate(['/clients']);
    }
  }

  // ========================================
  // CANCELAR E VOLTAR
  // ========================================
  onCancel(): void {
    this.router.navigate(['/clients']);
  }

  // ========================================
  // HELPER: Marca todos os campos como touched
  // ========================================
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // ========================================
  // VALIDAÇÃO: Verifica se campo tem erro
  // ========================================
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.clientForm.get(fieldName);
    return !!(field?.hasError(errorType) && (field.dirty || field.touched));
  }
}
