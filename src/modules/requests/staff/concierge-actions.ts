import type { TaskStatus } from '@/modules/tasks/models/task.model';
import type { ConciergeRequestStatus } from '@/shared/constants/statuses';

/**
 * Texto de la acción del personal que lleva a cada estado. Qué acciones se
 * ofrecen lo decide `CONCIERGE_REQUEST_STATUS_TRANSITIONS`; esto solo las nombra.
 */
const CONCIERGE_ACTION_LABELS: Partial<Record<ConciergeRequestStatus, string>> = {
  accepted: 'Aceptar',
  inProgress: 'Iniciar atención',
  completed: 'Completar',
  rejected: 'Rechazar',
  cancelled: 'Cancelar solicitud',
};

export function getConciergeActionLabel(next: TaskStatus): string {
  return CONCIERGE_ACTION_LABELS[next as ConciergeRequestStatus] ?? next;
}
