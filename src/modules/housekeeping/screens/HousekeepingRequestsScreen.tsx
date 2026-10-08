import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { TaskListScreen, type TaskListScreenConfig } from '@/modules/tasks/screens/TaskListScreen';
import type { HousekeepingStackParamList } from '@/navigation/routes';

import { getHousekeepingTasks } from '../services/housekeeping-task.service';
import { HousekeepingServiceError } from '../services/housekeeping.service';

type Props = NativeStackScreenProps<HousekeepingStackParamList, 'Requests'>;

const CONFIG: TaskListScreenConfig = {
  emptyIcon: '🧺',
  emptyTitle: 'No hay solicitudes',
  emptyDescription: 'Cuando un huésped pida limpieza o artículos aparecerá aquí.',
  getErrorDescription: (error) =>
    error instanceof HousekeepingServiceError ? error.message : undefined,
};

/** Bandeja de solicitudes de Limpieza: solo configura la bandeja genérica de `tasks`. */
export function HousekeepingRequestsScreen({ navigation }: Props) {
  return (
    <TaskListScreen
      fetchTasks={getHousekeepingTasks}
      config={CONFIG}
      onTaskPress={(task) => navigation.navigate('RequestDetail', { taskId: task.id })}
    />
  );
}
