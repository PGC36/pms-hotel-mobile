import {
  CONCIERGE_REQUEST_STATUS_LABELS,
  CONCIERGE_REQUEST_STATUS_TRANSITIONS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TRANSITIONS,
  SERVICE_REQUEST_STATUS_LABELS,
  SERVICE_REQUEST_STATUS_TRANSITIONS,
  type ConciergeRequestStatus,
  type OrderStatus,
  type ServiceRequestStatus,
} from '@/shared/constants/statuses';
import { statusColors, type StatusColorToken } from '@/shared/theme';

/**
 * `serviceRequest`: solicitudes de Limpieza (mock, MOV-09). `order`: pedidos
 * de Room Service (MOV-10). `conciergeRequest`: solicitudes de Conserjería
 * (MOV-11), con su propia máquina de estados para no alterar la de Limpieza.
 */
export type TaskEntityType = 'serviceRequest' | 'order' | 'conciergeRequest';

export type TaskStatus = ServiceRequestStatus | OrderStatus | ConciergeRequestStatus;

/**
 * Abstracción común de solicitud de servicio y pedido de Room Service
 * (architecture.md sección 3): la forma que `TaskListScreen`, `TaskCard` y
 * `StatusBadge` consumen sin conocer si el origen es un `ServiceRequestModel`
 * o un `OrderModel`. Cada módulo de dominio arma este objeto a partir de su
 * propio Model al configurar su bandeja (MOV-09/10/11) — este módulo no
 * importa esos Models para no invertir la dirección de dependencia
 * (housekeeping/room-service/requests dependen de `tasks`, no al revés).
 */
export interface TaskModel {
  id: string;
  entityType: TaskEntityType;
  title: string;
  description: string;
  /** Ej. "Habitación 203". `undefined` si la tarea no está asociada a una habitación. */
  roomLabel?: string;
  /** Texto secundario libre para contexto extra (ej. "3 productos", "Categoría: Conserjería"). */
  meta?: string;
  /** Observaciones de atención existentes, editables desde `TaskDetailScreen` (MOV-08). */
  notes?: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Etiquetas, colores y transiciones de cada tipo de tarea. Un `Record` por
 * tipo (no un `if` por tipo) obliga a cubrir cualquier tipo nuevo, y cada
 * tipo solo ve su propia máquina de estados.
 */
const STATUS_LABELS: Record<TaskEntityType, Partial<Record<TaskStatus, string>>> = {
  order: ORDER_STATUS_LABELS,
  serviceRequest: SERVICE_REQUEST_STATUS_LABELS,
  conciergeRequest: CONCIERGE_REQUEST_STATUS_LABELS,
};

const STATUS_COLORS: Record<TaskEntityType, Partial<Record<TaskStatus, StatusColorToken>>> = {
  order: statusColors.order,
  serviceRequest: statusColors.serviceRequest,
  conciergeRequest: statusColors.conciergeRequest,
};

const STATUS_TRANSITIONS: Record<TaskEntityType, Partial<Record<TaskStatus, TaskStatus[]>>> = {
  order: ORDER_STATUS_TRANSITIONS,
  serviceRequest: SERVICE_REQUEST_STATUS_TRANSITIONS,
  conciergeRequest: CONCIERGE_REQUEST_STATUS_TRANSITIONS,
};

export function getStatusLabel(entityType: TaskEntityType, status: TaskStatus): string {
  return STATUS_LABELS[entityType][status] ?? status;
}

export function getStatusColor(entityType: TaskEntityType, status: TaskStatus): StatusColorToken {
  return STATUS_COLORS[entityType][status] ?? statusColors.serviceRequest.pending;
}

/**
 * Transiciones válidas desde `status` (MOV-08) — misma fuente de verdad que
 * `task-transition.service.ts`, para que `StatusStepper` solo muestre
 * acciones válidas (AGENTS.md regla 3: nunca condicionales de estado sueltos).
 * Un estado que no pertenece a la máquina del tipo no tiene transiciones.
 */
export function getValidNextStatuses(entityType: TaskEntityType, status: TaskStatus): TaskStatus[] {
  return STATUS_TRANSITIONS[entityType][status] ?? [];
}

/** Un estado es terminal cuando no tiene transiciones salientes — llegar a él es irreversible. */
export function isTerminalStatus(entityType: TaskEntityType, status: TaskStatus): boolean {
  return getValidNextStatuses(entityType, status).length === 0;
}
