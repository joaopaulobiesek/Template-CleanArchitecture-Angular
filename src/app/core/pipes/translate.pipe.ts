import { Pipe, PipeTransform, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { TranslationService } from '../services/translation.service';
import { effect, Injector } from '@angular/core';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false  // Permite reatividade
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private translationService = inject(TranslationService);
  private cdr = inject(ChangeDetectorRef);
  private injector = inject(Injector);
  private lastKey = '';
  private lastValue = '';
  private lastTranslationsHash = '';

  constructor() {
    // Observa mudanças nas traduções
    effect(() => {
      const translations = this.translationService.translations();
      // Cria um hash das traduções para detectar mudanças
      const currentHash = JSON.stringify(translations);

      // Se as traduções mudaram, invalida o cache
      if (currentHash !== this.lastTranslationsHash) {
        this.lastTranslationsHash = currentHash;
        this.lastKey = ''; // Invalida cache
        this.cdr.markForCheck();
      }
    }, { injector: this.injector });
  }

  transform(key: string, params?: { [key: string]: any }): string {
    if (!key) return '';

    // Cache simples para performance (mas será invalidado quando traduções mudarem)
    const cacheKey = `${key}_${JSON.stringify(params || {})}`;
    if (cacheKey === this.lastKey && this.lastValue) {
      return this.lastValue;
    }

    this.lastKey = cacheKey;
    this.lastValue = this.translationService.translate(key, params);
    return this.lastValue;
  }

  ngOnDestroy(): void {
    // Cleanup se necessário
  }
}
