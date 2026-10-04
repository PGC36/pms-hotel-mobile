import { useCallback, useMemo, useReducer, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { EmptyState, ErrorState, LoadingState } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

import { TaskCard } from '../components/TaskCard';
import {
  TaskFilters,
  type TaskFiltersValue,
  type TaskStatusOption,
} from '../components/TaskFilters';
import { getStatusLabel, type TaskModel } from '../models/task.model';

interface State {
  status: 'loading' | 'error' | 'ready';
  tasks: TaskModel[];
  isRefreshing: boolean;
}

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; tasks: TaskModel[] }
  | { type: 'FETCH_ERROR' }
  | { type: 'REFRESH_START' };

const initialState: State = { status: 'loading', tasks: [], isRefreshing: false };

/**
 * `dispatch` (no un setter de `useState`) para poder actualizar el estado
 * desde el efecto de carga inicial sin disparar
 * `react-hooks/set-state-in-effect` — mismo patrón que `AuthContext`.
 */
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, status: 'loading' };
    case 'FETCH_SUCCESS':
      return { status: 'ready', tasks: action.tasks, isRefreshing: false };
    case 'FETCH_ERROR':
      return { ...state, status: 'error', isRefreshing: false };
    case 'REFRESH_START':
      return { ...state, isRefreshing: true };
    default:
      return state;
  }
}

export interface TaskListScreenConfig {
  /** Título opcional mostrado dentro de la pantalla; omítelo si el navegador ya muestra uno. */
  title?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: string;
  searchPlaceholder?: string;
  /**
   * `oldestFirst` (por defecto): por antigüedad de creación, la más antigua
   * primero. `asProvided`: respeta el orden que entrega `fetchTasks` (ej. un
   * historial ya ordenado por el servicio).
   */
  sort?: 'oldestFirst' | 'asProvided';
}

export interface TaskListScreenProps {
  /** El servicio: función que obtiene las tareas ya adaptadas a `TaskModel` (MOV-09/10/11 la arman por rol). */
  fetchTasks: () => Promise<TaskModel[]>;
  /** La configuración: textos por rol, sin lógica de datos. */
  config?: TaskListScreenConfig;
  onTaskPress?: (task: TaskModel) => void;
}

const ALL_STATUS_OPTION: TaskStatusOption = { value: 'all', label: 'Todos' };

function buildStatusOptions(tasks: TaskModel[]): TaskStatusOption[] {
  const seen = new Map<TaskStatusOption['value'], TaskStatusOption>();
  for (const task of tasks) {
    if (!seen.has(task.status)) {
      seen.set(task.status, {
        value: task.status,
        label: getStatusLabel(task.entityType, task.status),
      });
    }
  }
  return [ALL_STATUS_OPTION, ...seen.values()];
}

/**
 * Bandeja genérica que los tres roles de personal reutilizan (architecture.md
 * sección 3). No conoce `ServiceRequestModel` ni `OrderModel` — solo `TaskModel`,
 * que el llamador arma con el servicio y la configuración de su propio rol.
 */
export function TaskListScreen({ fetchTasks, config = {}, onTaskPress }: TaskListScreenProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [filters, setFilters] = useState<TaskFiltersValue>({ status: 'all', search: '' });

  const load = useCallback(async () => {
    try {
      const data = await fetchTasks();
      dispatch({ type: 'FETCH_SUCCESS', tasks: data });
    } catch {
      dispatch({ type: 'FETCH_ERROR' });
    }
  }, [fetchTasks]);

  // `useFocusEffect` (no un `useEffect` de montaje) para que la bandeja se
  // actualice también al volver de `TaskDetailScreen` tras un cambio de
  // estado (MOV-08 criterio de aceptación 3), no solo la primera vez.
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

  const statusOptions = useMemo(() => buildStatusOptions(state.tasks), [state.tasks]);

  const sortOrder = config.sort ?? 'oldestFirst';

  const visibleTasks = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    const filtered = state.tasks
      .filter((task) => filters.status === 'all' || task.status === filters.status)
      .filter((task) => {
        if (!search) return true;
        return (
          task.title.toLowerCase().includes(search) ||
          task.description.toLowerCase().includes(search) ||
          (task.roomLabel?.toLowerCase().includes(search) ?? false)
        );
      });

    if (sortOrder === 'asProvided') return filtered;
    return filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }, [state.tasks, filters, sortOrder]);

  if (state.status === 'loading') {
    return <LoadingState message="Cargando tareas..." />;
  }

  if (state.status === 'error') {
    return (
      <ErrorState
        title="No se pudieron cargar las tareas"
        description="Revisa tu conexión e intenta de nuevo."
        onRetry={retry}
      />
    );
  }

  return (
    <View style={styles.container}>
      {config.title ? <Text style={styles.title}>{config.title}</Text> : null}
      <TaskFilters
        statusOptions={statusOptions}
        value={filters}
        onChange={setFilters}
        searchPlaceholder={config.searchPlaceholder}
      />
      <FlatList
        data={visibleTasks}
        keyExtractor={(task) => task.id}
        renderItem={({ item }) => <TaskCard task={item} onPress={onTaskPress} />}
        contentContainerStyle={styles.listContent}
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
            icon={config.emptyIcon}
            title={
              state.tasks.length === 0 ? (config.emptyTitle ?? 'No hay tareas') : 'Sin resultados'
            }
            description={
              state.tasks.length === 0
                ? (config.emptyDescription ?? 'Todavía no hay tareas asignadas.')
                : 'Ningún elemento coincide con los filtros aplicados.'
            }
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sand[50],
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  listContent: {
    flexGrow: 1,
    padding: spacing.md,
  },
  separator: {
    height: spacing.sm,
  },
});
