import { STAFF_ROLES, type StaffRole } from '@/shared/constants/roles';

export interface JwtPayload {
  sub?: string;
  type?: string;
  authorities?: string[];
  exp?: number;
  iat?: number;
}

/**
 * Decodifica el payload de un token JWT sin dependencias externas.
 */
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Extrae el rol de personal correspondiente a partir de los roles/authorities del JWT.
 * Mapea:
 * - ROLE_HOUSEKEEPING -> 'housekeeping'
 * - ROLE_ROOM_SERVICE -> 'roomService'
 * - ROLE_CONCIERGE -> 'concierge'
 */
export function extractStaffRoleFromAuthorities(authorities: string[]): StaffRole | null {
  for (const auth of authorities) {
    const upper = auth.toUpperCase();
    if (upper === 'ROLE_HOUSEKEEPING') return STAFF_ROLES.HOUSEKEEPING;
    if (upper === 'ROLE_ROOM_SERVICE') return STAFF_ROLES.ROOM_SERVICE;
    if (upper === 'ROLE_CONCIERGE') return STAFF_ROLES.CONCIERGE;
  }
  return null;
}
