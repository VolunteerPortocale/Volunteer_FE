import { Routes } from '@angular/router';
import { APP_ROUTES } from './config/routes.config';
import { USER_ROLES } from './config/roles.config';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: APP_ROUTES.HOME,
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent)
  },
  {
    path: APP_ROUTES.HOME_AUTH,
    canActivate: [authGuard],
    loadComponent: () => import('./pages/home-auth/home-auth').then(m => m.HomeAuthComponent)
  },
  {
    path: APP_ROUTES.ADD_EVENT,
    canActivate: [authGuard, roleGuard],
    data: { roles: [USER_ROLES.NGO, USER_ROLES.MODERATOR] },
    loadComponent: () => import('./pages/add-event/add-event').then(m => m.AddEventComponent)
  },
  {
    path: APP_ROUTES.EDIT_EVENT,
    canActivate: [authGuard, roleGuard],
    data: { roles: [USER_ROLES.NGO, USER_ROLES.MODERATOR] },
    loadComponent: () => import('./pages/add-event/add-event').then(m => m.AddEventComponent)
  },
  {
    path: APP_ROUTES.ADMIN_EVENT,
    canActivate: [authGuard, roleGuard],
    data: { roles: [USER_ROLES.NGO, USER_ROLES.MODERATOR] },
    loadComponent: () => import('./pages/event-admin/event-admin').then(m => m.EventAdminComponent)
  },
  {
    path: APP_ROUTES.ADMIN_EVENT_DEFAULT,
    canActivate: [authGuard, roleGuard],
    data: { roles: [USER_ROLES.NGO, USER_ROLES.MODERATOR] },
    loadComponent: () => import('./pages/event-admin/event-admin').then(m => m.EventAdminComponent)
  },
  {
    path: APP_ROUTES.SIGNUP,
    loadComponent: () => import('./pages/signup/signup').then(m => m.SignupComponent)
  },
  {
    path: APP_ROUTES.OTP,
    loadComponent: () => import('./pages/otp-confirmation/otp-confirmation').then(m => m.OtpConfirmationComponent)
  },
  // moderation route:
  // {
  //   path: APP_ROUTES.MODERATION,
  //   canActivate: [authGuard, roleGuard],
  //   data: { roles: [USER_ROLES.NGO, USER_ROLES.MODERATOR] },
  //   loadComponent: () => import('./pages/moderation/...').then(...)
  // },
  {
    path: APP_ROUTES.NOT_FOUND,
    redirectTo: APP_ROUTES.HOME,
  }
];