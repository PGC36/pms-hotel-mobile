import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { TaskListScreen, type TaskListScreenConfig } from '@/modules/tasks/screens/TaskListScreen';
import type { RoomServiceStackParamList } from '@/navigation/routes';

import { getTerminalOrderTasks } from '../../services/order-task.service';
import { RoomServiceServiceError } from '../../services/room-service-error';

type Props = NativeStackScreenProps<RoomServiceStackParamList, 'History'>;

const CONFIG: TaskListScreenConfig = {
  emptyIcon: '🧾',
  emptyTitle: 'No hay pedidos atendidos todavía.',
  emptyDescription: 'Los pedidos entregados, rechazados o cancelados aparecerán aquí.',
  searchPlaceholder: 'Buscar por huésped, habitación o producto',
  // El backend ya los entrega del más reciente al más antiguo; no hay una
  // fecha de cierre propia por la cual reordenar.
  sort: 'asProvided',
  loadingMessage: 'Cargando historial...',
  errorTitle: 'No se pudo cargar el historial',
  getErrorDescription: (error) =>
    error instanceof RoomServiceServiceError ? error.message : undefined,
};

/**
 * Historial del equipo de Room Service sobre la bandeja genérica de `tasks`.
 * Cada pedido abre el mismo detalle, que al ser terminal ya no ofrece acciones.
 */
export function OrderHistoryScreen({ navigation }: Props) {
  return (
    <TaskListScreen
      fetchTasks={getTerminalOrderTasks}
      config={CONFIG}
      onTaskPress={(task) => navigation.navigate('OrderDetail', { orderId: task.id })}
    />
  );
}
