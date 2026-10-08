import type { TaskModel } from '@/modules/tasks/models/task.model';

import { mapConciergeToTask } from '../mappers/concierge-request.mapper';
import { getConciergeRequests } from './concierge.service';
import { filterMyConciergeHistory } from './concierge-history';

const TERMINAL = new Set(['completed', 'rejected', 'cancelled']);

export async function getActiveConciergeTasks(): Promise<TaskModel[]> {
  return (await getConciergeRequests())
    .filter((request) => !TERMINAL.has(request.status))
    .map(mapConciergeToTask);
}

export async function getConciergeTasksForRoom(roomId: string): Promise<TaskModel[]> {
  return (await getConciergeRequests())
    .filter((request) => request.roomId === roomId)
    .map(mapConciergeToTask);
}

export async function getMyConciergeHistory(email: string): Promise<TaskModel[]> {
  return filterMyConciergeHistory(await getConciergeRequests(), email);
}
