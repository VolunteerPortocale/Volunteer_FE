import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from '../../service/auth.service';
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

  return from(authService.getToken()).pipe(
    switchMap(token => {
      const headers: Record<string, string> = {
        'Accept-Language': currentLang
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (environment.basicAuth) {
        headers['Authorization'] = `Basic ${environment.basicAuth}`;
      }

      return next(request.clone({ setHeaders: headers }));
    })
  );
};
