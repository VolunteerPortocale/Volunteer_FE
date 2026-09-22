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

    // fallback route
    {
        path: APP_ROUTES.NOT_FOUND,
        redirectTo: APP_ROUTES.HOME,
    }
];
