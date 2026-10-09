export const USER_ROLES = {
  VOLUNTEER: 'volunteer',
  NGO: 'ngo',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
} as const;

export type AppUserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

/**
 * Roles permitted to create, edit, and moderate events
 */
export const EVENT_MANAGEMENT_ROLES: readonly AppUserRole[] = [
  USER_ROLES.NGO,
  USER_ROLES.MODERATOR,
] as const;
