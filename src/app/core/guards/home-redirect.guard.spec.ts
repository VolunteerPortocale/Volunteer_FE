import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { homeRedirectGuard } from './home-redirect.guard';

describe('homeRedirectGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should allow unauthenticated users to access home page', () => {
    authService.isAuthenticated.set(false);

    const result = TestBed.runInInjectionContext(() =>
      homeRedirectGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

    expect(result).toBe(true);
  });

  it('should redirect authenticated users to /home-auth', () => {
    authService.isAuthenticated.set(true);

    const result = TestBed.runInInjectionContext(() =>
      homeRedirectGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

    expect(result).toEqual(router.parseUrl('/'));
  });
});
