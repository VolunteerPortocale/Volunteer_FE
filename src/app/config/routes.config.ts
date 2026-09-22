export const APP_ROUTES = {
  HOME: '',
  PROJECTS: 'proiecte',
  ABOUT: 'despre',
  ORGANIZATIONS: 'organizatii',
  LOGIN: 'login',
  ADD_EVENT: 'adauga-eveniment',
  NOT_FOUND: '**'
} as const;

export type AppRoute = typeof APP_ROUTES[keyof typeof APP_ROUTES];