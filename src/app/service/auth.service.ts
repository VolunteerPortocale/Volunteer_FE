import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { APP_ROUTES } from '../config/routes.config';

export interface UserProfile {
  name: string;
  initials: string;
  email: string;
  role?: string;
}

const DEFAULT_USER: UserProfile = {
  name: 'Pavel',
  initials: 'PC',
  email: 'pavel@example.com',
  role: 'Voluntar',
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly storageKey = 'volunteerio_auth_state';

  readonly currentUser = signal<UserProfile | null>(DEFAULT_USER);
  readonly isAuthenticated = signal<boolean>(this.getInitialAuthState());

  private isRedirecting = false;

  login(user: UserProfile = DEFAULT_USER): void {
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.storageKey, 'true');
    }
  }

  logout(): void {
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem('access_token');
    }
  }

  toggleAuth(): void {
    if (this.isAuthenticated()) {
      this.logout();
    } else {
      this.login();
    }
  }

  /**
   * Called globally when any REST or GraphQL request returns a 401 or UNAUTHENTICATED error.
   */
  handleUnauthorized(): void {
    if (this.isRedirecting) {
      return;
    }
    this.isRedirecting = true;

    this.logout();

    if (isPlatformBrowser(this.platformId)) {
      const currentUrl = this.router.url;
      const targetLoginRoute = `/${APP_ROUTES.LOGIN}`;

      this.router.navigate([targetLoginRoute], {
        queryParams: currentUrl && currentUrl !== targetLoginRoute && currentUrl !== '/'
          ? { returnUrl: currentUrl }
          : undefined
      }).finally(() => {
        this.isRedirecting = false;
      });
    } else {
      this.isRedirecting = false;
    }
  }

  private getInitialAuthState(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.storageKey) === 'true';
    }
    return false;
  }
}

