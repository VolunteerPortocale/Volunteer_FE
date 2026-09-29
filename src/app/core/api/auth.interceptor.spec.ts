import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { TranslationService } from '../../service/translation.service';
import { AuthService } from '../../service/auth.service';
import { environment } from '../../../environments/environment';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpTesting: HttpTestingController;
  let authService: AuthService;

  beforeEach(() => {
    localStorage.removeItem('access_token');

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'login', component: class {} },
          { path: 'home-auth', component: class {} }
        ]),
        AuthService,
        {
          provide: TranslationService,
          useValue: { currentLang: () => 'ro' }
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.removeItem('access_token');
  });

  describe('request authentication headers', () => {
    it('should add Basic Authorization header to API requests when no access token exists', () => {
      httpClient.get(`${environment.apiUrl}/projects`).subscribe();

      const req = httpTesting.expectOne(`${environment.apiUrl}/projects`);
      expect(req.request.headers.has('Authorization')).toBe(true);
      expect(req.request.headers.get('Authorization')).toBe(`Basic ${environment.basicAuth}`);
      expect(req.request.headers.get('Accept-Language')).toBe('ro');
      req.flush([]);
    });

    it('should add Bearer token to API requests when access_token is in localStorage', () => {
      localStorage.setItem('access_token', 'my-jwt-token');

      httpClient.get(`${environment.apiUrl}/projects`).subscribe();

      const req = httpTesting.expectOne(`${environment.apiUrl}/projects`);
      expect(req.request.headers.has('Authorization')).toBe(true);
      expect(req.request.headers.get('Authorization')).toBe('Bearer my-jwt-token');
      req.flush([]);
    });

    it('should add Authorization header to relative /api requests', () => {
      httpClient.get('/api/v1/users').subscribe();

      const req = httpTesting.expectOne('/api/v1/users');
      expect(req.request.headers.has('Authorization')).toBe(true);
      expect(req.request.headers.get('Authorization')).toBe(`Basic ${environment.basicAuth}`);
      req.flush([]);
    });

    it('should not add Authorization header to non-API requests', () => {
      httpClient.get('https://other-domain.com/data').subscribe();

      const req = httpTesting.expectOne('https://other-domain.com/data');
      expect(req.request.headers.has('Authorization')).toBe(false);
      expect(req.request.headers.has('Accept-Language')).toBe(false);
      req.flush({});
    });

    it('should preserve existing Authorization header if already set on request', () => {
      httpClient.get(`${environment.apiUrl}/custom`, {
        headers: { Authorization: 'CustomCustomKey' }
      }).subscribe();

      const req = httpTesting.expectOne(`${environment.apiUrl}/custom`);
      expect(req.request.headers.get('Authorization')).toBe('CustomCustomKey');
      req.flush({});
    });
  });

  describe('unauthorized error handling', () => {
    it('should call handleUnauthorized on 401 error', () => {
      const handleUnauthorizedSpy = vi.spyOn(authService, 'handleUnauthorized');

      httpClient.get('/api/protected').subscribe({
        next: () => { throw new Error('Expected request to fail'); },
        error: (err) => {
          expect(err.status).toBe(401);
        },
      });

      const req = httpTesting.expectOne('/api/protected');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      expect(handleUnauthorizedSpy).toHaveBeenCalled();
    });

    it('should not call handleUnauthorized on non-401 errors', () => {
      const handleUnauthorizedSpy = vi.spyOn(authService, 'handleUnauthorized');

      httpClient.get('/api/protected').subscribe({
        next: () => { throw new Error('Expected request to fail'); },
        error: (err) => {
          expect(err.status).toBe(500);
        },
      });

      const req = httpTesting.expectOne('/api/protected');
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

      expect(handleUnauthorizedSpy).not.toHaveBeenCalled();
    });

    it('should not call handleUnauthorized if request is to login or auth endpoint', () => {
      const handleUnauthorizedSpy = vi.spyOn(authService, 'handleUnauthorized');

      httpClient.post('/api/login', {}).subscribe({
        next: () => { throw new Error('Expected request to fail'); },
        error: (err) => {
          expect(err.status).toBe(401);
        },
      });

      const req = httpTesting.expectOne('/api/login');
      req.flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });

      expect(handleUnauthorizedSpy).not.toHaveBeenCalled();
    });
  });
});
