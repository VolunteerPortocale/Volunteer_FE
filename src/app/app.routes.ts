import { Routes } from '@angular/router';
import { APP_ROUTES } from './config/routes.config';
import { USER_ROLES } from './config/roles.config';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  // 1. Root route: authenticated dashboard
  {
    path: '',
    pathMatch: 'full',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/home-auth/home-auth').then(m => m.HomeAuthComponent)
  },
  // 2. /guest route: unauthorized public page
  {
    path: APP_ROUTES.GUEST, // 'guest'
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent)
  },
  // 3. Redirect aliases
  {
    path: 'home',
    redirectTo: APP_ROUTES.GUEST,
    pathMatch: 'full'
  },
  {
    path: 'home-auth',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: APP_ROUTES.ADD_EVENT,
    canActivate: [authGuard, roleGuard],
    data: { roles: [USER_ROLES.NGO, USER_ROLES.MODERATOR] },
    loadComponent: () => import('./pages/event-management/add-event/add-event').then(m => m.AddEvent)
  },
  {
    path: APP_ROUTES.EDIT_EVENT,
    canActivate: [authGuard, roleGuard],
    data: { roles: [USER_ROLES.NGO, USER_ROLES.MODERATOR] },
    loadComponent: () => import('./pages/event-management/edit-event/edit-event').then(m => m.EditEvent)
  },
  {
    path: APP_ROUTES.ADMIN_EVENT,
    canActivate: [authGuard, roleGuard],
    data: { roles: [USER_ROLES.NGO, USER_ROLES.MODERATOR] },
    loadComponent: () => import('./pages/event-management/manage-events/my-projects-NGO/my-project-ngo').then(m => m.MyProjectNgoComponent)
  },
  {
    path: APP_ROUTES.ADMIN_EVENT_DEFAULT,
    canActivate: [authGuard, roleGuard],
    data: { roles: [USER_ROLES.NGO, USER_ROLES.MODERATOR] },
    loadComponent: () => import('./pages/event-management/manage-events/my-projects-NGO/my-project-ngo').then(m => m.MyProjectNgoComponent)
  },
  {
    path: APP_ROUTES.MANAGE_EVENTS,
    canActivate: [authGuard, roleGuard],
    data: { roles: [USER_ROLES.NGO, USER_ROLES.MODERATOR] },
    loadComponent: () => import('./pages/event-management/manage-events/my-projects-NGO/my-project-ngo').then(m => m.MyProjectNgoComponent)
  },
  {
    path: 'manage-events',
    redirectTo: APP_ROUTES.ADMIN_EVENT_DEFAULT,
    pathMatch: 'full'
  },
  {
    path: APP_ROUTES.SCAN_QR,
    canActivate: [authGuard, roleGuard],
    data: { roles: [USER_ROLES.NGO, USER_ROLES.MODERATOR, USER_ROLES.ADMIN] },
    loadComponent: () => import('./pages/event-management/qr-scanner/qr-scanner.component').then(m => m.QrScannerComponent)
  },
  {
    path: APP_ROUTES.SIGNUP,
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/signup/signup').then(m => m.SignupComponent)
  },
  {
    path: APP_ROUTES.OTP,
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/otp-confirmation/otp-confirmation').then(m => m.OtpConfirmationComponent)
  },
  {
    path: APP_ROUTES.ABOUT,
    loadComponent: () => import('./pages/about/about').then(m => m.AboutComponent)
  },
  {
    path: APP_ROUTES.PROJECTS,
    canActivate: [authGuard],
    loadComponent: () => import('./pages/event-management/manage-events/my-projects-VOL/my-projects-vol').then(m => m.MyProjectsVolComponent)
  },
  {
    path: APP_ROUTES.PROFILE,
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile').then(m => m.ProfileComponent)
  },
  {
    path: APP_ROUTES.SETTINGS,
    redirectTo: APP_ROUTES.PROFILE
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
    redirectTo: '',
  }
];
