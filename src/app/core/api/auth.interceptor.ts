import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';

import { TranslationService } from '../../service/translation.service';
import { AuthService } from '../../service/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  // Skip translation files to avoid circular dependency
  if (request.url.startsWith('/i18n/') || request.url.startsWith('i18n/')) {
    return next(request);
  }

  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return next(request);
  }

  const authService = inject(AuthService);
  const currentLang = inject(TranslationService).currentLang();

  return from(authService.getToken()).pipe(
    switchMap((token) => {
      let headers = request.headers.delete('Authorization');

      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }

      if (currentLang && !headers.has('Accept-Language')) {
        headers = headers.set('Accept-Language', currentLang);
      }

      return next(request.clone({ headers }));
    }),

    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        authService.isAuthenticated()
      ) {
        void authService.handleUnauthorized();
      }

      return throwError(() => error);
    }),
  );
};
