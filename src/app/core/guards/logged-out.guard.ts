import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { PlatformService } from '../services/platform.service';
import { TranslationService } from '../services/translation.service';

export const loggedOutGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platform = inject(PlatformService);
  const translationService = inject(TranslationService);

  // 🚀 SSR-Safe: No servidor, sempre permitir
  if (!platform.isBrowser()) {
    return true; // Servidor SSR sempre permite
  }

  const token = localStorage.getItem("user_data");
  if (!token) {
    return true;
  }

  // Redirecionar para dashboard mantendo a URL de destino
  const currentLang = translationService.getCurrentLanguage();
  router.navigate([`/${currentLang}/dashboard`], {
    queryParams: { returnUrl: state.url }
  });

  return false;
};