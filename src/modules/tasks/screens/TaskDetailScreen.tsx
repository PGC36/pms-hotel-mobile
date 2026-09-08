import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Input } from '@/shared/components';
import { colors, radius, spacing, typography } from '@/shared/theme';
import { formatElapsedTime } from '@/shared/utils/date';

import { StatusStepper } from '../components/StatusStepper';
import {
  getStatusLabel,
  isTerminalStatus,
  type TaskModel,
  type TaskStatus,
} from '../models/task.model';

export interface TaskDetailUpdateOptions {
  /** Obligatorio cuando `nextStatus` es `rejected`. */
  rejectionReason?: string;
  /** El llamador decide si su servicio persiste observaciones — no todos lo soportan hoy. */
  notes?: string;
}

export interface TaskDetailScreenProps {
  task: TaskModel;
  /** El servicio: aplica la transición y devuelve el `TaskModel` actualizado (MOV-09/10/11 lo arma por rol). */
  onUpdateStatus: (nextStatus: TaskStatus, options?: TaskDetailUpdateOptions) => Promise<TaskModel>;
}

const NEGATIVE_TERMINAL_STATUSES = new Set<TaskStatus>(['rejected', 'cancelled']);

/**
 * Detalle genérico y transiciones de estado (MOV-08). Recibe el `task` ya
 * adaptado y el servicio (`onUpdateStatus`) por props, igual que
 * `TaskListScreen` en MOV-07 — no importa `ServiceRequestModel`/`OrderModel`
 * ni los servicios de dominio directamente.
 */
export function TaskDetailScreen({ task: initialTask, onUpdateStatus }: TaskDetailScreenProps) {
  const [task, setTask] = useState(initialTask);
  const [notes, setNotes] = useState(initialTask.notes ?? '');
  const [pendingTransition, setPendingTransition] = useState<TaskStatus | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSelectStatus(next: TaskStatus) {
    setErrorMessage(null);
    if (isTerminalStatus(task.entityType, next)) {
      setPendingTransition(next);
      setRejectionReason('');
    } else {
      void applyTransition(next);
    }
  }

  function cancelPendingTransition() {
    setPendingTransition(null);
    setRejectionReason('');
  }

  async function applyTransition(next: TaskStatus, options: TaskDetailUpdateOptions = {}) {
    const previousStatus = task.status;
    setIsUpdating(true);
    setErrorMessage(null);
    setPendingTransition(null);
    setTask((current) => ({ ...current, status: next }));

    try {
      const updated = await onUpdateStatus(next, { ...options, notes: notes.trim() || undefined });
      setTask(updated);
      setNotes(updated.notes ?? '');
    } catch (error) {
      setTask((current) => ({ ...current, status: previousStatus }));
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar el estado. Intenta de nuevo.',
      );
    } finally {
      setIsUpdating(false);
    }
  }

  const isRejecting = pendingTransition === 'rejected';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.description}>{task.description}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>{task.roomLabel ?? 'Sin habitación asignada'}</Text>
        {task.meta ? <Text style={styles.meta}>{task.meta}</Text> : null}
        <Text style={styles.meta}>{formatElapsedTime(task.createdAt)}</Text>
      </View>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <StatusStepper
        entityType={task.entityType}
        status={task.status}
        onSelectStatus={handleSelectStatus}
        disabled={isUpdating || pendingTransition !== null}
      />

      {pendingTransition ? (
        <View style={styles.confirmPanel}>
          <Text style={styles.confirmTitle}>
            ¿Confirmas marcar esta tarea como &quot;
            {getStatusLabel(task.entityType, pendingTransition)}
            &quot;? Esta acción no se puede deshacer.
          </Text>
          {isRejecting ? (
            <Input
              label="Motivo del rechazo"
              placeholder="Explica por qué se rechaza"
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
            />
          ) : null}
          <View style={styles.confirmActions}>
            <Button label="Cancelar" variant="secondary" onPress={cancelPendingTransition} />
            <Button
              label="Confirmar"
              variant={NEGATIVE_TERMINAL_STATUSES.has(pendingTransition) ? 'danger' : 'primary'}
              loading={isUpdating}
              disabled={isRejecting && rejectionReason.trim().length === 0}
              onPress={() =>
                void applyTransition(pendingTransition, {
                  rejectionReason: isRejecting ? rejectionReason.trim() : undefined,
                })
              }
            />
          </View>
        </View>
      ) : null}

      <Input
        label="Observaciones"
        placeholder="Agrega notas para el equipo..."
        value={notes}
        onChangeText={setNotes}
        multiline
      />
      <Text style={styles.hint}>Se guardan junto con el próximo cambio de estado.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sand[50],
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  meta: {
    ...typography.caption,
    color: colors.text.muted,
  },
  error: {
    ...typography.bodySmall,
    color: colors.state.danger,
  },
  confirmPanel: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.sand[300],
    backgroundColor: colors.white,
  },
  confirmTitle: {
    ...typography.body,
    color: colors.text.primary,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  hint: {
    ...typography.caption,
    color: colors.text.muted,
  },
});
