import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TranslationService } from '../../service/translation.service';
import { AuthService } from '../../service/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const isApiRequest = request.url.startsWith(environment.apiUrl) || request.url.startsWith('/api');
  if (!isApiRequest) {
    return next(request);
  }

  const authService = inject(AuthService);
  const translationService = inject(TranslationService);
  const platformId = inject(PLATFORM_ID);

  const headers: Record<string, string> = {};

  if (!request.headers.has('Authorization')) {
    const accessToken = isPlatformBrowser(platformId) && typeof localStorage !== 'undefined'
      ? localStorage.getItem('access_token')
      : null;

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    } else if (environment.basicAuth) {
      headers['Authorization'] = `Basic ${environment.basicAuth}`;
    }
  }

  const currentLang = translationService.currentLang();
  if (currentLang && !request.headers.has('Accept-Language')) {
    headers['Accept-Language'] = currentLang;
  }

  const req = Object.keys(headers).length > 0
    ? request.clone({ setHeaders: headers })
    : request;

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        const isAuthRequest = request.url.includes('/login') || request.url.includes('/auth');
        if (!isAuthRequest) {
          authService.handleUnauthorized();
        }
      }
      return throwError(() => error);
    })
  );
};

// Aliases for backward compatibility
export const unauthorizedInterceptor = authInterceptor;
export const errorInterceptor = authInterceptor;