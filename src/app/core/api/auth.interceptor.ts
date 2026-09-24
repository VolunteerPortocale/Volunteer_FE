import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from '../../service/auth.service';
import { TranslationService } from '../../service/translation.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const isApiRequest = request.url.startsWith(environment.apiUrl);
  if (!isApiRequest) {
    return next(request);
  }

  const authService = inject(AuthService);
  const translationService = inject(TranslationService);
  const currentLang = translationService.currentLang();

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