import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { TaskListScreen, type TaskListScreenConfig } from '@/modules/tasks/screens/TaskListScreen';
import type { ConciergeStackParamList } from '@/navigation/routes';

import { ConciergeRequestServiceError } from '../../services/concierge-request-error';
import { getTerminalConciergeTasks } from '../../services/concierge-task.service';

type Props = NativeStackScreenProps<ConciergeStackParamList, 'ConciergeHistory'>;

const CONFIG: TaskListScreenConfig = {
  emptyIcon: '🧾',
  emptyTitle: 'No hay solicitudes atendidas todavía.',
  emptyDescription: 'Las solicitudes completadas, rechazadas o canceladas aparecerán aquí.',
  searchPlaceholder: 'Buscar por huésped, habitación o solicitud',
  // El servicio ya las entrega de la más reciente a la más antigua.
  sort: 'asProvided',
  loadingMessage: 'Cargando historial...',
  errorTitle: 'No se pudo cargar el historial',
  getErrorDescription: (error) =>
    error instanceof ConciergeRequestServiceError ? error.message : undefined,
};

/**
 * Historial del equipo de Conserjería (HU-10) sobre la bandeja genérica de
 * `tasks`. Cada solicitud abre el mismo detalle, que al ser terminal ya no
 * ofrece acciones.
 */
export function ConciergeHistoryScreen({ navigation }: Props) {
  return (
    <TaskListScreen
      fetchTasks={getTerminalConciergeTasks}
      config={CONFIG}
      onTaskPress={(task) => navigation.navigate('ConciergeRequestDetail', { requestId: task.id })}
    />
  );
}
