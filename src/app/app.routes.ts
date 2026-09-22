import { Routes } from '@angular/router';
import { APP_ROUTES } from './config/routes.config';

export const routes: Routes = [
    {
        path: APP_ROUTES.HOME,
        loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent)
    },
    {
        path: APP_ROUTES.ADD_EVENT,
        loadComponent: () => import('./pages/add-event/add-event').then(m => m.AddEventComponent)
    },
    {
        path: APP_ROUTES.SIGNUP,
        loadComponent: () => import('./pages/signup/signup').then(m => m.SignupComponent)
    },
    {
        path: APP_ROUTES.SIGNUP,
        loadComponent: () => import('./pages/signup/signup').then(m => m.SignupComponent)
    },
    {
        path: APP_ROUTES.OTP,
        loadComponent: () => import('./pages/otp-confirmation/otp-confirmation').then(m => m.OtpConfirmationComponent)
    },

    // fallback route
    {
        path: APP_ROUTES.NOT_FOUND,
        redirectTo: APP_ROUTES.HOME,
    }
];
