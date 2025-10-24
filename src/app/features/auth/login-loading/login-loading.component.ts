import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-login-loading',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './login-loading.component.html',
  styleUrl: './login-loading.component.scss'
})
export class LoginLoadingComponent implements OnInit {
  private router = inject(Router);
  private translationService = inject(TranslationService);

  async ngOnInit() {
    // Carrega traduções do login loading
    await this.translationService.loadFeatureTranslations('auth/login-loading');

    // Aguarda 1 segundo antes de redirecionar
    setTimeout(() => {
      const currentLang = this.translationService.getCurrentLanguage();
      this.router.navigate([`/${currentLang}/dashboard`]);
    }, 1000);
  }
}
