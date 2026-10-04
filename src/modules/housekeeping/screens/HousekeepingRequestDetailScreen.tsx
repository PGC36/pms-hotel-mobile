import { useCallback, useEffect, useReducer } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useAuth } from '@/modules/auth/context/AuthContext';
import type { TaskModel } from '@/modules/tasks/models/task.model';
import {
  TaskDetailScreen,
  type TaskDetailScreenProps,
} from '@/modules/tasks/screens/TaskDetailScreen';
import type { HousekeepingStackParamList } from '@/navigation/routes';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components';

import {
  getHousekeepingTaskById,
  updateHousekeepingTaskStatus,
} from '../services/housekeeping-task.service';

type Props = NativeStackScreenProps<HousekeepingStackParamList, 'RequestDetail'>;

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'notFound' }
  | { status: 'ready'; task: TaskModel };

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_DONE'; task: TaskModel | null }
  | { type: 'FETCH_ERROR' };

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { status: 'loading' };
    case 'FETCH_DONE':
      return action.task ? { status: 'ready', task: action.task } : { status: 'notFound' };
    case 'FETCH_ERROR':
      return { status: 'error' };
  }
}

/**
 * Recibe solo `taskId`, pide la solicitud fresca y delega todo el detalle
 * (transiciones, confirmación, motivo de rechazo, observaciones, reversión)
 * en `TaskDetailScreen`.
 */
export function HousekeepingRequestDetailScreen({ route }: Props) {
  const { taskId } = route.params;
  const [state, dispatch] = useReducer(reducer, { status: 'loading' });

  const load = useCallback(async () => {
    try {
      dispatch({ type: 'FETCH_DONE', task: await getHousekeepingTaskById(taskId) });
    } catch {
      dispatch({ type: 'FETCH_ERROR' });
    }
  }, [taskId]);

  useEffect(() => {
    load();
  }, [load]);

  const retry = useCallback(() => {
    dispatch({ type: 'FETCH_START' });
    load();
  }, [load]);

  // El responsable sale de la sesión aquí, no en el servicio (no depende de hooks).
  const { session } = useAuth();
  const userId = session?.type === 'staff' ? session.user.id : undefined;

  const handleUpdateStatus = useCallback<TaskDetailScreenProps['onUpdateStatus']>(
    (nextStatus, options) =>
      updateHousekeepingTaskStatus(taskId, nextStatus, {
        ...options,
        completedByUserId: nextStatus === 'completed' ? userId : undefined,
      }),
    [taskId, userId],
  );

  if (state.status === 'loading') return <LoadingState message="Cargando solicitud..." />;
  if (state.status === 'notFound') {
    return <EmptyState icon="🔎" title="La solicitud no existe" />;
  }
  if (state.status === 'error') {
    return <ErrorState title="No se pudo cargar la solicitud" onRetry={retry} />;
  }

  return <TaskDetailScreen task={state.task} onUpdateStatus={handleUpdateStatus} />;
}
