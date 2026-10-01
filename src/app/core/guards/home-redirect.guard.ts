import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { ROUTE_HELPERS } from '../../config/routes.config';

/**
 * Guard that redirects authenticated users visiting the unauthenticated landing page
 * to the authenticated home dashboard (/home-auth).
 */
export const homeRedirectGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (authService.isAuthenticated()) {
    return router.parseUrl(ROUTE_HELPERS.homeAuth());
  }

  return true;
};
