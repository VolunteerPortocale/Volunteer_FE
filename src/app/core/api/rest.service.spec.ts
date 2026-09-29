import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RestService } from './rest.service';
import { environment } from '../../../environments/environment';

describe('RestService', () => {
  let service: RestService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RestService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(RestService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call GET /v1/users', () => {
    const mockUsers = [{ id: '1', name: 'John Doe' }];

    service.getUsers().subscribe((users) => {
      expect(users).toEqual(mockUsers);
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/v1/users`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });
});
