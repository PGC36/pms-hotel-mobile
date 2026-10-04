import { housekeepingTaskCompletionsDB, roomsDB } from '@/data/db';
import type { ServiceRequestCategory } from '@/modules/requests/dtos/service-request.dto';
import type { ServiceRequestModel } from '@/modules/requests/models/service-request.model';
import {
  getServiceRequestById,
  getServiceRequests,
  ServiceRequestNotFoundError,
  updateServiceRequestStatus,
} from '@/modules/requests/services/service-request.service';
import type { TaskModel, TaskStatus } from '@/modules/tasks/models/task.model';
import { STAFF_ROLES } from '@/shared/constants/roles';
import { SERVICE_REQUEST_STATUSES, type ServiceRequestStatus } from '@/shared/constants/statuses';

/**
 * Solicitudes de huéspedes que atiende Limpieza, adaptadas a `TaskModel` para
 * reutilizar `TaskListScreen`/`TaskDetailScreen` (architecture.md sección 3).
 *
 * MOCK (MOV-09): no hay endpoint autorizado para estas solicitudes, así que
 * salen de `service-request.service.ts` (que hoy lee `db.ts`). Cuando exista
 * backend, solo cambia este archivo; las pantallas no se enteran.
 */

/** Categorías que son trabajo de Limpieza: limpieza durante la estancia (HU-14) y artículos (HU-15). */
const HOUSEKEEPING_CATEGORIES: readonly ServiceRequestCategory[] = ['cleaning', 'items'];

function isHousekeepingRequest(request: ServiceRequestModel): boolean {
  return (
    request.assignedRole === STAFF_ROLES.HOUSEKEEPING &&
    HOUSEKEEPING_CATEGORIES.includes(request.category)
  );
}

function isServiceRequestStatus(status: TaskStatus): status is ServiceRequestStatus {
  return (SERVICE_REQUEST_STATUSES as readonly string[]).includes(status);
}

/**
 * Número visible de la habitación. Las solicitudes mock apuntan a los ids de
 * `roomsDB` ("room-203"), no a las habitaciones reales de la API.
 */
function getRoomLabel(roomId: string): string {
  const room = roomsDB.find((candidate) => candidate.id === roomId);
  return `Habitación ${room?.roomNumber ?? roomId}`;
}

function getMeta(request: ServiceRequestModel): string | undefined {
  if (request.category === 'items' && request.items && request.items.length > 0) {
    return request.items.map((item) => `${item.name} ×${item.quantity}`).join(', ');
  }
  if (request.category === 'cleaning' && request.preferredTime) {
    return `Horario preferido: ${request.preferredTime}`;
  }
  return undefined;
}

export function mapServiceRequestToTask(request: ServiceRequestModel): TaskModel {
  return {
    id: request.id,
    entityType: 'serviceRequest',
    title: request.title,
    description: request.description,
    roomLabel: getRoomLabel(request.roomId),
    meta: getMeta(request),
    notes: request.staffNotes ?? undefined,
    status: request.status,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };
}

export async function getHousekeepingTasks(): Promise<TaskModel[]> {
  const requests = await getServiceRequests();
  return requests.filter(isHousekeepingRequest).map(mapServiceRequestToTask);
}

/** `null` si no existe o no es una solicitud de Limpieza. */
export async function getHousekeepingTaskById(id: string): Promise<TaskModel | null> {
  const request = await getServiceRequestById(id);
  return request && isHousekeepingRequest(request) ? mapServiceRequestToTask(request) : null;
}

/** `TaskDetailUpdateOptions` de `TaskDetailScreen` más el responsable, que solo aplica a `completed`. */
export interface UpdateHousekeepingTaskOptions {
  rejectionReason?: string;
  notes?: string;
  /**
   * Usuario en sesión que completa la tarea. Obligatorio para `completed`:
   * sin él no se aplica la transición, para no dejar una tarea sin dueño en
   * el historial. El servicio no lee `AuthContext` — lo recibe de la pantalla.
   */
  completedByUserId?: string;
}

export class MissingTaskOwnerError extends Error {
  constructor() {
    super('No se pudo identificar al usuario en sesión para registrar la tarea completada.');
    this.name = 'MissingTaskOwnerError';
  }
}

/** Como máximo un registro por solicitud + usuario. */
function recordCompletion(serviceRequestId: string, userId: string, completedAt: Date): void {
  const exists = housekeepingTaskCompletionsDB.some(
    (completion) =>
      completion.service_request_id === serviceRequestId &&
      completion.completed_by_user_id === userId,
  );
  if (exists) return;

  housekeepingTaskCompletionsDB.push({
    id: `completion-${String(housekeepingTaskCompletionsDB.length + 1).padStart(2, '0')}`,
    service_request_id: serviceRequestId,
    completed_by_user_id: userId,
    completed_at: completedAt.toISOString(),
  });
}

/**
 * Aplica la transición con `updateServiceRequestStatus`, que la valida contra
 * `SERVICE_REQUEST_STATUS_TRANSITIONS`. Las observaciones del detalle se
 * guardan como `staffNotes`. Al completar, registra quién lo hizo.
 */
export async function updateHousekeepingTaskStatus(
  id: string,
  nextStatus: TaskStatus,
  options: UpdateHousekeepingTaskOptions = {},
): Promise<TaskModel> {
  const completedByUserId = options.completedByUserId?.trim();
  if (nextStatus === 'completed' && !completedByUserId) throw new MissingTaskOwnerError();

  const request = await getServiceRequestById(id);
  if (!request || !isHousekeepingRequest(request)) throw new ServiceRequestNotFoundError(id);
  if (!isServiceRequestStatus(nextStatus)) {
    throw new Error(`"${nextStatus}" no es un estado válido para una solicitud.`);
  }

  const updated = await updateServiceRequestStatus(id, nextStatus, {
    rejectionReason: options.rejectionReason,
    staffNotes: options.notes,
  });

  if (updated.status === 'completed' && completedByUserId) {
    recordCompletion(updated.id, completedByUserId, updated.updatedAt);
  }

  return mapServiceRequestToTask(updated);
}

function formatCompletedAt(date: Date): string {
  return date.toLocaleString('es-GT', { dateStyle: 'medium', timeStyle: 'short' });
}

/**
 * Historial (HU-10): solicitudes de Limpieza que `userId` completó, la más
 * reciente primero. MOCK: sale de `housekeepingTaskCompletionsDB`.
 */
export async function getMyCompletedTasks(userId: string): Promise<TaskModel[]> {
  const requests = await getServiceRequests();
  const byId = new Map(requests.map((request) => [request.id, request]));

  return housekeepingTaskCompletionsDB
    .filter((completion) => completion.completed_by_user_id === userId)
    .flatMap((completion) => {
      const request = byId.get(completion.service_request_id);
      if (!request || !isHousekeepingRequest(request) || request.status !== 'completed') return [];
      return [{ request, completedAt: new Date(completion.completed_at) }];
    })
    .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
    .map(({ request, completedAt }) => {
      const task = mapServiceRequestToTask(request);
      const completedLabel = `Completada: ${formatCompletedAt(completedAt)}`;
      return { ...task, meta: task.meta ? `${completedLabel} · ${task.meta}` : completedLabel };
    });
}
