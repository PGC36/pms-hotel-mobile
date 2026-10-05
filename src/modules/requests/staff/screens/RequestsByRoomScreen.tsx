import { useCallback, useReducer } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { TaskListScreen, type TaskListScreenConfig } from '@/modules/tasks/screens/TaskListScreen';
import type { ConciergeStackParamList } from '@/navigation/routes';
import { Card, EmptyState, ErrorState, LoadingState } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

import type { ConciergeRoomGroup } from '../../models/concierge-request.model';
import { ConciergeRequestServiceError } from '../../services/concierge-request-error';
import {
  getActiveConciergeRoomGroups,
  getActiveConciergeTasksForRoom,
} from '../../services/concierge-task.service';

type Props = NativeStackScreenProps<ConciergeStackParamList, 'RequestsByRoom'>;

/**
 * Solicitudes por habitación (HU-09). Sin parámetros muestra las habitaciones
 * con solicitudes activas; con `roomKey`, las solicitudes de esa habitación
 * sobre la bandeja genérica de `tasks`. Ambos niveles hacen una sola llamada a
 * `GET /concierge/requests` y agrupan con `roomId`/`roomNumber` de la
 * respuesta: no hay endpoint por habitación ni consultas por reserva.
 */
export function RequestsByRoomScreen({ navigation, route }: Props) {
  const room = route.params;
  if (room) {
    return (
      <RoomRequests
        roomKey={room.roomKey}
        onOpen={(requestId) => navigation.navigate('ConciergeRequestDetail', { requestId })}
      />
    );
  }
  return (
    <RoomGroups
      onOpenRoom={(group) =>
        navigation.push('RequestsByRoom', { roomKey: group.key, roomLabel: group.label })
      }
    />
  );
}

function getErrorDescription(error: unknown): string | undefined {
  return error instanceof ConciergeRequestServiceError ? error.message : undefined;
}

// ---------------------------------------------------------------------------
// Nivel 2: solicitudes de una habitación (TaskListScreen)
// ---------------------------------------------------------------------------

const ROOM_REQUESTS_CONFIG: TaskListScreenConfig = {
  emptyIcon: '🛎️',
  emptyTitle: 'No hay solicitudes activas en esta habitación',
  emptyDescription: 'Las que se atendieron pueden consultarse en el historial.',
  searchPlaceholder: 'Buscar por huésped o solicitud',
  // Orden del backend: la que más tiempo lleva esperando, primero.
  sort: 'asProvided',
  loadingMessage: 'Cargando solicitudes...',
  errorTitle: 'No se pudieron cargar las solicitudes',
  getErrorDescription,
};

function RoomRequests({
  roomKey,
  onOpen,
}: {
  roomKey: string;
  onOpen: (requestId: string) => void;
}) {
  const fetchTasks = useCallback(() => getActiveConciergeTasksForRoom(roomKey), [roomKey]);
  return (
    <TaskListScreen
      fetchTasks={fetchTasks}
      config={ROOM_REQUESTS_CONFIG}
      onTaskPress={(task) => onOpen(task.id)}
    />
  );
}

// ---------------------------------------------------------------------------
// Nivel 1: habitaciones con solicitudes activas
// ---------------------------------------------------------------------------

interface State {
  status: 'loading' | 'error' | 'ready';
  groups: ConciergeRoomGroup[];
  isRefreshing: boolean;
  errorMessage: string | null;
}

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; groups: ConciergeRoomGroup[] }
  | { type: 'FETCH_ERROR'; message: string | null }
  | { type: 'REFRESH_START' };

const initialState: State = {
  status: 'loading',
  groups: [],
  isRefreshing: false,
  errorMessage: null,
};

/** `dispatch` (no setters de `useState`) para no disparar `react-hooks/set-state-in-effect`. */
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, status: 'loading', errorMessage: null };
    case 'FETCH_SUCCESS':
      return { status: 'ready', groups: action.groups, isRefreshing: false, errorMessage: null };
    case 'FETCH_ERROR':
      return { ...state, status: 'error', isRefreshing: false, errorMessage: action.message };
    case 'REFRESH_START':
      return { ...state, isRefreshing: true };
  }
}

function formatCount(count: number): string {
  return count === 1 ? '1 solicitud activa' : `${count} solicitudes activas`;
}

function RoomGroups({ onOpenRoom }: { onOpenRoom: (group: ConciergeRoomGroup) => void }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const load = useCallback(async () => {
    try {
      dispatch({ type: 'FETCH_SUCCESS', groups: await getActiveConciergeRoomGroups() });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', message: getErrorDescription(error) ?? null });
    }
  }, []);

  // Igual que `TaskListScreen`: recarga al volver de un detalle, sin polling.
  useFocusEffect(
    useCallback(() => {
      dispatch({ type: 'FETCH_START' });
      load();
    }, [load]),
  );

  const retry = useCallback(() => {
    dispatch({ type: 'FETCH_START' });
    load();
  }, [load]);

  const handleRefresh = useCallback(() => {
    dispatch({ type: 'REFRESH_START' });
    load();
  }, [load]);

  if (state.status === 'loading') return <LoadingState message="Cargando habitaciones..." />;
  if (state.status === 'error') {
    return (
      <ErrorState
        title="No se pudieron cargar las solicitudes"
        description={state.errorMessage ?? 'Revisa tu conexión e intenta de nuevo.'}
        onRetry={retry}
      />
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={state.groups}
      keyExtractor={(group) => group.key}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onOpenRoom(item)}
          accessibilityRole="button"
          accessibilityLabel={`${item.label}, ${formatCount(item.requests.length)}`}
        >
          <Card style={styles.card}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.count}>{formatCount(item.requests.length)}</Text>
          </Card>
        </Pressable>
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      refreshControl={
        <RefreshControl
          refreshing={state.isRefreshing}
          onRefresh={handleRefresh}
          colors={[colors.brand[600]]}
          tintColor={colors.brand[600]}
        />
      }
      ListEmptyComponent={
        <EmptyState
          icon="🛎️"
          title="No hay solicitudes activas por habitación"
          description="Cuando un huésped pida algo a conserjería aparecerá aquí."
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sand[50],
  },
  content: {
    flexGrow: 1,
    padding: spacing.md,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    ...typography.body,
    color: colors.text.primary,
  },
  count: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  separator: {
    height: spacing.sm,
  },
});
