import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

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
  private readonly storageKey = 'volunteerio_auth_state';

  readonly currentUser = signal<UserProfile | null>(DEFAULT_USER);
  readonly isAuthenticated = signal<boolean>(this.getInitialAuthState());

  login(user: UserProfile = DEFAULT_USER): void {
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.storageKey, 'true');
    }
  }

  logout(): void {
    this.isAuthenticated.set(false);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.storageKey);
    }
  }

  toggleAuth(): void {
    if (this.isAuthenticated()) {
      this.logout();
    } else {
      this.login();
    }
  }

  private getInitialAuthState(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.storageKey) === 'true';
    }
    return false;
  }
}
