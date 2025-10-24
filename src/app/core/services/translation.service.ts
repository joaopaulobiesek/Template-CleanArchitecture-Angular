import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, filter } from 'rxjs/operators';

export interface LanguageConfig {
  code: string;
  flag: string;
  label: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // ========================================
  // CONFIGURAÇÃO DE IDIOMAS
  // ========================================
  public readonly availableLanguages: LanguageConfig[] = [
    { code: 'pt-br', flag: '🇧🇷', label: 'PT' },
    { code: 'en-us', flag: '🇺🇸', label: 'EN' },
    // { code: 'es-es', flag: '🇪🇸', label: 'ES' },  // Preparado para futuro
  ];

  public readonly defaultLanguage = 'pt-br';

  // ========================================
  // SIGNALS
  // ========================================
  private currentLangSignal = signal<string>(this.defaultLanguage);
  private globalTranslationsSignal = signal<any>({});
  private featureTranslationsSignal = signal<any>({});

  // ========================================
  // COMPUTED (Mescla global + feature)
  // ========================================
  public translations = computed(() => ({
    ...this.globalTranslationsSignal(),
    ...this.featureTranslationsSignal()
  }));

  // ========================================
  // OBSERVABLES (Para compatibilidade)
  // ========================================
  public currentLang$ = computed(() => this.currentLangSignal());
  public translations$ = computed(() => this.translations());

  // ========================================
  // CONSTRUCTOR
  // ========================================
  constructor() {
    this.initializeFromUrl();
    this.watchRouteChanges();
  }

  // ========================================
  // INICIALIZAÇÃO
  // ========================================
  private initializeFromUrl(): void {
    const lang = this.extractLangFromUrl(this.router.url);
    this.setLanguage(lang);
  }

  private extractLangFromUrl(url: string): string {
    const match = url.match(/^\/(pt-br|en-us|es-es)/);
    return match ? match[1] : this.defaultLanguage;
  }

  // ========================================
  // OBSERVAR MUDANÇAS DE ROTA
  // ========================================
  private watchRouteChanges(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const lang = this.extractLangFromUrl(event.url);
      if (lang !== this.currentLangSignal()) {
        this.setLanguage(lang);
      }
    });
  }

  // ========================================
  // DEFINIR IDIOMA
  // ========================================
  public setLanguage(lang: string): void {
    if (!this.isValidLanguage(lang)) {
      lang = this.defaultLanguage;
    }

    this.currentLangSignal.set(lang);
    this.loadGlobalTranslations(lang);
  }

  public isValidLanguage(lang: string): boolean {
    return this.availableLanguages.some(l => l.code === lang);
  }

  // ========================================
  // CARREGAR TRADUÇÕES GLOBAIS
  // ========================================
  private loadGlobalTranslations(lang: string): void {
    this.http.get(`/assets/i18n/global/${lang}.json`).pipe(
      catchError(() => of({}))
    ).subscribe(translations => {
      this.globalTranslationsSignal.set(translations);
    });
  }

  // ========================================
  // CARREGAR TRADUÇÕES DE FEATURE (Retorna Promise)
  // ========================================
  public loadFeatureTranslations(featurePath: string): Promise<void> {
    const lang = this.currentLangSignal();

    return new Promise((resolve) => {
      this.http.get(`/assets/i18n/features/${featurePath}/${lang}.json`).pipe(
        catchError(() => of({}))
      ).subscribe(translations => {
        // Mescla com traduções existentes ao invés de substituir
        const currentFeatureTranslations = this.featureTranslationsSignal();
        this.featureTranslationsSignal.set({
          ...currentFeatureTranslations,
          ...translations
        });
        resolve();
      });
    });
  }

  // ========================================
  // TRADUZIR CHAVE (Dot Notation)
  // ========================================
  public translate(key: string, params?: { [key: string]: any }): string {
    const translations = this.translations();
    const keys = key.split('.');
    let result: any = translations;

    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        return key; // Retorna chave se não encontrar
      }
    }

    // Substituir parâmetros {name}, {count}, etc
    if (params && typeof result === 'string') {
      Object.keys(params).forEach(param => {
        result = result.replace(`{${param}}`, params[param]);
      });
    }

    return result || key;
  }

  // ========================================
  // TROCAR IDIOMA (COM RELOAD)
  // ========================================
  public switchLanguage(newLang: string): void {
    if (!this.isValidLanguage(newLang)) {
      console.warn(`Idioma inválido: ${newLang}`);
      return;
    }

    const currentUrl = this.router.url;
    const currentPath = currentUrl.replace(/^\/(pt-br|en-us|es-es)/, '');
    const newUrl = `/${newLang}${currentPath}`;

    // Recarrega página (limpa estado)
    window.location.href = newUrl;
  }

  // ========================================
  // OBTER IDIOMA ATUAL
  // ========================================
  public getCurrentLanguage(): string {
    return this.currentLangSignal();
  }

  // ========================================
  // OBTER CONFIGURAÇÃO DO IDIOMA
  // ========================================
  public getCurrentLanguageConfig(): LanguageConfig | undefined {
    return this.availableLanguages.find(l => l.code === this.currentLangSignal());
  }
}
