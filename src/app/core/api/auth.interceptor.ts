import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { inject } from '@angular/core';
import { TranslationService } from '../../service/translation.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const isApiRequest = request.url.startsWith(environment.apiUrl);
  if (!isApiRequest) {
    return next(request);
  }

  const translationService = inject(TranslationService);
  const currentLang = translationService.currentLang();

  return next(request.clone({
    setHeaders: {
      Authorization: `Basic ${environment.basicAuth}`,
      'Accept-Language': currentLang
    }
  }));
};