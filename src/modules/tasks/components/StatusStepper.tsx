import { StyleSheet, View } from 'react-native';

import { Button, type ButtonVariant } from '@/shared/components';
import { spacing } from '@/shared/theme';

import { StatusBadge } from './StatusBadge';
import {
  getStatusLabel,
  getValidNextStatuses,
  isTerminalStatus,
  type TaskEntityType,
  type TaskStatus,
} from '../models/task.model';

export type StatusStepperMode = 'interactive' | 'readOnly';

export interface StatusStepperProps {
  entityType: TaskEntityType;
  status: TaskStatus;
  /** `readOnly` es lo que la Fase 2 (huésped) reutilizará sin modificar este componente (architecture.md sección 3). */
  mode?: StatusStepperMode;
  onSelectStatus?: (next: TaskStatus) => void;
  disabled?: boolean;
}

const NEGATIVE_TERMINAL_STATUSES = new Set<TaskStatus>(['rejected', 'cancelled']);

function getButtonVariant(entityType: TaskEntityType, next: TaskStatus): ButtonVariant {
  if (NEGATIVE_TERMINAL_STATUSES.has(next)) return 'danger';
  if (isTerminalStatus(entityType, next)) return 'primary';
  return 'secondary';
}

/**
 * Control de transición de estado (MOV-08). En modo `interactive` ofrece un
 * botón por cada transición válida desde `status`, leídas de
 * `shared/constants/statuses.ts` vía `task.model.ts` — nunca condicionales de
 * estado sueltos aquí (AGENTS.md regla 3). En modo `readOnly` solo muestra el
 * estado actual, sin controles.
 */
export function StatusStepper({
  entityType,
  status,
  mode = 'interactive',
  onSelectStatus,
  disabled = false,
}: StatusStepperProps) {
  const nextStatuses = getValidNextStatuses(entityType, status);

  return (
    <View style={styles.container}>
      <StatusBadge entityType={entityType} status={status} />
      {mode === 'interactive' && nextStatuses.length > 0 ? (
        <View style={styles.actions}>
          {nextStatuses.map((next) => (
            <Button
              key={next}
              label={getStatusLabel(entityType, next)}
              variant={getButtonVariant(entityType, next)}
              disabled={disabled}
              onPress={() => onSelectStatus?.(next)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
