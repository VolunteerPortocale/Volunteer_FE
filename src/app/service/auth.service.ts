import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Keycloak from 'keycloak-js';
import { environment } from '../../environments/environment';
import { EVENT_MANAGEMENT_ROLES, USER_ROLES } from '../config/roles.config';

export interface UserProfile {
  name: string;
  initials: string;
  email: string;
  role?: string;    // for display
  roles?: string[]; // for permissions
}

@Injectable({
  providedIn: 'root'
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
    const rolesList: readonly string[] = typeof allowedRoles === 'string' ? [allowedRoles] : allowedRoles;
    const allowed = rolesList.map(r => r.toLowerCase().trim().replace(/^role_/, ''));
    
    const userRoles = [
      user.role?.toLowerCase().trim().replace(/^role_/, ''),
      ...(user.roles?.map(r => r.toLowerCase().trim().replace(/^role_/, '')) || [])
    ].filter(Boolean) as string[];
    return allowed.some(target => {
      if (target === USER_ROLES.VOLUNTEER && userRoles.includes('voluntar')) return true;
      if (target === USER_ROLES.NGO && (userRoles.includes('ong') || userRoles.includes('ngo'))) return true;
      return userRoles.includes(target);
    });
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
      clientId: environment.keycloak.clientId
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
        idToken
      });
      this.isAuthenticated.set(authenticated);
      if (authenticated) {
        if (this.keycloak.token) localStorage.setItem('access_token', this.keycloak.token);
        if (this.keycloak.refreshToken) localStorage.setItem('refresh_token', this.keycloak.refreshToken);
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
        redirectUri: redirectUri || `${window.location.origin}/`
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
          redirectUri: redirectUri || `${window.location.origin}/guest`
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

    const clientId = environment.keycloak.clientId;
    const realmRoles = (token?.['realm_access']?.['roles'] as string[]) || [];
    const customRealmRoles = (token?.['new_keycloak_realm_access_roles'] as string[]) || [];
    const clientRoles = (token?.['resource_access']?.[clientId]?.['roles'] as string[]) || [];
    const directRoles = (token?.['roles'] as string[]) || [];

    const allRawRoles = Array.from(new Set([...realmRoles, ...customRealmRoles, ...clientRoles, ...directRoles]));

    const ignoredRoles = new Set([
      'default-roles-volunteer',
      'offline_access',
      'uma_authorization',
    ]);

    const appRoles = allRawRoles
      .filter((r) => !ignoredRoles.has(r))
      .map((r) => r.replace(/^ROLE_/i, ''));

    // Check if registration saved role in localStorage as fallback
    const storedRole = typeof localStorage !== 'undefined' ? localStorage.getItem('user_role') : null;
    if (storedRole && !appRoles.some(r => r.toLowerCase() === storedRole.toLowerCase())) {
      appRoles.push(storedRole);
    }

    const primaryRole = appRoles[0]
      ? appRoles[0].charAt(0).toUpperCase() + appRoles[0].slice(1).toLowerCase()
      : 'Voluntar';

    this.currentUser.set({ name, initials, email, role: primaryRole, roles: appRoles });
  }
}