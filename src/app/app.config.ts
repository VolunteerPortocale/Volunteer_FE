import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { graphqlProvider } from './core/api/graphql.provider';
import { authInterceptor } from './core/api/auth.interceptor';

import { AuthService } from './service/auth.service';
import { UserSessionService } from './service/user-session.service';
import { CurrentUserLoaderService } from './service/current-user-loader.service';

async function initializeAuthentication(): Promise<void> {
  const authService = inject(AuthService);
  const userSession = inject(UserSessionService);
  const userLoader = inject(CurrentUserLoaderService);

  const authenticated = await authService.init();

  if (!authenticated) {
    return;
  }

  const subject = authService.getSubject();

  if (!subject) {
    userSession.clear();
    return;
  }

  // Restore cached user information.
  userSession.restore(subject);

  // Fetch the latest user information from GraphQL.
  try {
    await userLoader.load(subject);
  } catch (error) {
    console.error('Failed to load current user:', error);
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),

    provideAppInitializer(initializeAuthentication),

    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),

    ...graphqlProvider,
  ],
};
