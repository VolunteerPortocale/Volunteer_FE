import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { ROUTE_HELPERS } from '../../config/routes.config';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) return true;

  // 1. Must be authenticated
  if (!authService.isAuthenticated()) {
    return router.parseUrl(ROUTE_HELPERS.home());
  }

  // 2. Check roles specified in route data
  const expectedRoles = route.data?.['roles'] as string[] | undefined;
  if (!expectedRoles || expectedRoles.length === 0) {
    return true;
  }

  // 3. If volunteer attempts to access NGO/Moderator routes -> redirect
  if (authService.hasRole(expectedRoles)) {
    return true;
  }

  // Unauthorized: redirect volunteer to home-auth
  return router.parseUrl(ROUTE_HELPERS.homeAuth());
};