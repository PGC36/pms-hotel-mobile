import type { TaskStatus } from '@/modules/tasks/models/task.model';
import type { OrderStatus } from '@/shared/constants/statuses';

/**
 * Texto de la acción del personal que lleva a cada estado. Qué acciones se
 * ofrecen lo decide `ORDER_STATUS_TRANSITIONS`; esto solo las nombra.
 */
const ORDER_ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  accepted: 'Aceptar pedido',
  rejected: 'Rechazar pedido',
  preparing: 'Iniciar preparación',
  ready: 'Marcar como listo',
  onTheWay: 'Marcar en camino',
  delivered: 'Marcar como entregado',
  cancelled: 'Cancelar pedido',
};

export function getOrderActionLabel(next: TaskStatus): string {
  return ORDER_ACTION_LABELS[next as OrderStatus] ?? next;
}
