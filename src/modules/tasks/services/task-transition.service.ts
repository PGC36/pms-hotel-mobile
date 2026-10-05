import {
  CONCIERGE_REQUEST_STATUS_TRANSITIONS,
  isValidTransition,
  ORDER_STATUS_TRANSITIONS,
  ROOM_HOUSEKEEPING_STATUS_TRANSITIONS,
  SERVICE_REQUEST_STATUS_TRANSITIONS,
  type ConciergeRequestStatus,
  type OrderStatus,
  type RoomHousekeepingStatus,
  type ServiceRequestStatus,
} from '@/shared/constants/statuses';

/**
 * Punto único que valida transiciones de estado para los tres módulos de
 * dominio (Order, ServiceRequest, Room) — arquitectura sección 3: el módulo
 * `tasks` es el núcleo genérico que el resto reutiliza. Ningún servicio de
 * dominio debe reimplementar esta validación.
 */
export class InvalidTransitionError extends Error {
  constructor(entityLabel: string, from: string, to: string) {
    super(`Transición inválida para ${entityLabel}: "${from}" → "${to}"`);
    this.name = 'InvalidTransitionError';
  }
}

export function assertValidTransition<T extends string>(
  transitions: Record<T, T[]>,
  from: T,
  to: T,
  entityLabel: string,
): void {
  if (!isValidTransition(transitions, from, to)) {
    throw new InvalidTransitionError(entityLabel, from, to);
  }
}

export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  return isValidTransition(ORDER_STATUS_TRANSITIONS, from, to);
}

export function canTransitionServiceRequest(
  from: ServiceRequestStatus,
  to: ServiceRequestStatus,
): boolean {
  return isValidTransition(SERVICE_REQUEST_STATUS_TRANSITIONS, from, to);
}

export function canTransitionConciergeRequest(
  from: ConciergeRequestStatus,
  to: ConciergeRequestStatus,
): boolean {
  return isValidTransition(CONCIERGE_REQUEST_STATUS_TRANSITIONS, from, to);
}

/** Valida solo la limpieza (`housekeepingStatus`); la ocupación de Room es de solo lectura. */
export function canTransitionRoom(
  from: RoomHousekeepingStatus,
  to: RoomHousekeepingStatus,
): boolean {
  return isValidTransition(ROOM_HOUSEKEEPING_STATUS_TRANSITIONS, from, to);
}
