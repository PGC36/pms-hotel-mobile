import { useCallback } from 'react';

import { useAuth } from '@/modules/auth/context/AuthContext';
import type { TaskModel } from '@/modules/tasks/models/task.model';
import { TaskListScreen, type TaskListScreenConfig } from '@/modules/tasks/screens/TaskListScreen';

import { getMyCompletedTasks } from '../services/housekeeping-task.service';

const CONFIG: TaskListScreenConfig = {
  emptyIcon: '✅',
  emptyTitle: 'Aún no hay tareas atendidas',
  emptyDescription: 'Las solicitudes cerradas bajo tu responsabilidad aparecerán aquí.',
  // `getMyCompletedTasks` ya entrega la más recientemente completada primero.
  sort: 'asProvided',
};

/**
 * Historial persistido del usuario en sesión sobre la bandeja genérica. Sin
 * `onTaskPress`: las tarjetas no son presionables, así que desde aquí no se
 * puede abrir un detalle ni cambiar el estado de una tarea ya completada.
 */
export function HousekeepingHistoryScreen() {
  const { session } = useAuth();
  const email = session?.type === 'staff' ? session.user.email : null;

  const fetchTasks = useCallback(
    (): Promise<TaskModel[]> =>
      email
        ? getMyCompletedTasks(email)
        : Promise.reject(new Error('No hay un usuario de personal en sesión.')),
    [email],
  );

  return <TaskListScreen fetchTasks={fetchTasks} config={CONFIG} />;
}
