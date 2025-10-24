import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastService } from '../../../core/abstractions/toast/toast.service';

@Component({
  selector: 'app-google-callback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './google-callback.html',
  styleUrl: './google-callback.scss'
})
export class GoogleCallback implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  isProcessing = true;
  errorMessage = '';

  ngOnInit() {
    this.handleGoogleCallback();
  }

  private async handleGoogleCallback() {
    try {
      // 🎯 FLOW:
      // 1. Google redirects to: http://localhost:4200/auth/google-callback?code=XXX&state=YYY
      // 2. We get code and state from URL
      // 3. Call backend: GET /api/v1/Auth/Google/Callback?code=XXX&state=YYY
      // 4. Backend processes OAuth and returns JWT token
      // 5. Save token and redirect to dashboard

      const code = this.route.snapshot.queryParamMap.get('code');
      const state = this.route.snapshot.queryParamMap.get('state');

      if (!code) {
        this.errorMessage = 'Authorization code not received from Google.';
        this.isProcessing = false;
        return;
      }

      // Chama backend para processar OAuth
      const result = await this.authService.handleGoogleCallback(code, state || '');

      if (result.success) {
        // Token já foi salvo pelo AuthService
        this.toastService.showSuccess(
          'Google Login Successful!',
          `Welcome!`
        );

        // Redireciona para dashboard (idioma padrão)
        setTimeout(() => {
          this.router.navigate(['/pt-br/dashboard']);
        }, 1000);
      } else {
        this.errorMessage = 'Error processing Google authentication.';
        this.isProcessing = false;

        setTimeout(() => {
          this.router.navigate(['/pt-br/auth/login']);
        }, 3000);
      }

    } catch (error) {
      console.error('Error processing Google callback:', error);
      this.errorMessage = 'Error processing Google authentication.';
      this.isProcessing = false;

      setTimeout(() => {
        this.router.navigate(['/pt-br/auth/login']);
      }, 3000);
    }
  }
}
