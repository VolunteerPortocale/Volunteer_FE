import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Keycloak from 'keycloak-js';
import { environment } from '../../environments/environment';
import { EVENT_MANAGEMENT_ROLES } from '../config/roles.config';

export interface UserProfile {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private keycloak: Keycloak | null = null;

  readonly currentUser = signal<UserProfile | null>(null);
  readonly isAuthenticated = signal<boolean>(false);

  /**
   * Check if current user has any of the specified roles (case-insensitive)
   */
  hasRole(allowedRoles: readonly string[] | string[] | string): boolean {
    const user = this.currentUser();

    if (!user) return false;

    const rolesList: readonly string[] =
      typeof allowedRoles === 'string' ? [allowedRoles] : allowedRoles;
    const allowed = rolesList.map((r) => r.toLowerCase().trim());

    return allowed.includes(user.role);
  }

  /**
   * Volunteers cannot create, edit, or moderate events; NGO and Moderator can.
   */
  canManageEvents(): boolean {
    return this.hasRole(EVENT_MANAGEMENT_ROLES);
  }

  async init(): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    this.keycloak = new Keycloak({
      url: environment.keycloak.url,
      realm: environment.keycloak.realm,
      clientId: environment.keycloak.clientId,
    });
    const token = localStorage.getItem('access_token') || undefined;
    const refreshToken = localStorage.getItem('refresh_token') || undefined;
    const idToken = localStorage.getItem('id_token') || undefined;
    try {
      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        checkLoginIframe: false,
        token,
        refreshToken,
        idToken,
      });
      this.isAuthenticated.set(authenticated);
      if (authenticated) {
        if (this.keycloak.token) localStorage.setItem('access_token', this.keycloak.token);
        if (this.keycloak.refreshToken)
          localStorage.setItem('refresh_token', this.keycloak.refreshToken);
        if (this.keycloak.idToken) localStorage.setItem('id_token', this.keycloak.idToken);
        this.updateCurrentUser();
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('id_token');
        this.currentUser.set(null);
      }
      return authenticated;
    } catch (error) {
      console.error('Keycloak initialization failed:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('id_token');
      this.currentUser.set(null);
      this.isAuthenticated.set(false);
      return false;
    }
  }

  async login(redirectUri?: string): Promise<void> {
    if (isPlatformBrowser(this.platformId) && this.keycloak) {
      await this.keycloak.login({
        redirectUri: redirectUri || `${window.location.origin}/`,
      });
    }
  }

  async logout(redirectUri?: string): Promise<void> {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('id_token');
      if (this.keycloak) {
        await this.keycloak.logout({
          redirectUri: redirectUri || `${window.location.origin}/guest`,
        });
      }
    }
  }

  async getToken(): Promise<string | null> {
    if (!isPlatformBrowser(this.platformId) || !this.keycloak || !this.isAuthenticated()) {
      return null;
    }

    try {
      const refreshed = await this.keycloak.updateToken(30);
      if (refreshed && this.keycloak.token) {
        localStorage.setItem('access_token', this.keycloak.token);
      }
      return this.keycloak.token ?? null;
    } catch (err) {
      console.warn('Failed to refresh token, logging out', err);
      await this.logout();
      return null;
    }
  }

  async handleUnauthorized(): Promise<void> {
    await this.logout();
  }

  getUserInitials(): string {
    const givenName = this.getGivenName();
    const familyName = this.getFamilyName();
    const name = this.getName();
    return givenName && familyName
      ? `${givenName[0]}${familyName[0]}`.toUpperCase()
      : name.substring(0, Math.min(2, name.length)).toUpperCase();
  }

  getName(): string {
    const givenName = this.getGivenName();
    const firstName = this.getFamilyName();

    return givenName && firstName ? `${givenName} ${firstName}` : givenName || 'Utilizator';
  }

  getGivenName(): string {
    const token = this.getToken() as Record<string, any> | undefined;
    return token?.['given_name'] || '';
  }

  getFamilyName(): string {
    const token = this.getToken() as Record<string, any> | undefined;
    return token?.['family_name'] || '';
  }


  getUserRole(): string {
    const token = this.getToken() as Record<string, any> | undefined;
    return token?.['role'] || '';
  }

  private updateCurrentUser(): void {
    if (!this.keycloak) return;

    const token = this.keycloak.tokenParsed as Record<string, any> | undefined;
    const email = token?.['email'] || '';
    const id = token?.['externalId'] || '';
    const name = this.getName();
    const initials = this.getUserInitials();
    const role = this.getUserRole();

    this.currentUser.set({ id, name, initials, email, role });
  }
}
