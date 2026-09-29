import { TestBed } from '@angular/core/testing';
import { ApolloClient, gql, ApolloLink, Observable } from '@apollo/client/core';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { HttpLink } from 'apollo-angular/http';
import { provideRouter } from '@angular/router';
import { createApollo } from './graphql.provider';
import { AuthService } from '../../service/auth.service';

describe('graphqlProvider ErrorLink', () => {
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'login', component: class {} },
          { path: 'home-auth', component: class {} }
        ]),
        AuthService,
      ],
    });

    authService = TestBed.inject(AuthService);
  });

  it('should call handleUnauthorized when GraphQL returns UNAUTHENTICATED error', async () => {
    const handleSpy = vi.spyOn(authService, 'handleUnauthorized');

    const mockHttpLink = {
      create: () => new ApolloLink(() => {
        return new Observable((observer) => {
          observer.error(new CombinedGraphQLErrors({
            errors: [
              { message: 'Unauthorized', extensions: { code: 'UNAUTHENTICATED' } }
            ]
          }));
        });
      }),
    } as unknown as HttpLink;

    const options = createApollo(mockHttpLink, authService);
    const client = new ApolloClient(options);

    try {
      await client.query({ query: gql`query { test }` });
    } catch {
      // Expected to fail
    }

    expect(handleSpy).toHaveBeenCalled();
  });

  it('should call handleUnauthorized when network error status is 401', async () => {
    const handleSpy = vi.spyOn(authService, 'handleUnauthorized');

    const mockHttpLink = {
      create: () => new ApolloLink(() => {
        return new Observable((observer) => {
          observer.error({ status: 401, message: 'Unauthorized' });
        });
      }),
    } as unknown as HttpLink;

    const options = createApollo(mockHttpLink, authService);
    const client = new ApolloClient(options);

    try {
      await client.query({ query: gql`query { test }` });
    } catch {
      // Expected to fail
    }

    expect(handleSpy).toHaveBeenCalled();
  });

  it('should not call handleUnauthorized for other GraphQL errors', async () => {
    const handleSpy = vi.spyOn(authService, 'handleUnauthorized');

    const mockHttpLink = {
      create: () => new ApolloLink(() => {
        return new Observable((observer) => {
          observer.error(new CombinedGraphQLErrors({
            errors: [
              { message: 'Bad request', extensions: { code: 'BAD_USER_INPUT' } }
            ]
          }));
        });
      }),
    } as unknown as HttpLink;

    const options = createApollo(mockHttpLink, authService);
    const client = new ApolloClient(options);

    try {
      await client.query({ query: gql`query { test }` });
    } catch {
      // Expected to fail
    }

    expect(handleSpy).not.toHaveBeenCalled();
  });
});
