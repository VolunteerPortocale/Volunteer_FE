export const APP_ROUTES = {
  HOME: '',
  PROJECTS: 'proiecte',
  ABOUT: 'despre',
  ORGANIZATIONS: 'organizatii',
  LOGIN: 'login',
  SIGNUP: 'inregistrare',
  ADD_EVENT: 'adauga-eveniment',
  EDIT_EVENT: 'editeaza-eveniment/:id',
  MODERATION: 'moderare',
  OTP: 'confirmare-otp',
  HOME_AUTH: 'home-auth',
  NOT_FOUND: '**'
} as const;

export type AppRoute = typeof APP_ROUTES[keyof typeof APP_ROUTES];

/**
 * Centralized route helper methods to build paths and dynamic route params
 */
export const ROUTE_HELPERS = {
  home: () => '/',
  projects: () => `/${APP_ROUTES.PROJECTS}`,
  about: () => `/${APP_ROUTES.ABOUT}`,
  organizations: () => `/${APP_ROUTES.ORGANIZATIONS}`,
  login: () => `/${APP_ROUTES.LOGIN}`,
  signup: () => `/${APP_ROUTES.SIGNUP}`,
  otp: () => `/${APP_ROUTES.OTP}`,
  homeAuth: () => `/${APP_ROUTES.HOME_AUTH}`,
  addEvent: () => `/${APP_ROUTES.ADD_EVENT}`,
  moderation: () => `/${APP_ROUTES.MODERATION}`,
  editEvent: (id: string | number) => `/${APP_ROUTES.EDIT_EVENT.replace(':id', String(id))}`,
} as const;