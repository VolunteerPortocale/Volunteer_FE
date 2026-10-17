import { ApplicationConfig, inject } from '@angular/core';
import { ApolloClient, InMemoryCache, ApolloLink } from '@apollo/client/core';
import { provideNamedApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../service/auth.service';
import { TranslationService } from '../../service/translation.service';

export function createApollo(
  httpLink: HttpLink,
  authService: AuthService,
  translationService: TranslationService
): ApolloClient.Options {
  const errorLink = new ErrorLink(({ error }) => {
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

    if (error && typeof error === 'object') {
      const errObj = error as unknown as Record<string, unknown>;

      const cause =
        errObj['cause'] && typeof errObj['cause'] === 'object'
          ? (errObj['cause'] as Record<string, unknown>)
          : null;

      const status =
        typeof errObj['status'] === 'number'
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

  const authAndLanguageLink = new SetContextLink(async (prevContext) => {
    const accessToken = await authService.getToken();
    const currentLang = translationService.currentLang() || 'ro';

    const headers: Record<string, string> = {
      ...prevContext.headers,
      'Accept-Language': currentLang,
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return { headers };
  });

  return {
    link: ApolloLink.from([
      errorLink,
      authAndLanguageLink,
      httpLink.create({
        uri: environment.graphqlUrl,
      }),
    ]),
    cache: new InMemoryCache(),
  };
}

export function createPublicApollo(
  httpLink: HttpLink,
  translationService: TranslationService
): ApolloClient.Options {
  const languageLink = new SetContextLink((prevContext) => {
    const currentLang = translationService.currentLang() || 'ro';
    return {
      headers: {
        ...prevContext.headers,
        'Accept-Language': currentLang,
      },
    };
  });

  return {
    link: ApolloLink.from([
      languageLink,
      httpLink.create({
        uri: environment.graphqlPublicUrl,
      }),
    ]),
    cache: new InMemoryCache(),
  };
}

export const graphqlProvider: ApplicationConfig['providers'] = [
  provideNamedApollo(() => {
    const httpLink = inject(HttpLink);
    const authService = inject(AuthService);
    const translationService = inject(TranslationService);

    return {
      default: createApollo(httpLink, authService, translationService),
      public: createPublicApollo(httpLink, translationService),
    };
  }),
];