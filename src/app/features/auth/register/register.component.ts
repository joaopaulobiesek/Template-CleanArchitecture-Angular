import { Component, OnInit, inject, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';

// Services
import { ToastService } from '../../../core/abstractions/toast/toast.service';
import { BaseService } from '../../../core/abstractions/class-parents/base.service';
import { apiRoutes } from '../../../core/abstractions/http/api-routes';
import { AuthService } from '../../../core/services/auth/auth.service';
import { TranslationService } from '../../../core/services/translation.service';

// Pipes
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

// Components
import { LanguageSelectorComponent } from '../../../shared/components/language-selector/language-selector.component';

// ========================================
// SERVICE INLINE PARA REGISTRO
// ========================================
@Injectable()
class RegisterService extends BaseService {
  protected getEndpoints() { return {}; }

  /**
   * Registra novo usuário com código de convite
   *
   * ⚠️ IMPORTANTE: Endpoint mudou de /api/v1/Users (Admin) para /api/v1/Auth/Register (Public)
   *
   * @param userData - Dados do usuário com código de convite obrigatório
   * @returns Response com token JWT (faz login automático)
   */
  async registerUser(userData: any) {
    return await this.executeWithHandler(
      apiRoutes.auth.register(), // ✅ NOVO: Rota pública com código de convite
      userData,
      {
        successMessage: {
          title: 'Conta criada com sucesso!',
          message: 'Fazendo login automaticamente...'
        },
        errorMessage: {
          title: 'Erro ao criar conta',
          message: 'Verifique os dados e o código de convite'
        }
      }
    );
  }
}

// ========================================
// COMPONENTE DE REGISTRO
// ========================================
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    ToastModule,
    TranslatePipe,
    LanguageSelectorComponent
  ],
  providers: [ToastService, RegisterService],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);
  private registerService = inject(RegisterService);
  private authService = inject(AuthService);
  private translationService = inject(TranslationService);

  registerForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  passwordStrength: number = 0;

  // 🔄 Controle de exibição do formulário
  showFullForm = false; // false = mostra só termos + botões

  constructor() {
    this.initForm();
  }

  async ngOnInit() {
    // Carrega traduções específicas do register
    await this.translationService.loadFeatureTranslations('auth/register');
  }

  private initForm() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.minLength(10)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });

    // Monitor mudanças na senha para calcular força
    this.registerForm.get('password')?.valueChanges.subscribe(password => {
      this.passwordStrength = this.calculatePasswordStrength(password);
    });
  }

  // Validador customizado para verificar se senhas coincidem
  private passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  // Calcula força da senha (0-100)
  private calculatePasswordStrength(password: string): number {
    if (!password) return 0;

    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 10) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;

    return Math.min(strength, 100);
  }

  getPasswordStrengthLabel(): string {
    if (this.passwordStrength < 40) return 'Fraca';
    if (this.passwordStrength < 70) return 'Média';
    return 'Forte';
  }

  getPasswordStrengthColor(): string {
    if (this.passwordStrength < 40) return '#ef4444'; // red
    if (this.passwordStrength < 70) return '#f59e0b'; // yellow
    return '#10b981'; // green
  }

  async onSubmit() {

    if (this.registerForm.valid) {
      this.isLoading = true;

      try {
        const formValue = this.registerForm.value;

        // Preparar payload para API
        const payload = {
          fullName: formValue.name,
          email: formValue.email,
          phoneNumber: formValue.phoneNumber,
          password: formValue.password
        };

        const result = await this.registerService.registerUser(payload);

        if (result.success) {
          const currentLang = this.translationService.getCurrentLanguage();
          setTimeout(() => {
            this.router.navigate([`/${currentLang}/auth/login`]);
          }, 1500);
        }
      } catch (error) {
        console.error('Erro ao registrar:', error);
      } finally {
        this.isLoading = false;
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * 🔄 Alterna exibição do formulário completo
   */
  toggleFullForm() {
    this.showFullForm = !this.showFullForm;
  }

  /**
   * 🔄 Volta ao estado inicial (só invite code)
   */
  backToInitialState() {
    this.showFullForm = false;
    // Limpa campos (exceto invite code e terms)
    this.registerForm.patchValue({
      name: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: ''
    });
  }

  /**
   * 📱 Login com Google
   */
  async loginWithGoogle() {
    const acceptTerms = this.registerForm.get('acceptTerms')?.value;

    if (!acceptTerms) {
      this.toastService.showWarn('Atenção', 'Você precisa aceitar os termos para continuar');
      return;
    }

    // Chama AuthService
    await this.authService.loginWithGoogle();
  }

  onBackToLogin() {
    const currentLang = this.translationService.getCurrentLanguage();
    this.router.navigate([`/${currentLang}/auth/login`]);
  }

  onLogin() {
    const currentLang = this.translationService.getCurrentLanguage();
    this.router.navigate([`/${currentLang}/auth/login`]);
  }

  /**
   * Inicia autenticação com Google OAuth
   */
  async onGoogleLogin() {
    await this.authService.loginWithGoogle();
  }

  // Getters para validação
  get name() { return this.registerForm.get('name'); }
  get email() { return this.registerForm.get('email'); }
  get phoneNumber() { return this.registerForm.get('phoneNumber'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get acceptTerms() { return this.registerForm.get('acceptTerms'); }

  // Helpers para validação
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);

    if (field?.hasError('required')) return 'Campo obrigatório';
    if (field?.hasError('email')) return 'Email inválido';
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength']?.requiredLength;
      return `Mínimo de ${minLength} caracteres`;
    }

    return '';
  }

  // Erro específico para senhas não coincidentes
  get passwordMismatchError(): boolean {
    return this.registerForm.hasError('passwordMismatch') &&
           this.confirmPassword?.touched || false;
  }
}
