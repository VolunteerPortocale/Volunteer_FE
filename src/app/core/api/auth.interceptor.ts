import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const isApiRequest = request.url.startsWith(environment.apiUrl);
  const accessToken = typeof localStorage !== 'undefined'
    ? localStorage.getItem('access_token')
    : null;

  if (!isApiRequest) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: {
      Authorization:`Basic ${environment.basicAuth}`
    }
  }));
};
