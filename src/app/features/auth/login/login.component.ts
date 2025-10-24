// ===== login.component.ts =====
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';

// Services
import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastService } from '../../../core/abstractions/toast/toast.service';
import { TranslationService } from '../../../core/services/translation.service';

// Pipes
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

// Components
import { LanguageSelectorComponent } from '../../../shared/components/language-selector/language-selector.component';

@Component({
  selector: 'app-login',
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
  providers: [ToastService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  public authService = inject(AuthService);
  private translationService = inject(TranslationService);

  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor() {
    this.initForm();
  }

  async ngOnInit() {
    // Carrega traduções específicas do login
    await this.translationService.loadFeatureTranslations('auth/login');
  }

  private initForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;

      if (this.loginForm?.valid)
        this.authService.login(this.loginForm.value);
    } else {
      this.markFormGroupTouched();
    }
    this.isLoading = false;
  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  onForgotPassword() {
    // Implementar recuperação de senha
  }

  onCreateAccount() {
    const currentLang = this.translationService.getCurrentLanguage();
    this.router.navigate([`/${currentLang}/auth/register`]);
  }

  /**
   * Inicia autenticação com Google OAuth
   */
  async onGoogleLogin() {
    await this.authService.loginWithGoogle();
  }

  // Getters para validação
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}