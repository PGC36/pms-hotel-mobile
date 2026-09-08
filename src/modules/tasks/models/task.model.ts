import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TRANSITIONS,
  SERVICE_REQUEST_STATUS_LABELS,
  SERVICE_REQUEST_STATUS_TRANSITIONS,
  type OrderStatus,
  type ServiceRequestStatus,
} from '@/shared/constants/statuses';
import { statusColors, type StatusColorToken } from '@/shared/theme';

export type TaskEntityType = 'serviceRequest' | 'order';

export type TaskStatus = ServiceRequestStatus | OrderStatus;

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

export function getStatusLabel(entityType: TaskEntityType, status: TaskStatus): string {
  return entityType === 'order'
    ? ORDER_STATUS_LABELS[status as OrderStatus]
    : SERVICE_REQUEST_STATUS_LABELS[status as ServiceRequestStatus];
}

export function getStatusColor(entityType: TaskEntityType, status: TaskStatus): StatusColorToken {
  return entityType === 'order'
    ? statusColors.order[status as OrderStatus]
    : statusColors.serviceRequest[status as ServiceRequestStatus];
}

/**
 * Transiciones válidas desde `status` (MOV-08) — misma fuente de verdad que
 * `task-transition.service.ts`, para que `StatusStepper` solo muestre
 * acciones válidas (AGENTS.md regla 3: nunca condicionales de estado sueltos).
 */
export function getValidNextStatuses(entityType: TaskEntityType, status: TaskStatus): TaskStatus[] {
  return entityType === 'order'
    ? ORDER_STATUS_TRANSITIONS[status as OrderStatus]
    : SERVICE_REQUEST_STATUS_TRANSITIONS[status as ServiceRequestStatus];
}

/** Un estado es terminal cuando no tiene transiciones salientes — llegar a él es irreversible. */
export function isTerminalStatus(entityType: TaskEntityType, status: TaskStatus): boolean {
  return getValidNextStatuses(entityType, status).length === 0;
}
