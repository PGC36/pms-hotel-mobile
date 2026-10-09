import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { HousekeepingStackParamList } from '@/navigation/routes';
import { Button, Card, EmptyState, ErrorState, LoadingState } from '@/shared/components';
import {
  ROOM_HOUSEKEEPING_STATUS_TRANSITIONS,
  type RoomHousekeepingStatus,
} from '@/shared/constants/statuses';
import { colors, spacing, typography } from '@/shared/theme';

import { RoomStatusBadge } from '../components/RoomStatusBadge';
import type { HousekeepingChecklistModel } from '../models/checklist.model';
import type { RoomModel } from '../models/room.model';
import {
  completeRequestChecklist,
  getTurnoverChecklist,
  setChecklistItemChecked,
} from '../services/checklist.service';
import {
  completeCleaning,
  getRoomById,
  HousekeepingServiceError,
  inspectRoom,
  startCleaning,
} from '../services/housekeeping.service';

type Props = NativeStackScreenProps<HousekeepingStackParamList, 'RoomDetail'>;

export interface HousekeepingAction {
  label: string;
  run: (roomId: string) => Promise<RoomModel>;
}

/**
 * La operación del backend que lleva a cada estado de limpieza. Solo existen
 * las tres autorizadas (MOV-09); `dirty` no tiene operación, así que nunca
 * se ofrece "marcar sucia".
 */
const ACTION_BY_TARGET_STATUS: Partial<Record<RoomHousekeepingStatus, HousekeepingAction>> = {
  cleaning: { label: 'Iniciar limpieza', run: startCleaning },
  clean: { label: 'Finalizar limpieza', run: completeCleaning },
  inspected: { label: 'Marcar inspeccionada', run: inspectRoom },
};

/** Acciones válidas desde `status`, leídas de `statuses.ts` (AGENTS.md regla 3). */
export function getHousekeepingActions(status: RoomHousekeepingStatus): HousekeepingAction[] {
  return ROOM_HOUSEKEEPING_STATUS_TRANSITIONS[status].flatMap((next) => {
    const action = ACTION_BY_TARGET_STATUS[next];
    return action ? [action] : [];
  });
}

interface State {
  status: 'loading' | 'error' | 'notFound' | 'ready';
  room: RoomModel | null;
  errorMessage: string | null;
}

type Action =
  | { type: 'FETCH_START' }
  | { type: 'ROOM_LOADED'; room: RoomModel }
  | { type: 'NOT_FOUND' }
  | { type: 'FETCH_ERROR'; message: string };

const initialState: State = { status: 'loading', room: null, errorMessage: null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, status: 'loading', errorMessage: null };
    case 'ROOM_LOADED':
      return { status: 'ready', room: action.room, errorMessage: null };
    case 'NOT_FOUND':
      return { status: 'notFound', room: null, errorMessage: null };
    case 'FETCH_ERROR':
      return { ...state, status: 'error', errorMessage: action.message };
    default:
      return state;
  }
}

interface ChecklistState {
  checklist: HousekeepingChecklistModel | null;
  loading: boolean;
  error: string | null;
}

type ChecklistAction =
  | { type: 'LOADING' }
  | { type: 'LOADED'; checklist: HousekeepingChecklistModel | null }
  | { type: 'ERROR'; message: string };

function checklistReducer(state: ChecklistState, action: ChecklistAction): ChecklistState {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null };
    case 'LOADED':
      return { checklist: action.checklist, loading: false, error: null };
    case 'ERROR':
      return { ...state, loading: false, error: action.message };
  }
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof HousekeepingServiceError ? error.message : fallback;
}

function formatDateTime(date: Date): string {
  return date.toLocaleString('es-GT', { dateStyle: 'medium', timeStyle: 'short' });
}

/** Filas de trazabilidad con dato; las vacías no se muestran. */
function getTraceRows(room: RoomModel): { label: string; value: string }[] {
  const rows: { label: string; value: string | null }[] = [
    { label: 'Limpieza iniciada por', value: room.cleaningUserEmail },
    {
      label: 'Inicio de limpieza',
      value: room.cleaningStartedAt && formatDateTime(room.cleaningStartedAt),
    },
    { label: 'Limpieza finalizada por', value: room.cleaningCompletedByUserEmail },
    {
      label: 'Fin de limpieza',
      value: room.cleaningCompletedAt && formatDateTime(room.cleaningCompletedAt),
    },
    { label: 'Inspeccionada por', value: room.inspectorUserEmail },
    { label: 'Fecha de inspección', value: room.inspectedAt && formatDateTime(room.inspectedAt) },
  ];
  return rows.filter((row): row is { label: string; value: string } => Boolean(row.value));
}

export function RoomDetailScreen({ route, navigation }: Props) {
  const { roomId } = route.params;
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [{ checklist, loading: checklistLoading, error: checklistError }, dispatchChecklist] =
    useReducer(checklistReducer, { checklist: null, loading: false, error: null });
  // `isSubmitting` llega con el siguiente render; el ref corta un doble toque inmediato.
  const submittingRef = useRef(false);

  const loadChecklist = useCallback(async () => {
    dispatchChecklist({ type: 'LOADING' });
    try {
      dispatchChecklist({ type: 'LOADED', checklist: await getTurnoverChecklist(roomId) });
    } catch (error) {
      dispatchChecklist({
        type: 'ERROR',
        message: getErrorMessage(error, 'No se pudo cargar la lista de limpieza.'),
      });
    }
  }, [roomId]);

  const load = useCallback(async () => {
    try {
      const room = await getRoomById(roomId);
      dispatch(room ? { type: 'ROOM_LOADED', room } : { type: 'NOT_FOUND' });
      if (room && room.housekeepingStatus !== 'dirty') await loadChecklist();
      else dispatchChecklist({ type: 'LOADED', checklist: null });
    } catch (error) {
      dispatch({
        type: 'FETCH_ERROR',
        message: getErrorMessage(error, 'No se pudo cargar la habitación. Intenta de nuevo.'),
      });
    }
  }, [roomId, loadChecklist]);

  useEffect(() => {
    load();
  }, [load]);

  const roomNumber = state.room?.roomNumber;
  useEffect(() => {
    if (roomNumber) navigation.setOptions({ title: `Habitación ${roomNumber}` });
  }, [navigation, roomNumber]);

  const retry = useCallback(() => {
    dispatch({ type: 'FETCH_START' });
    load();
  }, [load]);

  /** Tras un rechazo, el estado real lo da el backend: se vuelve a pedir sin tapar la pantalla. */
  const syncWithBackend = useCallback(async () => {
    try {
      const room = await getRoomById(roomId);
      dispatch(room ? { type: 'ROOM_LOADED', room } : { type: 'NOT_FOUND' });
    } catch {
      // Se conserva lo que había en pantalla; el mensaje de la acción ya informa del fallo.
    }
  }, [roomId]);

  async function handleAction(action: HousekeepingAction) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setActionError(null);

    try {
      const updated = await action.run(roomId);
      dispatch({ type: 'ROOM_LOADED', room: updated });
      await loadChecklist();
    } catch (error) {
      setActionError(getErrorMessage(error, 'No se pudo completar la acción. Intenta de nuevo.'));
      if (
        error instanceof HousekeepingServiceError &&
        (error.kind === 'rejected' || error.kind === 'notFound')
      ) {
        await syncWithBackend();
        await loadChecklist();
      }
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  async function handleChecklistItem(itemId: string, checked: boolean) {
    if (!checklist || submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    dispatchChecklist({ type: 'LOADING' });
    try {
      dispatchChecklist({
        type: 'LOADED',
        checklist: await setChecklistItemChecked(checklist, itemId, checked),
      });
    } catch (error) {
      await loadChecklist();
      dispatchChecklist({
        type: 'ERROR',
        message: getErrorMessage(error, 'No se pudo guardar el artículo. Intenta de nuevo.'),
      });
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  async function handleCompleteChecklist() {
    if (!checklist || submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setActionError(null);
    dispatchChecklist({ type: 'LOADING' });
    try {
      dispatchChecklist({
        type: 'LOADED',
        checklist: await completeRequestChecklist(checklist.id),
      });
    } catch (error) {
      await loadChecklist();
      dispatchChecklist({
        type: 'ERROR',
        message: getErrorMessage(error, 'No se pudo completar la lista. Intenta de nuevo.'),
      });
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  if (state.status === 'loading') {
    return <LoadingState message="Cargando habitación..." />;
  }

  if (state.status === 'notFound') {
    return (
      <View style={styles.centered}>
        <EmptyState
          icon="🚪"
          title="La habitación no existe"
          description="Puede que haya sido eliminada o que el enlace ya no sea válido."
        />
        <Button label="Volver" variant="secondary" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  if (state.status === 'error' || !state.room) {
    return (
      <ErrorState
        title="No se pudo cargar la habitación"
        description={state.errorMessage ?? undefined}
        onRetry={retry}
      />
    );
  }

  const { room } = state;
  const actions = getHousekeepingActions(room.housekeepingStatus);
  const traceRows = getTraceRows(room);
  const pendingItems = checklist?.items.filter((item) => !item.checked).length ?? 0;
  const needsChecklist =
    room.housekeepingStatus === 'cleaning' || room.housekeepingStatus === 'clean';
  const checklistReady =
    checklist &&
    (room.housekeepingStatus === 'cleaning'
      ? (checklist.status === 'pending' || checklist.status === 'in_progress') && pendingItems === 0
      : checklist.status === 'completed');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Habitación {room.roomNumber}</Text>
        <Text style={styles.meta}>Piso {room.floor}</Text>
      </View>

      <Card style={styles.section}>
        <RoomStatusBadge kind="housekeeping" status={room.housekeepingStatus} />
        <RoomStatusBadge kind="occupancy" status={room.status} />
        <Text style={styles.hint}>La ocupación la gestiona recepción.</Text>
      </Card>

      {actionError ? (
        <Text style={styles.error} accessibilityRole="alert">
          {actionError}
        </Text>
      ) : null}

      {needsChecklist ? (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Lista de limpieza</Text>
          {checklistLoading ? <Text style={styles.hint}>Cargando lista...</Text> : null}
          {checklistError ? (
            <Text style={styles.error} accessibilityRole="alert">
              {checklistError}
            </Text>
          ) : null}
          {!checklistLoading && !checklist && !checklistError ? (
            <Text style={styles.hint}>No se encontró la lista de esta habitación.</Text>
          ) : null}
          {checklist ? (
            <>
              <Text style={styles.hint}>
                {pendingItems === 0 ? 'Todos los puntos verificados' : `${pendingItems} pendientes`}
              </Text>
              {checklist.items.map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{
                    checked: item.checked,
                    disabled: room.housekeepingStatus !== 'cleaning' || isSubmitting,
                  }}
                  disabled={room.housekeepingStatus !== 'cleaning' || isSubmitting}
                  onPress={() => void handleChecklistItem(item.id, !item.checked)}
                  style={styles.checklistRow}
                >
                  <Text style={styles.checkbox}>{item.checked ? '☑' : '☐'}</Text>
                  <Text style={styles.body}>{item.label}</Text>
                </Pressable>
              ))}
              {room.housekeepingStatus === 'clean' && checklist.status !== 'completed' ? (
                <Button
                  label="Completar checklist"
                  disabled={pendingItems > 0 || isSubmitting}
                  loading={isSubmitting}
                  onPress={() => void handleCompleteChecklist()}
                  fullWidth
                />
              ) : null}
            </>
          ) : null}
          {room.housekeepingStatus === 'cleaning' && checklist && pendingItems > 0 ? (
            <Text style={styles.hint}>Verifica todos los puntos para finalizar la limpieza.</Text>
          ) : null}
          {checklistError || !checklist ? (
            <Button
              label="Reintentar lista"
              variant="secondary"
              onPress={() => void loadChecklist()}
            />
          ) : null}
        </Card>
      ) : null}

      {actions.length > 0 ? (
        <View style={styles.actions}>
          {actions.map((action) => (
            <Button
              key={action.label}
              label={action.label}
              loading={isSubmitting}
              disabled={
                needsChecklist && (!checklistReady || checklistLoading || Boolean(checklistError))
              }
              onPress={() => void handleAction(action)}
              fullWidth
            />
          ))}
        </View>
      ) : (
        <Text style={styles.hint}>El ciclo de limpieza de esta habitación está completo.</Text>
      )}

      {/* Disponible en cualquier estado de limpieza; no cambia ningún estado de la habitación. */}
      <Button
        label="Reportar desperfecto"
        variant="secondary"
        onPress={() =>
          navigation.navigate('ReportIssue', { roomId: room.id, roomNumber: room.roomNumber })
        }
        fullWidth
      />

      {room.notes ? (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Notas</Text>
          <Text style={styles.body}>{room.notes}</Text>
        </Card>
      ) : null}

      {traceRows.length > 0 ? (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Seguimiento de la limpieza</Text>
          {traceRows.map((row) => (
            <View key={row.label} style={styles.traceRow}>
              <Text style={styles.traceLabel}>{row.label}</Text>
              <Text style={styles.body}>{row.value}</Text>
            </View>
          ))}
        </Card>
      ) : null}

      <Text style={styles.meta}>Última actualización: {formatDateTime(room.updatedAt)}</Text>
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.sand[50],
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
  },
  meta: {
    ...typography.caption,
    color: colors.text.muted,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },
  body: {
    ...typography.body,
    color: colors.text.secondary,
  },
  hint: {
    ...typography.caption,
    color: colors.text.muted,
  },
  error: {
    ...typography.bodySmall,
    color: colors.state.danger,
  },
  actions: {
    gap: spacing.sm,
  },
  traceRow: {
    gap: spacing.xs,
  },
  traceLabel: {
    ...typography.caption,
    color: colors.text.muted,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  checkbox: {
    fontSize: 24,
    color: colors.brand[600],
  },
});
