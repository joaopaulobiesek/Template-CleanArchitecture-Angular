import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class PlatformService {
    constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

    isBrowser(): boolean {
        return isPlatformBrowser(this.platformId);
    }

    getWindow(): Window | null {
        return this.isBrowser() ? window : null;
    }

    getLocalStorage(): Storage | null {
        return this.isBrowser() ? localStorage : null;
    }
}