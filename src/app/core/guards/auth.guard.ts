import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { PlatformService } from '../services/platform.service';
import { TranslationService } from '../services/translation.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platform = inject(PlatformService);
  const translationService = inject(TranslationService);

  // 🚀 SSR-Safe: No servidor, sempre permitir
  if (!platform.isBrowser()) {
    return true; // Servidor SSR sempre permite
  }

  // 🔍 No browser, verificar autenticação
  // 🍪 NOVA LÓGICA: Verifica se está autenticado (cookie + localStorage)
  // Cookie HTTP-Only é enviado automaticamente, não precisamos verificar
  // Apenas verificamos se tem user_data (significa que fez login)
  const userData = localStorage.getItem("user_data");

  if (userData || authService.isAuthenticated) {
    return true;
  }

  // Redirecionar para login mantendo a URL de destino
  const currentLang = translationService.getCurrentLanguage();
  router.navigate([`/${currentLang}/auth/login`], {
    queryParams: { returnUrl: state.url }
  });

  return false;
};