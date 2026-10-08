import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { TaskListScreen, type TaskListScreenConfig } from '@/modules/tasks/screens/TaskListScreen';
import type { RoomServiceStackParamList } from '@/navigation/routes';

import { getActiveOrderTasks } from '../../services/order-task.service';
import { RoomServiceServiceError } from '../../services/room-service-error';

type Props = NativeStackScreenProps<RoomServiceStackParamList, 'OrderInbox'>;

const CONFIG: TaskListScreenConfig = {
  emptyIcon: '🛎️',
  emptyTitle: 'No hay pedidos pendientes por atender.',
  emptyDescription: 'Cuando un huésped haga un pedido aparecerá aquí.',
  searchPlaceholder: 'Buscar por huésped, habitación o producto',
  // El backend ya los entrega del más reciente al más antiguo.
  sort: 'asProvided',
  loadingMessage: 'Cargando pedidos...',
  errorTitle: 'No se pudieron cargar los pedidos',
  getErrorDescription: (error) =>
    error instanceof RoomServiceServiceError ? error.message : undefined,
};

/** Bandeja de pedidos de Room Service: solo configura la bandeja genérica de `tasks`. */
export function OrderInboxScreen({ navigation }: Props) {
  return (
    <TaskListScreen
      fetchTasks={getActiveOrderTasks}
      config={CONFIG}
      onTaskPress={(task) => navigation.navigate('OrderDetail', { orderId: task.id })}
    />
  );
}
