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
