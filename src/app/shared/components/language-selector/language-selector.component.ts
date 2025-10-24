import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService, LanguageConfig } from '../../../core/services/translation.service';
import { PlatformService } from '../../../core/services/platform.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.scss'
})
export class LanguageSelectorComponent {
  public translationService = inject(TranslationService);
  private platformService = inject(PlatformService);

  // ========================================
  // ESTADO
  // ========================================
  public isOpen = signal(false);

  // ========================================
  // DADOS
  // ========================================
  public languages = this.translationService.availableLanguages;
  public currentLang = this.translationService.currentLang$;

  // ========================================
  // LIFECYCLE
  // ========================================
  constructor() {
    // Fecha dropdown ao clicar fora
    if (this.platformService.isBrowser()) {
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.language-selector')) {
          this.closeDropdown();
        }
      });
    }
  }

  // ========================================
  // MÉTODOS
  // ========================================
  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isOpen.update(v => !v);
  }

  closeDropdown(): void {
    this.isOpen.set(false);
  }

  selectLanguage(lang: LanguageConfig, event: Event): void {
    event.stopPropagation();
    this.closeDropdown();
    this.translationService.switchLanguage(lang.code);
  }

  isCurrentLanguage(lang: LanguageConfig): boolean {
    return this.currentLang() === lang.code;
  }
}
