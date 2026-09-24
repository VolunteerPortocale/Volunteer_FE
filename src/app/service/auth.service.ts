import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { APP_ROUTES } from '../config/routes.config';
import Keycloak from 'keycloak-js';
import { environment } from '../../environments/environment';

export interface UserProfile {
  name: string;
  initials: string;
  email: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly storageKey = 'volunteerio_auth_state';
  private keycloak: Keycloak | null = null;

  readonly currentUser = signal<UserProfile | null>(null);
  readonly isAuthenticated = signal<boolean>(false);

  private isRedirecting = false;

  login(user: UserProfile = DEFAULT_USER): void {
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.storageKey, 'true');
  async init(): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    this.keycloak = new Keycloak({
      url: environment.keycloak.url,
      realm: environment.keycloak.realm,
      clientId: environment.keycloak.clientId
    });

    try {
      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        checkLoginIframe: false
      });

      this.isAuthenticated.set(authenticated);

      if (authenticated) {
        if (this.keycloak.token) {
          localStorage.setItem('access_token', this.keycloak.token);
        }
        this.updateCurrentUser();
      } else {
        localStorage.removeItem('access_token');
        this.currentUser.set(null);
      }

      return authenticated;
    } catch (error) {
      console.error('Keycloak initialization failed:', error);
      return false;
    }
  }

  async login(redirectUri?: string): Promise<void> {
    if (isPlatformBrowser(this.platformId) && this.keycloak) {
      await this.keycloak.login({
        redirectUri: redirectUri || `${window.location.origin}/home-auth`
      });
    }
  }

  async logout(redirectUri?: string): Promise<void> {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      if (this.keycloak) {
        await this.keycloak.logout({
          redirectUri: redirectUri || `${window.location.origin}/`
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

  private updateCurrentUser(): void {
    if (!this.keycloak) return;

    const token = this.keycloak.tokenParsed as Record<string, any> | undefined;
    const givenName = token?.['given_name'] || '';
    const familyName = token?.['family_name'] || '';
    const username = token?.['preferred_username'] || '';
    const email = token?.['email'] || '';

    const name = givenName && familyName
      ? `${givenName} ${familyName}`
      : givenName || familyName || username || 'Utilizator';

    const initials = givenName && familyName
      ? `${givenName[0]}${familyName[0]}`.toUpperCase()
      : name.substring(0, Math.min(2, name.length)).toUpperCase();

    const realmRoles = (token?.['realm_access']?.['roles'] as string[]) || [];
    const appRoles = realmRoles.filter(
      (r) => !['default-roles-volunteer', 'offline_access', 'uma_authorization'].includes(r)
    );
    const role = appRoles[0] ? appRoles[0].charAt(0).toUpperCase() + appRoles[0].slice(1).toLowerCase() : 'Voluntar';

    this.currentUser.set({ name, initials, email, role });
  }
}
