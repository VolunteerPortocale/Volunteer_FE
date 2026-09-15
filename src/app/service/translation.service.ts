import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';

export type SupportedLanguage = 'ro' | 'en' | 'ru';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'volunteerio_lang';

  // Reactive state using Angular 21 Signals
  readonly currentLang = signal<SupportedLanguage>('ro');
  private readonly translations = signal<Record<string, any>>({});

  constructor() {
    const initialLang = this.getSavedLanguage();
    this.setLanguage(initialLang);
  }

  /**
   * Switches the active language and loads the corresponding JSON dictionary
   */
  setLanguage(lang: SupportedLanguage): void {
    this.http.get<Record<string, any>>(`/i18n/${lang}.json`).subscribe({
      next: (data) => {
        this.translations.set(data);
        this.currentLang.set(lang);

        // Safely persist to localStorage in browser (SSR-safe)
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem(this.storageKey, lang);
        }
      },
      error: (err) => {
        console.error(`Could not load translations for ${lang}`, err);
      }
    });
  }

  /**
   * Resolves nested keys like "NAV.PROJECTS" from the active dictionary
   */
  translate(key: string): string {
    const dict = this.translations();
    const result = key.split('.').reduce((obj, k) => obj?.[k], dict);
    return typeof result === 'string' ? result : key;
  }

  /**
   * Retrieves the saved language from localStorage (defaults to 'ro')
   */
  private getSavedLanguage(): SupportedLanguage {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem(this.storageKey) as SupportedLanguage;
      if (saved === 'ro' || saved === 'en' || saved === 'ru') {
        return saved;
      }
    }
    return 'ro';
  }
}