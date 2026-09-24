import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { of } from 'rxjs';
import { GraphqlService, GET_USERS } from './graphql.service';

describe('GraphqlService', () => {
  let service: GraphqlService;
  let apolloMock: { watchQuery: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    apolloMock = {
      watchQuery: vi.fn().mockReturnValue({
        valueChanges: of({
          data: {
            getAllUsers: [
              {
                id: '1',
                firstName: 'Ion',
                lastName: 'Popescu',
                email: 'ion@example.com',
                phoneNumber: '+37360000000',
                role: 'VOLUNTEER',
                status: 'ACTIVE',
                createdAt: '2026-01-01',
              },
            ],
          },
        }),
      }),
    };

    TestBed.configureTestingModule({
      providers: [
        GraphqlService,
        { provide: Apollo, useValue: apolloMock },
      ],
    });

    service = TestBed.inject(GraphqlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should execute watchQuery with GET_USERS and return user list', () => {
    service.getUsers().subscribe((users) => {
      expect((users as Array<{ firstName: string }>).length).toBe(1);
      expect((users as Array<{ firstName: string }>)[0].firstName).toBe('Ion');
    });

    expect(apolloMock.watchQuery).toHaveBeenCalledWith({
      query: GET_USERS,
    });
  });
});
