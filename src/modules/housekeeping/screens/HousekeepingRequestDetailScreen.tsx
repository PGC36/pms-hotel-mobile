import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { TaskDetailScreenProps } from '@/modules/tasks/screens/TaskDetailScreen';
import { TaskDetailScreen } from '@/modules/tasks/screens/TaskDetailScreen';
import type { HousekeepingStackParamList } from '@/navigation/routes';
import { Button, Card, EmptyState, ErrorState, Input, LoadingState } from '@/shared/components';
import type { ServiceRequestStatus } from '@/shared/constants/statuses';
import { colors, spacing, typography } from '@/shared/theme';

import type { MaintenanceModel } from '../models/maintenance.model';
import type { HousekeepingChecklistModel } from '../models/checklist.model';
import {
  addChecklistItem,
  completeRequestChecklist,
  getOrCreateRequestChecklist,
  setChecklistItemChecked,
} from '../services/checklist.service';
import {
  getHousekeepingEntryById,
  mapMaintenanceToTask,
  mapStayoverToTask,
  type HousekeepingEntry,
} from '../services/housekeeping-task.service';
import { HousekeepingServiceError } from '../services/housekeeping.service';
import { updateMaintenanceStatus } from '../services/maintenance.service';
import { advanceStayover } from '../services/stayover.service';

type Props = NativeStackScreenProps<HousekeepingStackParamList, 'RequestDetail'>;
type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'notFound' }
  | { status: 'ready'; entry: HousekeepingEntry; checklist: HousekeepingChecklistModel | null };
type Action =
  | { type: 'LOAD' }
  | {
      type: 'LOADED';
      entry: HousekeepingEntry | null;
      checklist?: HousekeepingChecklistModel | null;
    }
  | { type: 'CHECKLIST'; checklist: HousekeepingChecklistModel }
  | { type: 'ERROR'; message: string };

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD':
      return { status: 'loading' };
    case 'LOADED':
      return action.entry
        ? { status: 'ready', entry: action.entry, checklist: action.checklist ?? null }
        : { status: 'notFound' };
    case 'CHECKLIST':
      return _state.status === 'ready' ? { ..._state, checklist: action.checklist } : _state;
    case 'ERROR':
      return { status: 'error', message: action.message };
  }
}

function errorMessage(error: unknown): string {
  return error instanceof HousekeepingServiceError
    ? error.message
    : 'No se pudo completar la operación. Intenta de nuevo.';
}

function isArticleDelivery(description: string): boolean {
  return /^art[ií]culos solicitados:/i.test(description.trim());
}

export function HousekeepingRequestDetailScreen({ route }: Props) {
  const { taskId } = route.params;
  const [state, dispatch] = useReducer(reducer, { status: 'loading' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmComplete, setConfirmComplete] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [additionalItem, setAdditionalItem] = useState('');
  const maintenanceRef = useRef<MaintenanceModel | null>(null);
  const inFlight = useRef(false);

  const load = useCallback(async () => {
    try {
      const entry = await getHousekeepingEntryById(taskId);
      const checklist =
        entry?.kind === 'stayover' &&
        !isArticleDelivery(entry.request.description) &&
        entry.request.status === 'inProgress'
          ? await getOrCreateRequestChecklist(entry.request.roomId, entry.request.id)
          : null;
      maintenanceRef.current = entry?.kind === 'maintenance' ? entry.request : null;
      dispatch({ type: 'LOADED', entry, checklist });
    } catch (error) {
      dispatch({ type: 'ERROR', message: errorMessage(error) });
    }
  }, [taskId]);

  useEffect(() => {
    void load();
  }, [load]);

  const retry = () => {
    dispatch({ type: 'LOAD' });
    void load();
  };

  const updateMaintenance = useCallback<TaskDetailScreenProps['onUpdateStatus']>(
    async (status, options) => {
      if (status === 'rejected' && !options?.rejectionReason?.trim()) {
        throw new Error('Indica el motivo del rechazo.');
      }
      const note =
        status === 'rejected'
          ? `Motivo de rechazo: ${options?.rejectionReason?.trim() ?? ''}`
          : options?.notes;
      if (maintenanceRef.current) {
        const updated = await updateMaintenanceStatus(
          maintenanceRef.current,
          status as ServiceRequestStatus,
          note,
        );
        maintenanceRef.current = updated;
        return mapMaintenanceToTask(updated);
      }
      throw new Error('Recarga la solicitud antes de continuar.');
    },
    [],
  );

  async function handleStayoverAction(action: 'start' | 'complete') {
    if (inFlight.current || state.status !== 'ready' || state.entry.kind !== 'stayover') return;
    inFlight.current = true;
    setIsSubmitting(true);
    setActionError(null);
    try {
      const request = await advanceStayover(taskId, action);
      dispatch({
        type: 'LOADED',
        entry: { kind: 'stayover', request, task: mapStayoverToTask(request) },
        checklist: action === 'start' ? null : state.checklist,
      });
      if (action === 'start' && !isArticleDelivery(request.description)) {
        dispatch({
          type: 'CHECKLIST',
          checklist: await getOrCreateRequestChecklist(request.roomId, request.id),
        });
      }
      setConfirmComplete(false);
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      inFlight.current = false;
      setIsSubmitting(false);
    }
  }

  async function handleChecklistChange(work: () => Promise<HousekeepingChecklistModel>) {
    if (inFlight.current) return;
    inFlight.current = true;
    setIsSubmitting(true);
    setActionError(null);
    try {
      dispatch({ type: 'CHECKLIST', checklist: await work() });
      setAdditionalItem('');
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      inFlight.current = false;
      setIsSubmitting(false);
    }
  }

  if (state.status === 'loading') return <LoadingState message="Cargando solicitud..." />;
  if (state.status === 'error')
    return (
      <ErrorState
        title="No se pudo cargar la solicitud"
        description={state.message}
        onRetry={retry}
      />
    );
  if (state.status === 'notFound') return <EmptyState title="La solicitud no existe" />;
  if (state.entry.kind === 'maintenance') {
    return (
      <TaskDetailScreen
        task={state.entry.task}
        onUpdateStatus={updateMaintenance}
        optimistic={false}
        showNotesField={false}
      >
        {state.entry.request.notes ? (
          <Text style={styles.notes}>{state.entry.request.notes}</Text>
        ) : null}
      </TaskDetailScreen>
    );
  }

  const { request } = state.entry;
  const checklist = state.checklist;
  const pendingItems = checklist?.items.filter((item) => !item.checked).length ?? 0;
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{request.description}</Text>
      <Text style={styles.body}>Habitación {request.roomNumber}</Text>
      <Text style={styles.body}>
        Estado:{' '}
        {request.status === 'inProgress'
          ? 'En proceso'
          : request.status === 'completed'
            ? 'Completada'
            : request.status === 'cancelled'
              ? 'Cancelada'
              : 'Pendiente'}
      </Text>
      {request.notes ? (
        <Card>
          <Text style={styles.body}>{request.notes}</Text>
        </Card>
      ) : null}
      {!isArticleDelivery(request.description) && request.status === 'inProgress' ? (
        <Card style={styles.confirm}>
          <Text style={styles.sectionTitle}>Checklist de limpieza</Text>
          {checklist ? (
            <>
              {checklist.items.map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{
                    checked: item.checked,
                    disabled: isSubmitting || checklist.status === 'completed',
                  }}
                  disabled={isSubmitting || checklist.status === 'completed'}
                  onPress={() =>
                    void handleChecklistChange(() =>
                      setChecklistItemChecked(checklist, item.id, !item.checked),
                    )
                  }
                  style={styles.item}
                >
                  <Text style={styles.body}>
                    {item.checked ? '☑' : '☐'} {item.label}
                  </Text>
                </Pressable>
              ))}
              <Text style={styles.body}>
                {checklist.status === 'completed'
                  ? 'Lista completada'
                  : `${pendingItems} puntos pendientes`}
              </Text>
              {checklist.status !== 'completed' ? (
                <>
                  <Input
                    label="Punto especial (opcional)"
                    placeholder="Agregar una tarea para esta habitación"
                    value={additionalItem}
                    onChangeText={setAdditionalItem}
                    maxLength={255}
                  />
                  <Button
                    label="Agregar punto"
                    variant="secondary"
                    disabled={!additionalItem.trim() || isSubmitting}
                    onPress={() =>
                      void handleChecklistChange(() => addChecklistItem(checklist, additionalItem))
                    }
                  />
                  <Button
                    label="Completar lista"
                    disabled={pendingItems > 0 || isSubmitting}
                    onPress={() =>
                      void handleChecklistChange(() => completeRequestChecklist(checklist.id))
                    }
                  />
                </>
              ) : null}
            </>
          ) : (
            <Text style={styles.body}>
              No se pudo preparar la checklist. Actualiza la solicitud.
            </Text>
          )}
        </Card>
      ) : null}
      {actionError ? (
        <Text style={styles.error} accessibilityRole="alert">
          {actionError}
        </Text>
      ) : null}
      {request.status === 'pending' ? (
        <Button
          label="Iniciar atención"
          loading={isSubmitting}
          onPress={() => void handleStayoverAction('start')}
          fullWidth
        />
      ) : null}
      {request.status === 'inProgress' ? (
        confirmComplete ? (
          <Card style={styles.confirm}>
            <Text style={styles.body}>¿Confirmas que la solicitud fue atendida?</Text>
            <Button
              label="Confirmar"
              loading={isSubmitting}
              onPress={() => void handleStayoverAction('complete')}
            />
            <Button label="Volver" variant="secondary" onPress={() => setConfirmComplete(false)} />
          </Card>
        ) : (
          <Button
            label="Completar solicitud"
            disabled={
              !isArticleDelivery(request.description) &&
              (!checklist || checklist.status !== 'completed')
            }
            onPress={() => setConfirmComplete(true)}
            fullWidth
          />
        )
      ) : null}
      <Button label="Actualizar" variant="secondary" onPress={retry} fullWidth />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[50] },
  content: { padding: spacing.md, gap: spacing.md },
  title: { ...typography.h1, color: colors.text.primary },
  body: { ...typography.body, color: colors.text.secondary },
  notes: { ...typography.body, color: colors.text.secondary },
  error: { ...typography.bodySmall, color: colors.state.danger },
  confirm: { gap: spacing.sm },
  sectionTitle: { ...typography.h2, color: colors.text.primary },
  item: { paddingVertical: spacing.sm },
});
