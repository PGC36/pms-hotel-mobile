import { TaskNotesEditor } from '@/modules/tasks/components/TaskNotesEditor';

import { ORDER_NOTES_MAX_LENGTH } from '../../models/order.model';

export interface OrderNotesSectionProps {
  /** Observaciones actuales según el backend. */
  notes: string | null;
  /** `false` en pedidos terminales: solo lectura. */
  editable: boolean;
  /** Bloquea la edición mientras hay otra operación sobre el pedido. */
  disabled?: boolean;
  /** Guarda exactamente el texto recibido; lanza si falla (con un mensaje apto para mostrar). */
  onSave: (notes: string) => Promise<void>;
}

/**
 * Observaciones del pedido (HU-11), sobre el editor compartido de `tasks`.
 * Son el mismo campo que escribió el huésped y donde el backend guarda el
 * motivo de rechazo; el backend limita `notes` a 1000 caracteres.
 */
export function OrderNotesSection(props: OrderNotesSectionProps) {
  return (
    <TaskNotesEditor
      {...props}
      maxLength={ORDER_NOTES_MAX_LENGTH}
      inputAccessibilityLabel="Observaciones del pedido"
      readOnlyHint="El pedido está cerrado: las observaciones son de solo lectura."
      clearConfirmMessage="¿Eliminar las observaciones? El pedido quedará sin observaciones."
    />
  );
}
