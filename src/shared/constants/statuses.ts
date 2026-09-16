/**
 * Máquinas de estado — única fuente de verdad sobre qué transición es válida
 * desde cada estado (architecture.md sección 4). `shared/theme/colors.ts` asigna
 * el color de cada uno de estos nombres; no debe haber un estado aquí sin color
 * asignado allá, ni un color allá que no exista aquí.
 */

// ---------------------------------------------------------------------------
// Order (pedidos de Room Service)
// ---------------------------------------------------------------------------

export const ORDER_STATUSES = [
  'pending',
  'accepted',
  'preparing',
  'ready',
  'onTheWay',
  'delivered',
  'rejected',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/**
 * pending → accepted → preparing → ready → onTheWay → delivered
 * pending → rejected
 * cancelable mientras esté en pending o accepted
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['accepted', 'rejected', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['ready'],
  ready: ['onTheWay'],
  onTheWay: ['delivered'],
  delivered: [],
  rejected: [],
  cancelled: [],
};

/** Texto visible al personal para cada estado de `Order` (ej. bandeja de tasks, MOV-07). */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  accepted: 'Aceptado',
  preparing: 'Preparando',
  ready: 'Listo',
  onTheWay: 'En camino',
  delivered: 'Entregado',
  rejected: 'Rechazado',
  cancelled: 'Cancelado',
};

// ---------------------------------------------------------------------------
// ServiceRequest (solicitudes de limpieza, artículos y conserjería)
// ---------------------------------------------------------------------------

export const SERVICE_REQUEST_STATUSES = [
  'pending',
  'accepted',
  'inProgress',
  'completed',
  'rejected',
] as const;

export type ServiceRequestStatus = (typeof SERVICE_REQUEST_STATUSES)[number];

/**
 * pending → accepted → inProgress → completed
 * pending → rejected
 * No existe un estado `cancelled` separado: cancelar una solicitud propia
 * mientras está `pending` (HU-19) se modela como transición a `rejected`.
 */
export const SERVICE_REQUEST_STATUS_TRANSITIONS: Record<
  ServiceRequestStatus,
  ServiceRequestStatus[]
> = {
  pending: ['accepted', 'rejected'],
  accepted: ['inProgress'],
  inProgress: ['completed'],
  completed: [],
  rejected: [],
};

/** Texto visible al personal para cada estado de `ServiceRequest` (ej. bandeja de tasks, MOV-07). */
export const SERVICE_REQUEST_STATUS_LABELS: Record<ServiceRequestStatus, string> = {
  pending: 'Pendiente',
  accepted: 'Aceptada',
  inProgress: 'En progreso',
  completed: 'Completada',
  rejected: 'Rechazada',
};

// ---------------------------------------------------------------------------
// Room — ocupación (`status`). La escribe la web; móvil solo lee.
// Contrato oficial: docs/HANDOFF-MOVIL.md sección 4.
// ---------------------------------------------------------------------------

export const ROOM_STATUSES = ['available', 'occupied', 'maintenance', 'outOfService'] as const;

export type RoomStatus = (typeof ROOM_STATUSES)[number];

/**
 * available → occupied | maintenance | outOfService
 * occupied  → available | maintenance | outOfService
 * maintenance → available | outOfService
 * outOfService → available | maintenance
 * Móvil nunca ejecuta estas transiciones (las aplica la web); se centralizan
 * aquí igual que las demás máquinas para que ninguna pantalla las reimplemente
 * al mostrarlas.
 */
export const ROOM_STATUS_TRANSITIONS: Record<RoomStatus, RoomStatus[]> = {
  available: ['occupied', 'maintenance', 'outOfService'],
  occupied: ['available', 'maintenance', 'outOfService'],
  maintenance: ['available', 'outOfService'],
  outOfService: ['available', 'maintenance'],
};

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  available: 'Disponible',
  occupied: 'Ocupada',
  maintenance: 'Mantenimiento',
  outOfService: 'Fuera de servicio',
};

// ---------------------------------------------------------------------------
// Room — limpieza (`housekeepingStatus`). La escribe móvil.
// ---------------------------------------------------------------------------

export const ROOM_HOUSEKEEPING_STATUSES = ['dirty', 'cleaning', 'clean', 'inspected'] as const;

export type RoomHousekeepingStatus = (typeof ROOM_HOUSEKEEPING_STATUSES)[number];

/**
 * dirty → cleaning → clean → inspected
 * clean/inspected → dirty (la habitación se vuelve a ensuciar)
 */
export const ROOM_HOUSEKEEPING_STATUS_TRANSITIONS: Record<
  RoomHousekeepingStatus,
  RoomHousekeepingStatus[]
> = {
  dirty: ['cleaning'],
  cleaning: ['clean'],
  clean: ['inspected', 'dirty'],
  inspected: ['dirty'],
};

export const ROOM_HOUSEKEEPING_STATUS_LABELS: Record<RoomHousekeepingStatus, string> = {
  dirty: 'Sucia',
  cleaning: 'En limpieza',
  clean: 'Limpia',
  inspected: 'Inspeccionada',
};

/**
 * Una habitación es asignable a un huésped solo si está `available` (libre de
 * ocupación) y su limpieza está `clean` o `inspected`. Nunca reimplementar
 * esta comparación fuera de esta función (docs/HANDOFF-MOVIL.md sección 3.1).
 */
export function isRoomAssignable(
  status: RoomStatus,
  housekeepingStatus: RoomHousekeepingStatus,
): boolean {
  return status === 'available' && (housekeepingStatus === 'clean' || housekeepingStatus === 'inspected');
}

// ---------------------------------------------------------------------------
// Booking — la gestiona la web de punta a punta; móvil solo lee, nunca
// transiciona. Se centraliza aquí de todos modos (contrato sección 4) para
// que ninguna pantalla compare literales de estado por su cuenta.
// ---------------------------------------------------------------------------

export const BOOKING_STATUSES = [
  'pending',
  'confirmed',
  'checkedIn',
  'checkedOut',
  'cancelled',
  'noShow',
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const BOOKING_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['confirmed', 'cancelled', 'noShow'],
  confirmed: ['checkedIn', 'cancelled', 'noShow'],
  checkedIn: ['checkedOut'],
  checkedOut: [],
  cancelled: [],
  noShow: [],
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  checkedIn: 'Con check-in',
  checkedOut: 'Con check-out',
  cancelled: 'Cancelada',
  noShow: 'No show',
};

// ---------------------------------------------------------------------------

export function isValidTransition<T extends string>(
  transitions: Record<T, T[]>,
  from: T,
  to: T,
): boolean {
  return transitions[from].includes(to);
}
