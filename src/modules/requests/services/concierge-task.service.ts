import type { TaskModel } from '@/modules/tasks/models/task.model';

import {
  getActiveConciergeRequests,
  getConciergeRoomKey,
  getTerminalConciergeRequests,
  groupConciergeRequestsByRoom,
  sortConciergeRequestsNewestFirst,
  type ConciergeRequestModel,
  type ConciergeRoomGroup,
} from '../models/concierge-request.model';
import { listConciergeRequests } from './concierge-request.service';

/**
 * Solicitudes de conserjería adaptadas a `TaskModel` para reutilizar la
 * bandeja y el detalle genéricos de `tasks` (architecture.md sección 3), igual
 * que `order-task.service` en MOV-10. Solo usa datos que entrega el backend:
 * sin habitación, huésped o responsable, no se inventan.
 */
export function mapConciergeRequestToTask(request: ConciergeRequestModel): TaskModel {
  return {
    id: request.id,
    entityType: 'conciergeRequest',
    title: request.guestName ?? 'Solicitud de conserjería',
    description: request.description,
    // Sin habitación, `TaskCard` muestra "Sin habitación asignada", que es lo que dice el backend.
    roomLabel: request.roomNumber ? `Habitación ${request.roomNumber}` : undefined,
    meta: request.responsibleUserName ? `Atiende: ${request.responsibleUserName}` : undefined,
    notes: request.notes ?? undefined,
    status: request.status,
    // Momento en que se pidió la solicitud.
    createdAt: request.requestedAt,
    updatedAt: request.updatedAt,
  };
}

/**
 * Bandeja: una sola llamada, solo solicitudes activas, en el orden del
 * backend (la que más tiempo lleva esperando, primero). El mapeo de arriba
 * sigue siendo puro; esta función solo lo compone con el servicio.
 */
export async function getActiveConciergeTasks(): Promise<TaskModel[]> {
  const requests = await listConciergeRequests();
  return getActiveConciergeRequests(requests).map(mapConciergeRequestToTask);
}

/** Por habitación (HU-09): una sola llamada, activas agrupadas por habitación en memoria. */
export async function getActiveConciergeRoomGroups(): Promise<ConciergeRoomGroup[]> {
  const requests = await listConciergeRequests();
  return groupConciergeRequestsByRoom(getActiveConciergeRequests(requests));
}

/** Solicitudes activas de una habitación (por la clave de su grupo), la más antigua primero. */
export async function getActiveConciergeTasksForRoom(roomKey: string): Promise<TaskModel[]> {
  const requests = await listConciergeRequests();
  return getActiveConciergeRequests(requests)
    .filter((request) => getConciergeRoomKey(request) === roomKey)
    .map(mapConciergeRequestToTask);
}

/**
 * Historial del equipo (HU-10): una sola llamada, solo terminales
 * (`completed`, `rejected`, `cancelled`), la más reciente primero. No existe
 * un endpoint de historial: se deriva del listado real.
 */
export async function getTerminalConciergeTasks(): Promise<TaskModel[]> {
  const requests = await listConciergeRequests();
  return sortConciergeRequestsNewestFirst(getTerminalConciergeRequests(requests)).map(
    mapConciergeRequestToTask,
  );
}
