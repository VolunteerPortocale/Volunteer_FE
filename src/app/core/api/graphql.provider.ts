import { ApplicationConfig } from '@angular/core';
import { ApolloClient, InMemoryCache } from '@apollo/client/core';
import { Apollo, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { SetContextLink } from '@apollo/client/link/context';
import { environment } from '../../../environments/environment';

export function createApollo(httpLink: HttpLink): ApolloClient.Options {
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

  return {
    link: authLink.concat(httpLink.create({ uri: environment.graphqlUrl })),
    cache: new InMemoryCache(),
  };
}

export const graphqlProvider: ApplicationConfig['providers'] = [
  Apollo,
  {
    provide: APOLLO_OPTIONS,
    useFactory: createApollo,
    deps: [HttpLink],
  },
];