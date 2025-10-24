import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { PlatformService } from '../../core/services/platform.service';

// Pipes
import { TranslatePipe } from '../../core/pipes/translate.pipe';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, ButtonModule, TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  environment = signal<'dev' | 'prod'>('dev');
  version = signal('1.0.0');
  currentYear = new Date().getFullYear(); // Propriedade da classe

  constructor(private platform: PlatformService) {

  }

  ngOnInit() {
    // Simular detecção de ambiente
    if (this.platform.isBrowser()) {
      const isDev = window.location.hostname.includes('localhost') ||
        window.location.hostname.includes('dev');
      this.environment.set(isDev ? 'dev' : 'prod');
    }
  }

  printForm() {
    if (this.platform.isBrowser())
      window.print();
  }
}