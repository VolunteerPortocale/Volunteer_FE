export const environment = {
  production: false,
  envName: 'Local (dev)',
  apiUrl: 'https://volunteer-be-rs60.onrender.com/api',
  graphqlUrl: 'https://volunteer-be-rs60.onrender.com/graphql',
  basicAuth: 'YWRtaW46cGFzc3dvcmQxMjM=',
  keycloak: {
    url: 'https://volunteer-kc.duckdns.org/',
    realm: 'volunteer',
    clientId: 'volunteer-fe'
  }
};