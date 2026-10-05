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
 * cancelable desde pending, accepted, preparing o ready; desde onTheWay solo
 * puede entregarse. Igual que `POST /room-service/orders/{orderId}/status`
 * del backend (MOV-10). El DTO usa `on_the_way`; el mapper lo traduce.
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['accepted', 'rejected', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['onTheWay', 'cancelled'],
  onTheWay: ['delivered'],
  delivered: [],
  rejected: [],
  cancelled: [],
};

/** Texto visible al personal para cada estado de `Order` (ej. bandeja de tasks, MOV-07). */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  accepted: 'Aceptado',
  preparing: 'En preparación',
  ready: 'Listo',
  onTheWay: 'En camino',
  delivered: 'Entregado',
  rejected: 'Rechazado',
  cancelled: 'Cancelado',
};

// ---------------------------------------------------------------------------
// ServiceRequest (solicitudes de limpieza y artículos — mock de MOV-09)
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
// ConciergeRequest (solicitudes de conserjería, API real — MOV-11)
// ---------------------------------------------------------------------------

/**
 * Máquina propia de conserjería, separada de `ServiceRequest` (que sigue
 * siendo el mock de Limpieza en MOV-09) para no darle a Limpieza estados ni
 * acciones que su mock no soporta. El DTO usa `in_progress`; el mapper lo
 * traduce a `inProgress`.
 */
export const CONCIERGE_REQUEST_STATUSES = [
  'pending',
  'accepted',
  'inProgress',
  'completed',
  'rejected',
  'cancelled',
] as const;

export type ConciergeRequestStatus = (typeof CONCIERGE_REQUEST_STATUSES)[number];

/**
 * pending → accepted → inProgress → completed
 * pending → rejected (rechazar solo antes de aceptar)
 * pending | accepted | inProgress → cancelled
 * Igual que `ConciergeRequestServiceImpl.TRANSITIONS` del backend.
 */
export const CONCIERGE_REQUEST_STATUS_TRANSITIONS: Record<
  ConciergeRequestStatus,
  ConciergeRequestStatus[]
> = {
  pending: ['accepted', 'rejected', 'cancelled'],
  accepted: ['inProgress', 'cancelled'],
  inProgress: ['completed', 'cancelled'],
  completed: [],
  rejected: [],
  cancelled: [],
};

export const CONCIERGE_REQUEST_STATUS_LABELS: Record<ConciergeRequestStatus, string> = {
  pending: 'Pendiente',
  accepted: 'Aceptado',
  inProgress: 'En atención',
  completed: 'Completado',
  rejected: 'Rechazado',
  cancelled: 'Cancelado',
};

// ---------------------------------------------------------------------------
// Room — ocupación (`Room.status`)
// ---------------------------------------------------------------------------

/**
 * Estado operativo/ocupación de la habitación. Lo controla la web
 * (recepción); para Housekeeping es de solo lectura, por eso no tiene tabla
 * de transiciones aquí (MOV-09). El DTO usa `out_of_service`; el mapper lo
 * traduce a `outOfService`, igual que `onTheWay`/`inProgress`.
 */
export const ROOM_STATUSES = ['available', 'occupied', 'maintenance', 'outOfService'] as const;

export type RoomStatus = (typeof ROOM_STATUSES)[number];

// ---------------------------------------------------------------------------
// Room — limpieza (`Room.housekeepingStatus`)
// ---------------------------------------------------------------------------

export const ROOM_HOUSEKEEPING_STATUSES = ['dirty', 'cleaning', 'clean', 'inspected'] as const;

export type RoomHousekeepingStatus = (typeof ROOM_HOUSEKEEPING_STATUSES)[number];

/**
 * dirty → cleaning → clean → inspected
 * Solo las transiciones que el backend expone (`start`, `complete`,
 * `inspect` — MOV-09). Sin `clean → dirty`, `inspected → dirty` ni
 * `blocked`: no existe una operación autorizada que las respalde.
 */
export const ROOM_HOUSEKEEPING_STATUS_TRANSITIONS: Record<
  RoomHousekeepingStatus,
  RoomHousekeepingStatus[]
> = {
  dirty: ['cleaning'],
  cleaning: ['clean'],
  clean: ['inspected'],
  inspected: [],
};

// ---------------------------------------------------------------------------

export function isValidTransition<T extends string>(
  transitions: Record<T, T[]>,
  from: T,
  to: T,
): boolean {
  return transitions[from].includes(to);
}
