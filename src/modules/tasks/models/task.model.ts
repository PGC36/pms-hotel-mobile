import {
  ORDER_STATUS_LABELS,
  SERVICE_REQUEST_STATUS_LABELS,
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
