import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { TranslationService } from '../services/translation.service';

export const LanguageGuard: CanActivateFn = (route) => {
  const translationService = inject(TranslationService);
  const router = inject(Router);

  const lang = route.paramMap.get('lang');

  if (!lang || !translationService.isValidLanguage(lang)) {
    // Redireciona para idioma padrão
    const path = route.url.map(segment => segment.path).join('/');
    router.navigate([`/${translationService.defaultLanguage}/${path}`]);
    return false;
  }

  return true;
};
