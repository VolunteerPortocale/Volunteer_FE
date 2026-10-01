import { Routes } from '@angular/router';
import { APP_ROUTES } from './config/routes.config';
import { USER_ROLES } from './config/roles.config';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { homeRedirectGuard } from './core/guards/home-redirect.guard';

export const routes: Routes = [
  {
    path: APP_ROUTES.HOME,
    canActivate: [homeRedirectGuard],
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
  {
    path: APP_ROUTES.ABOUT,
    loadComponent: () => import('./pages/about/about').then(m => m.AboutComponent)
  },
  {
    path: APP_ROUTES.PROFILE,
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile').then(m => m.ProfileComponent)
  },
  {
    path: APP_ROUTES.SETTINGS,
    canActivate: [authGuard],
    loadComponent: () => import('./pages/settings/settings').then(m => m.SettingsComponent)
  },
  {
    path: APP_ROUTES.TERMS,
    loadComponent: () => import('./pages/terms/terms').then(m => m.TermsComponent)
  },
  {
    path: APP_ROUTES.PRIVACY,
    loadComponent: () => import('./pages/terms/terms').then(m => m.TermsComponent)
  },
  {
    path: APP_ROUTES.COOKIES,
    loadComponent: () => import('./pages/terms/terms').then(m => m.TermsComponent)
  },
  {
    path: 'termeni-si-conditii',
    redirectTo: APP_ROUTES.TERMS
  },
  {
    path: 'politica-de-confidentialitate',
    redirectTo: APP_ROUTES.PRIVACY
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