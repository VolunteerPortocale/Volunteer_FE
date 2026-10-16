import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';

export type SupportedLanguage = 'ro' | 'en' | 'ru';

export const LANGUAGE_LOCALES: Record<SupportedLanguage, string> = {
  ro: 'ro-RO',
  en: 'en-US',
  ru: 'ru-RU',
} as const;

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'volunteerio_lang';

  // Reactive state using Angular 21 Signals
  readonly currentLang = signal<SupportedLanguage>('ro');
  readonly currentLocale = computed(() => LANGUAGE_LOCALES[this.currentLang()] ?? 'ro-RO');
  private readonly translations = signal<Record<string, unknown>>({});

  constructor() {
    const initialLang = this.getSavedLanguage();
    this.setLanguage(initialLang);
  }

  /**
   * Switches the active language and loads the corresponding JSON dictionary
   */
  setLanguage(lang: SupportedLanguage): void {
    this.http.get<Record<string, unknown>>(`/i18n/${lang}.json`).subscribe({
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
   * Resolves nested keys like "NAV.PROJECTS" from the active dictionary, with optional parameter interpolation
   */
  translate(key: string, params?: Record<string, string | number>): string {
    const dict = this.translations();
    const result = key.split('.').reduce<unknown>((obj, k) => {
      if (obj && typeof obj === 'object') {
        return (obj as Record<string, unknown>)[k];
      }
      return undefined;
    }, dict);
    let str = typeof result === 'string' ? result : key;
    if (params) {
      for (const [pKey, pVal] of Object.entries(params)) {
        str = str.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
      }
    }
    return str;
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