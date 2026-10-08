import { useCallback, useEffect, useReducer, useRef } from 'react';
import { Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import {
  TaskDetailScreen,
  type TaskDetailScreenProps,
} from '@/modules/tasks/screens/TaskDetailScreen';
import type { ConciergeStackParamList } from '@/navigation/routes';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components';
import type { ServiceRequestStatus } from '@/shared/constants/statuses';

import { mapConciergeToTask } from '../mappers/concierge-request.mapper';
import type { ConciergeRequestModel } from '../models/concierge-request.model';
import { getConciergeRequestById, updateConciergeStatus } from '../services/concierge.service';

type Props = NativeStackScreenProps<ConciergeStackParamList, 'Detail'>;
type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'notFound' }
  | { status: 'ready'; request: ConciergeRequestModel };
type Action =
  | { type: 'LOAD' }
  | { type: 'LOADED'; request: ConciergeRequestModel | null }
  | { type: 'ERROR'; message: string };
function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD':
      return { status: 'loading' };
    case 'LOADED':
      return action.request ? { status: 'ready', request: action.request } : { status: 'notFound' };
    case 'ERROR':
      return { status: 'error', message: action.message };
  }
}

export function ConciergeDetailScreen({ route }: Props) {
  const { requestId } = route.params;
  const [state, dispatch] = useReducer(reducer, { status: 'loading' });
  const requestRef = useRef<ConciergeRequestModel | null>(null);
  const load = useCallback(async () => {
    try {
      const request = await getConciergeRequestById(requestId);
      requestRef.current = request;
      dispatch({ type: 'LOADED', request });
    } catch (error) {
      dispatch({
        type: 'ERROR',
        message: error instanceof Error ? error.message : 'No se pudo cargar la solicitud.',
      });
    }
  }, [requestId]);
  useEffect(() => {
    void load();
  }, [load]);

  const update = useCallback<TaskDetailScreenProps['onUpdateStatus']>(async (status, options) => {
    if (!requestRef.current) throw new Error('Recarga la solicitud antes de continuar.');
    if (status === 'rejected' && !options?.rejectionReason?.trim())
      throw new Error('Indica el motivo del rechazo.');
    const reason =
      status === 'rejected'
        ? `Motivo de rechazo: ${options?.rejectionReason?.trim() ?? ''}`
        : undefined;
    const updated = await updateConciergeStatus(
      requestRef.current,
      status as ServiceRequestStatus,
      reason,
    );
    requestRef.current = updated;
    return mapConciergeToTask(updated);
  }, []);

  if (state.status === 'loading') return <LoadingState message="Cargando solicitud..." />;
  if (state.status === 'notFound') return <EmptyState title="La solicitud no existe" />;
  if (state.status === 'error')
    return (
      <ErrorState
        title="No se pudo cargar la solicitud"
        description={state.message}
        onRetry={() => {
          dispatch({ type: 'LOAD' });
          void load();
        }}
      />
    );
  return (
    <TaskDetailScreen
      task={mapConciergeToTask(state.request)}
      onUpdateStatus={update}
      optimistic={false}
      showNotesField={false}
    >
      {state.request.notes ? <Text>{state.request.notes}</Text> : null}
    </TaskDetailScreen>
  );
}
