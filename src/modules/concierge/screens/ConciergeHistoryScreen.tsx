import { useCallback } from 'react';

import { useAuth } from '@/modules/auth/context/AuthContext';
import { TaskListScreen } from '@/modules/tasks/screens/TaskListScreen';

import { getMyConciergeHistory } from '../services/concierge-task.service';

export function ConciergeHistoryScreen() {
  const { session } = useAuth();
  const email = session?.type === 'staff' ? session.user.email : null;
  const fetchTasks = useCallback(
    () =>
      email
        ? getMyConciergeHistory(email)
        : Promise.reject(new Error('No hay sesión de personal.')),
    [email],
  );
  return (
    <TaskListScreen
      fetchTasks={fetchTasks}
      config={{
        emptyTitle: 'Aún no hay solicitudes atendidas',
        emptyDescription: 'Las solicitudes cerradas bajo tu responsabilidad aparecerán aquí.',
        sort: 'asProvided',
      }}
    />
  );
}
