import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { TaskNotesEditor } from '@/modules/tasks/components/TaskNotesEditor';
import {
  TaskDetailScreen,
  type TaskDetailScreenProps,
} from '@/modules/tasks/screens/TaskDetailScreen';
import type { ConciergeStackParamList } from '@/navigation/routes';
import { Button, Card, EmptyState, ErrorState, LoadingState } from '@/shared/components';
import type { ConciergeRequestStatus } from '@/shared/constants/statuses';
import { colors, spacing, typography } from '@/shared/theme';
import { formatDateTime } from '@/shared/utils/date';

import {
  isTerminalConciergeRequestStatus,
  type ConciergeRequestModel,
} from '../../models/concierge-request.model';
import { ConciergeRequestServiceError } from '../../services/concierge-request-error';
import {
  getConciergeRequest,
  rejectConciergeRequest,
  updateConciergeRequestNotes,
  updateConciergeRequestStatus,
} from '../../services/concierge-request.service';
import { mapConciergeRequestToTask } from '../../services/concierge-task.service';
import { getConciergeActionLabel } from '../concierge-actions';

type Props = NativeStackScreenProps<ConciergeStackParamList, 'ConciergeRequestDetail'>;

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'notFound' }
  | {
      status: 'ready';
      request: ConciergeRequestModel;
      /** Cambia solo al recargar, para que `TaskDetailScreen` arranque de la solicitud fresca. */
      version: number;
      /** Una acción falló porque la solicitud cambió en el servidor: hay que recargar. */
      isStale: boolean;
    };

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_DONE'; request: ConciergeRequestModel | null }
  | { type: 'FETCH_ERROR'; message: string }
  | { type: 'REQUEST_UPDATED'; request: ConciergeRequestModel }
  | { type: 'MARK_STALE' };

/** `dispatch` (no setters de `useState`) para no disparar `react-hooks/set-state-in-effect`. */
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { status: 'loading' };
    case 'FETCH_DONE':
      if (!action.request) return { status: 'notFound' };
      return {
        status: 'ready',
        request: action.request,
        version: state.status === 'ready' ? state.version + 1 : 0,
        isStale: false,
      };
    case 'FETCH_ERROR':
      return { status: 'error', message: action.message };
    case 'REQUEST_UPDATED':
      return state.status === 'ready' ? { ...state, request: action.request } : state;
    case 'MARK_STALE':
      return state.status === 'ready' ? { ...state, isStale: true } : state;
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof ConciergeRequestServiceError
    ? error.message
    : 'Ocurrió un error inesperado. Intenta de nuevo.';
}

/** La solicitud cambió en el servidor (o ya no existe): conviene recargar antes de seguir. */
function isStaleError(error: unknown): boolean {
  return (
    error instanceof ConciergeRequestServiceError &&
    (error.kind === 'invalidTransition' || error.kind === 'notFound')
  );
}

/**
 * Detalle de una solicitud de Conserjería para el personal (MOV-11). Recibe
 * solo `requestId` y pide la solicitud fresca; las transiciones las delega en
 * `TaskDetailScreen` y el contenido propio (datos y observaciones) va como
 * hijo. Toda transición la hace el backend: esta pantalla solo muestra la
 * solicitud que devuelve cada operación.
 */
export function ConciergeRequestDetailScreen({ route }: Props) {
  const { requestId } = route.params;
  const [state, dispatch] = useReducer(reducer, { status: 'loading' });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  // Solicitud vigente para las acciones, sin esperar al siguiente render.
  const requestRef = useRef<ConciergeRequestModel | null>(null);

  const load = useCallback(async () => {
    try {
      const request = await getConciergeRequest(requestId);
      requestRef.current = request;
      dispatch({ type: 'FETCH_DONE', request });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', message: getErrorMessage(error) });
    }
  }, [requestId]);

  useEffect(() => {
    load();
  }, [load]);

  const reload = useCallback(() => {
    dispatch({ type: 'FETCH_START' });
    load();
  }, [load]);

  const applyUpdate = useCallback((request: ConciergeRequestModel) => {
    requestRef.current = request;
    dispatch({ type: 'REQUEST_UPDATED', request });
  }, []);

  const handleUpdateStatus = useCallback<TaskDetailScreenProps['onUpdateStatus']>(
    async (nextStatus, options) => {
      const request = requestRef.current;
      if (!request) throw new ConciergeRequestServiceError('notFound');
      setIsTransitioning(true);
      try {
        // Las observaciones no viajan con la transición (POST /status las AGREGA):
        // se editan aparte con PUT. Solo el rechazo agrega su línea de motivo.
        const updated =
          nextStatus === 'rejected'
            ? await rejectConciergeRequest(request, options?.rejectionReason ?? '')
            : await updateConciergeRequestStatus(request, nextStatus as ConciergeRequestStatus);
        applyUpdate(updated);
        return mapConciergeRequestToTask(updated);
      } catch (error) {
        if (isStaleError(error)) dispatch({ type: 'MARK_STALE' });
        throw error;
      } finally {
        setIsTransitioning(false);
      }
    },
    [applyUpdate],
  );

  const handleSaveNotes = useCallback(
    async (notes: string) => {
      const request = requestRef.current;
      if (!request) throw new ConciergeRequestServiceError('notFound');
      setIsSavingNotes(true);
      try {
        applyUpdate(await updateConciergeRequestNotes(request.id, notes));
      } catch (error) {
        if (isStaleError(error)) dispatch({ type: 'MARK_STALE' });
        throw error;
      } finally {
        setIsSavingNotes(false);
      }
    },
    [applyUpdate],
  );

  if (state.status === 'loading') return <LoadingState message="Cargando solicitud..." />;
  if (state.status === 'notFound') {
    return (
      <EmptyState
        icon="🔎"
        title="La solicitud no existe"
        description="Pudo haber sido eliminada. Vuelve a la bandeja."
      />
    );
  }
  if (state.status === 'error') {
    return (
      <ErrorState
        title="No se pudo cargar la solicitud"
        description={state.message}
        onRetry={reload}
      />
    );
  }

  const { request, version, isStale } = state;

  return (
    <TaskDetailScreen
      key={`${request.id}-${version}`}
      task={mapConciergeRequestToTask(request)}
      onUpdateStatus={handleUpdateStatus}
      getActionLabel={getConciergeActionLabel}
      showNotesField={false}
      optimistic={false}
      disabled={isSavingNotes || isStale}
    >
      <Card style={styles.card}>
        <InfoRow label="Habitación" value={request.roomNumber ?? 'No disponible'} />
        <InfoRow label="Huésped" value={request.guestName ?? 'No disponible'} />
        <InfoRow label="Atiende" value={request.responsibleUserName ?? 'Sin asignar'} />
        <InfoRow label="Solicitado" value={formatDateTime(request.requestedAt)} />
      </Card>

      <TaskNotesEditor
        notes={request.notes}
        editable={!isTerminalConciergeRequestStatus(request.status)}
        disabled={isTransitioning || isStale}
        onSave={handleSaveNotes}
        inputAccessibilityLabel="Observaciones de la solicitud"
        readOnlyHint="La solicitud está cerrada: las observaciones son de solo lectura."
        clearConfirmMessage="¿Eliminar las observaciones? La solicitud quedará sin observaciones."
      />

      {isStale ? (
        <Card style={styles.card}>
          <Text style={styles.body} accessibilityRole="alert">
            La solicitud cambió en el servidor. Actualízala antes de continuar.
          </Text>
          <Button label="Actualizar solicitud" onPress={reload} />
        </Card>
      ) : null}
    </TaskDetailScreen>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.body}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  body: {
    ...typography.body,
    color: colors.text.primary,
    flexShrink: 1,
  },
  muted: {
    ...typography.bodySmall,
    color: colors.text.muted,
  },
});
