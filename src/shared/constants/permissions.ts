import { STAFF_ROLES, type StaffRole } from './roles';

/**
 * Permisos por rol de personal. No cubre al huésped: su acceso ya está acotado
 * por completo a `GuestNavigator` (architecture.md sección 1).
 */
export const PERMISSIONS = {
  VIEW_ROOMS: 'viewRooms',
  MANAGE_ROOMS: 'manageRooms',
  REPORT_ROOM_ISSUE: 'reportRoomIssue',
  VIEW_ORDERS: 'viewOrders',
  MANAGE_ORDERS: 'manageOrders',
  CHARGE_ORDER_TO_ROOM: 'chargeOrderToRoom',
  VIEW_REQUESTS: 'viewRequests',
  MANAGE_REQUESTS: 'manageRequests',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<StaffRole, Permission[]> = {
  [STAFF_ROLES.HOUSEKEEPING]: [
    PERMISSIONS.VIEW_ROOMS,
    PERMISSIONS.MANAGE_ROOMS,
    PERMISSIONS.REPORT_ROOM_ISSUE,
    PERMISSIONS.VIEW_REQUESTS,
    PERMISSIONS.MANAGE_REQUESTS,
  ],
  [STAFF_ROLES.ROOM_SERVICE]: [
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.MANAGE_ORDERS,
    PERMISSIONS.CHARGE_ORDER_TO_ROOM,
  ],
  [STAFF_ROLES.CONCIERGE]: [PERMISSIONS.VIEW_REQUESTS, PERMISSIONS.MANAGE_REQUESTS],
};

export function hasPermission(role: StaffRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
