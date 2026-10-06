export const environment = {
  production: true,
  envName: 'Production',
  apiUrl: 'https://volunteer-be-rs60.onrender.com/api',
  graphqlUrl: 'https://volunteer-be-rs60.onrender.com/graphql',
  basicAuth: '',
  // ADD THIS:
  keycloak: {
    url: 'https://volunteer-kc.duckdns.org',
    realm: 'volunteer',
    clientId: 'volunteer-fe'
  }
};