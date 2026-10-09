import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Keycloak from 'keycloak-js';

import { environment } from '../../environments/environment';
import { EVENT_MANAGEMENT_ROLES } from '../config/roles.config';
import { UserSessionService } from './user-session.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly userSession = inject(UserSessionService);

  private keycloak: Keycloak | null = null;
  private initPromise: Promise<boolean> | null = null;

  readonly isAuthenticated = signal(false);

  // User data comes from GraphQL, not from the token.
  readonly currentUser = this.userSession.currentUser;
  readonly userName = this.userSession.name;
  readonly userInitials = this.userSession.initials;
  readonly userRole = this.userSession.role;

  hasRole(allowedRoles: readonly string[] | string): boolean {
    const role = this.currentUser()?.role;

    if (!role) return false;

    const roles = typeof allowedRoles === 'string' ? [allowedRoles] : allowedRoles;

    return roles.some((allowed) => allowed.trim().toLowerCase() === role.trim().toLowerCase());
  }

  canManageEvents(): boolean {
    return this.hasRole(EVENT_MANAGEMENT_ROLES);
  }

  init(): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve(false);
    }

    if (!this.initPromise) {
      this.initPromise = this.initializeKeycloak();
    }

    return this.initPromise;
  }

  private async initializeKeycloak(): Promise<boolean> {
    this.keycloak = new Keycloak({
      url: environment.keycloak.url,
      realm: environment.keycloak.realm,
      clientId: environment.keycloak.clientId,
    });

    this.keycloak.onAuthLogout = () => {
      this.clearSession();
    };

    this.keycloak.onAuthRefreshError = () => {
      this.clearSession();
    };

    try {
      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        checkLoginIframe: false,
      });

      const hasToken = !!this.keycloak.token;
      const ready = authenticated && hasToken;

      this.isAuthenticated.set(ready);

      if (!ready) {
        this.clearSession();
      }

      return ready;
    } catch (error) {
      console.error('Keycloak initialization failed:', error);
      this.clearSession();
      return false;
    }
  }

  getSubject(): string | null {
    if (!this.isAuthenticated()) {
      return null;
    }

    return this.keycloak?.tokenParsed?.sub ?? null;
  }

  async login(redirectUri?: string): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || !this.keycloak) {
      return;
    }

    await this.keycloak.login({
      redirectUri: redirectUri || `${window.location.origin}/`,
    });
  }

  async logout(redirectUri?: string): Promise<void> {
    this.clearSession();

    if (!isPlatformBrowser(this.platformId) || !this.keycloak) {
      return;
    }

    await this.keycloak.logout({
      redirectUri: redirectUri || `${window.location.origin}/guest`,
    });
  }

  async getToken(): Promise<string | null> {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    // Wait for Keycloak initialization if it is still running.
    const initialized = await this.init();

    if (!initialized || !this.keycloak || !this.isAuthenticated()) {
      return null;
    }

    try {
      await this.keycloak.updateToken(30);

      return this.keycloak.token ?? null;
    } catch (error) {
      console.warn('Failed to refresh Keycloak token:', error);

      await this.handleUnauthorized();

      return null;
    }
  }

  async handleUnauthorized(): Promise<void> {
    await this.logout();
  }

  getUserInitials(): string {
    return this.userInitials();
  }

  getName(): string {
    return this.userName();
  }

  getGivenName(): string {
    return this.currentUser()?.firstName ?? '';
  }

  getFamilyName(): string {
    return this.currentUser()?.lastName ?? '';
  }

  getUserRole(): string {
    return this.userRole() ?? '';
  }

  private clearSession(): void {
    this.isAuthenticated.set(false);
    this.userSession.clear();

    if (isPlatformBrowser(this.platformId)) {
      // Cleanup from the previous implementation.
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('id_token');
    }
  }
}
