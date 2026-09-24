import { ApplicationConfig } from '@angular/core';
import { ApolloClient, InMemoryCache, ApolloLink } from '@apollo/client/core';
import { Apollo, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../service/auth.service';

export function createApollo(httpLink: HttpLink, authService: AuthService): ApolloClient.Options {
  const errorLink = new ErrorLink(({ error }) => {
    // 1. Catch GraphQL protocol errors (e.g., HTTP 200 with UNAUTHENTICATED error payload)
    if (CombinedGraphQLErrors.is(error)) {
      for (const err of error.errors) {
        const code = err.extensions?.['code'];
        const status = err.extensions?.['status'];
        if (code === 'UNAUTHENTICATED' || code === 401 || status === 401) {
          authService.handleUnauthorized();
          break;
        }
      }
      return;
    }

    // 2. Catch network transport errors (HTTP 401 status)
    if (error && typeof error === 'object') {
      const errObj = error as unknown as Record<string, unknown>;
      const cause = (errObj['cause'] && typeof errObj['cause'] === 'object')
        ? (errObj['cause'] as Record<string, unknown>)
        : null;

      const status = typeof errObj['status'] === 'number'
        ? errObj['status']
        : typeof errObj['statusCode'] === 'number'
          ? errObj['statusCode']
          : cause && typeof cause['status'] === 'number'
            ? cause['status']
            : cause && typeof cause['statusCode'] === 'number'
              ? cause['statusCode']
              : null;

      if (status === 401) {
        authService.handleUnauthorized();
      }
    }
  });

  const authLink = new SetContextLink((prevContext) => {
    const accessToken = typeof localStorage !== 'undefined'
      ? localStorage.getItem('access_token')
      : null;
    const authorization = accessToken
      ? `Bearer ${accessToken}`
      : environment.basicAuth
        ? `Basic ${environment.basicAuth}`
        : null;

    return authorization
      ? { headers: { ...prevContext.headers, Authorization: authorization } }
      : {};
  });

  const http = httpLink.create({ uri: environment.graphqlUrl });

  return {
    link: ApolloLink.from([errorLink, authLink, http]),
    cache: new InMemoryCache(),
  };
}

export const graphqlProvider: ApplicationConfig['providers'] = [
  Apollo,
  {
    provide: APOLLO_OPTIONS,
    useFactory: createApollo,
    deps: [HttpLink, AuthService],
  },
];