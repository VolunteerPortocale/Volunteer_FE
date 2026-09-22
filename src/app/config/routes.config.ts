export const APP_ROUTES = {
  HOME: '',
  PROJECTS: 'proiecte',
  ABOUT: 'despre',
  ORGANIZATIONS: 'organizatii',
  LOGIN: 'login',
  SIGNUP: 'inregistrare',
  ADD_EVENT: 'adauga-eveniment',
  OTP: 'confirmare-otp',
  HOME_AUTH: 'home-auth',
  NOT_FOUND: '**'
} as const;

export type AppRoute = typeof APP_ROUTES[keyof typeof APP_ROUTES];