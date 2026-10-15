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
      const token = isPlatformBrowser(this.platformId)
        ? localStorage.getItem('access_token') || undefined
        : undefined;
      const refreshToken = isPlatformBrowser(this.platformId)
        ? localStorage.getItem('refresh_token') || undefined
        : undefined;
      const idToken = isPlatformBrowser(this.platformId)
        ? localStorage.getItem('id_token') || undefined
        : undefined;
      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        checkLoginIframe: false,
        token,
        refreshToken,
        idToken,
      });

      const hasToken = !!this.keycloak.token;
      const ready = authenticated && hasToken;

      this.isAuthenticated.set(ready);
      if (ready) {
        if (this.keycloak.token) localStorage.setItem('access_token', this.keycloak.token);
        if (this.keycloak.refreshToken) localStorage.setItem('refresh_token', this.keycloak.refreshToken);
        if (this.keycloak.idToken) localStorage.setItem('id_token', this.keycloak.idToken);
      } else {
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
      const refreshed = await this.keycloak.updateToken(30);
      if (refreshed) {
        if (this.keycloak.token) localStorage.setItem('access_token', this.keycloak.token);
        if (this.keycloak.refreshToken) localStorage.setItem('refresh_token', this.keycloak.refreshToken);
        if (this.keycloak.idToken) localStorage.setItem('id_token', this.keycloak.idToken);
      }

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

  async loginWithCredentials(username: string, password: string): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    try {
      const body = new URLSearchParams();
      body.set('grant_type', 'password');
      body.set('client_id', environment.keycloak.clientId);
      body.set('username', username);
      body.set('password', password);
      body.set('scope', 'openid');

      const response = await fetch(
        `${environment.keycloak.url}/realms/${environment.keycloak.realm}/protocol/openid-connect/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
        }
      );

      if (!response.ok) {
        console.error('Direct Grant login failed with status:', response.status);
        return false;
      }

      const tokens = await response.json();

      localStorage.setItem('access_token', tokens.access_token);
      if (tokens.refresh_token) {
        localStorage.setItem('refresh_token', tokens.refresh_token);
      }
      if (tokens.id_token) {
        localStorage.setItem('id_token', tokens.id_token);
      }

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

      const authenticated = await this.keycloak.init({
        token: tokens.access_token,
        refreshToken: tokens.refresh_token,
        idToken: tokens.id_token,
        checkLoginIframe: false,
      });

      const ready = authenticated && !!this.keycloak.token;
      this.isAuthenticated.set(ready);
      this.initPromise = Promise.resolve(ready);

      return ready;
    } catch (error) {
      console.error('Failed to login with credentials:', error);
      this.clearSession();
      return false;
    }
  }
}
