export const environment = {
  production: true,
  envName: 'Production',
  apiUrl: 'https://api.volunteerio.md',
  graphqlUrl: 'https://api.volunteerio.md/graphql',
  basicAuth: '',
  // ADD THIS:
  keycloak: {
    url: 'https://volunteer-kc.duckdns.org',
    realm: 'volunteer',
    clientId: 'volunteer-fe'
  }
};