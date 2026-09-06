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

// ---------------------------------------------------------------------------
// Room (estado operativo de limpieza de la habitación)
// ---------------------------------------------------------------------------

export const ROOM_STATUSES = ['dirty', 'cleaning', 'clean', 'inspected', 'blocked'] as const;

export type RoomStatus = (typeof ROOM_STATUSES)[number];

/**
 * dirty → cleaning → clean → inspected
 * cualquiera → blocked (mantenimiento)
 * blocked → dirty: una vez resuelto el mantenimiento, la habitación vuelve
 * al ciclo de limpieza normal. No está en architecture.md explícitamente,
 * pero sin esta salida una habitación bloqueada nunca podría recuperarse.
 */
export const ROOM_STATUS_TRANSITIONS: Record<RoomStatus, RoomStatus[]> = {
  dirty: ['cleaning', 'blocked'],
  cleaning: ['clean', 'blocked'],
  clean: ['inspected', 'dirty', 'blocked'],
  inspected: ['dirty', 'blocked'],
  blocked: ['dirty'],
};

// ---------------------------------------------------------------------------

export function isValidTransition<T extends string>(
  transitions: Record<T, T[]>,
  from: T,
  to: T,
): boolean {
  return transitions[from].includes(to);
}
