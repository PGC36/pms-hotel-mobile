/**
 * Roles de personal y tipos de sesión.
 * Un huésped nunca tiene un `StaffRole`; su sesión es de tipo `guest` (architecture.md sección 1).
 */

export const STAFF_ROLES = {
  HOUSEKEEPING: 'housekeeping',
  ROOM_SERVICE: 'roomService',
  CONCIERGE: 'concierge',
} as const;

export type StaffRole = (typeof STAFF_ROLES)[keyof typeof STAFF_ROLES];

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  [STAFF_ROLES.HOUSEKEEPING]: 'Limpieza',
  [STAFF_ROLES.ROOM_SERVICE]: 'Room Service',
  [STAFF_ROLES.CONCIERGE]: 'Conserjería',
};

export const SESSION_TYPES = {
  STAFF: 'staff',
  GUEST: 'guest',
} as const;

export type SessionType = (typeof SESSION_TYPES)[keyof typeof SESSION_TYPES];
