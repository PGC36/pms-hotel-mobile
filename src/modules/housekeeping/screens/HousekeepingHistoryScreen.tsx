import { useCallback } from 'react';

import { useAuth } from '@/modules/auth/context/AuthContext';
import type { TaskModel } from '@/modules/tasks/models/task.model';
import { TaskListScreen, type TaskListScreenConfig } from '@/modules/tasks/screens/TaskListScreen';

import { getMyCompletedTasks } from '../services/housekeeping-task.service';

const CONFIG: TaskListScreenConfig = {
  emptyIcon: '✅',
  emptyTitle: 'Aún no hay tareas completadas',
  emptyDescription: 'Las solicitudes que completes aparecerán aquí.',
  // `getMyCompletedTasks` ya entrega la más recientemente completada primero.
  sort: 'asProvided',
};

/**
 * Historial del usuario en sesión (HU-10) sobre la bandeja genérica. Sin
 * `onTaskPress`: las tarjetas no son presionables, así que desde aquí no se
 * puede abrir un detalle ni cambiar el estado de una tarea ya completada.
 */
export function HousekeepingHistoryScreen() {
  const { session } = useAuth();
  const userId = session?.type === 'staff' ? session.user.id : null;

  const fetchTasks = useCallback(
    (): Promise<TaskModel[]> =>
      userId
        ? getMyCompletedTasks(userId)
        : Promise.reject(new Error('No hay un usuario de personal en sesión.')),
    [userId],
  );

  return <TaskListScreen fetchTasks={fetchTasks} config={CONFIG} />;
}
