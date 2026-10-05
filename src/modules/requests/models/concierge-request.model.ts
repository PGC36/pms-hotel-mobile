import {
  CONCIERGE_REQUEST_STATUS_TRANSITIONS,
  type ConciergeRequestStatus,
} from '@/shared/constants/statuses';

import type { ServiceRequestTypeDTO } from '../dtos/concierge-request.dto';

/** Tipo de la solicitud; no cambia de forma entre wire y modelo. */
export type ConciergeRequestType = ServiceRequestTypeDTO;

export interface ConciergeRequestModel {
  id: string;
  bookingId: string;
  roomId: string | null;
  roomNumber: string | null;
  guestId: string | null;
  guestName: string | null;
  /** Responsable que asignó el backend; `null` mientras nadie la ha tomado. */
  responsibleUserId: string | null;
  responsibleUserName: string | null;
  responsibleUserEmail: string | null;
  type: ConciergeRequestType;
  description: string;
  status: ConciergeRequestStatus;
  notes: string | null;
  /** Valor tal como lo devuelve el backend (que no crea cargos de conserjería). */
  chargeId: string | null;
  requestedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Terminal = sin transiciones salientes en `CONCIERGE_REQUEST_STATUS_TRANSITIONS`
 * (`completed`, `rejected`, `cancelled`).
 */
export function isTerminalConciergeRequestStatus(status: ConciergeRequestStatus): boolean {
  return CONCIERGE_REQUEST_STATUS_TRANSITIONS[status].length === 0;
}

/** Solicitudes que aún requieren atención (`pending`, `accepted`, `inProgress`), en el orden recibido. */
export function getActiveConciergeRequests(
  requests: ConciergeRequestModel[],
): ConciergeRequestModel[] {
  return requests.filter((request) => !isTerminalConciergeRequestStatus(request.status));
}

/** Solicitudes cerradas (`completed`, `rejected`, `cancelled`), en el orden recibido. */
export function getTerminalConciergeRequests(
  requests: ConciergeRequestModel[],
): ConciergeRequestModel[] {
  return requests.filter((request) => isTerminalConciergeRequestStatus(request.status));
}

/**
 * Copia en orden inverso: el backend entrega de la más antigua a la más
 * reciente y el historial se lee al revés. No muta el arreglo recibido.
 */
export function sortConciergeRequestsNewestFirst(
  requests: ConciergeRequestModel[],
): ConciergeRequestModel[] {
  return [...requests].reverse();
}

/** Clave del grupo de las solicitudes sin habitación asignada. */
export const NO_ROOM_GROUP_KEY = 'sin-habitacion';

export interface ConciergeRoomGroup {
  /** `roomId` real; `NO_ROOM_GROUP_KEY` si la solicitud no tiene habitación. */
  key: string;
  roomNumber: string | null;
  /** "Habitación 201" o "Sin habitación"; nunca un número inventado. */
  label: string;
  /** En el orden recibido (la más antigua primero). */
  requests: ConciergeRequestModel[];
}

/** Identidad del grupo: `roomId` cuando existe; si no, el número; si tampoco, "sin habitación". */
export function getConciergeRoomKey(request: ConciergeRequestModel): string {
  if (request.roomId) return request.roomId;
  if (request.roomNumber) return `numero:${request.roomNumber}`;
  return NO_ROOM_GROUP_KEY;
}

function getRoomGroupLabel(request: ConciergeRequestModel): string {
  if (request.roomNumber) return `Habitación ${request.roomNumber}`;
  return request.roomId ? 'Habitación sin número' : 'Sin habitación';
}

/**
 * Agrupa por habitación con los datos que ya trae la respuesta (`roomId`,
 * `roomNumber`): una sola consulta, sin pedir reservas ni habitaciones.
 * Grupos en orden natural por número ("2" antes que "10") y "Sin habitación"
 * al final; ninguna solicitud se descarta.
 */
export function groupConciergeRequestsByRoom(
  requests: ConciergeRequestModel[],
): ConciergeRoomGroup[] {
  const groups = new Map<string, ConciergeRoomGroup>();
  for (const request of requests) {
    const key = getConciergeRoomKey(request);
    const group = groups.get(key);
    if (group) {
      group.requests.push(request);
    } else {
      groups.set(key, {
        key,
        roomNumber: request.roomNumber,
        label: getRoomGroupLabel(request),
        requests: [request],
      });
    }
  }
  return [...groups.values()].sort((a, b) => {
    if (a.key === NO_ROOM_GROUP_KEY) return b.key === NO_ROOM_GROUP_KEY ? 0 : 1;
    if (b.key === NO_ROOM_GROUP_KEY) return -1;
    return (a.roomNumber ?? '').localeCompare(b.roomNumber ?? '', 'es', { numeric: true });
  });
}

export const CONCIERGE_REJECTION_PREFIX = 'Motivo de rechazo:';

/**
 * Línea que se envía como `notes` al rechazar. El backend la AGREGA al final
 * de las observaciones existentes (`appendNotes`), así que aquí no se
 * reconstruye el texto completo (a diferencia de Room Service, donde `notes`
 * reemplaza). Devuelve `null` si el motivo queda vacío; los saltos de línea
 * se compactan para que sea una sola línea.
 */
export function buildConciergeRejectionNote(reason: string): string | null {
  const clean = reason.replace(/\s+/g, ' ').trim();
  return clean ? `${CONCIERGE_REJECTION_PREFIX} ${clean}` : null;
}
