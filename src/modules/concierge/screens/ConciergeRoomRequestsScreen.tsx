import { useCallback } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { TaskListScreen } from '@/modules/tasks/screens/TaskListScreen';
import type { ConciergeStackParamList } from '@/navigation/routes';

import { getConciergeTasksForRoom } from '../services/concierge-task.service';

type Props = NativeStackScreenProps<ConciergeStackParamList, 'RoomRequests'>;

export function ConciergeRoomRequestsScreen({ route, navigation }: Props) {
  const { roomId } = route.params;
  const fetchTasks = useCallback(() => getConciergeTasksForRoom(roomId), [roomId]);
  return (
    <TaskListScreen
      fetchTasks={fetchTasks}
      config={{ emptyTitle: 'No hay solicitudes en esta habitación' }}
      onTaskPress={(task) => navigation.navigate('Detail', { requestId: task.id })}
    />
  );
}
