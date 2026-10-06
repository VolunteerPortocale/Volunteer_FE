import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { ROUTE_HELPERS } from '../../config/routes.config';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) return true;

  // If already logged in, redirect to root dashboard
  if (authService.isAuthenticated()) {
    return router.parseUrl(ROUTE_HELPERS.homeAuth());
  }

  return true;
};