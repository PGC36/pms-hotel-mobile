import type { TaskModel } from '@/modules/tasks/models/task.model';

import type { MaintenanceModel } from '../models/maintenance.model';
import type { StayoverModel } from '../models/stayover.model';
import { getMaintenanceById, getMaintenanceRequests } from './maintenance.service';
import { getStayoverById, getStayovers } from './stayover.service';

export type HousekeepingEntry =
  | { kind: 'stayover'; request: StayoverModel; task: TaskModel }
  | { kind: 'maintenance'; request: MaintenanceModel; task: TaskModel };

export function mapStayoverToTask(request: StayoverModel): TaskModel {
  return {
    id: request.id,
    entityType: 'serviceRequest',
    title: request.description,
    description: request.notes ?? '',
    roomLabel: `Habitación ${request.roomNumber}`,
    meta: request.responsibleUserEmail ? `Responsable: ${request.responsibleUserEmail}` : undefined,
    status: request.status,
    createdAt: request.requestedAt,
    updatedAt: request.updatedAt,
  };
}

export function mapMaintenanceToTask(request: MaintenanceModel): TaskModel {
  return {
    id: request.id,
    entityType: 'serviceRequest',
    title: `Desperfecto: ${request.description}`,
    description: request.notes ?? '',
    roomLabel: `Habitación ${request.roomNumber}`,
    meta: request.responsibleUserEmail ? `Responsable: ${request.responsibleUserEmail}` : undefined,
    status: request.status,
    createdAt: request.requestedAt,
    updatedAt: request.updatedAt,
  };
}

export async function getHousekeepingTasks(): Promise<TaskModel[]> {
  const [stayovers, maintenance] = await Promise.all([getStayovers(), getMaintenanceRequests()]);
  return [
    ...stayovers
      .filter((request) => !['completed', 'cancelled', 'rejected'].includes(request.status))
      .map(mapStayoverToTask),
    ...maintenance
      .filter((request) => !['completed', 'cancelled', 'rejected'].includes(request.status))
      .map(mapMaintenanceToTask),
  ];
}

export async function getHousekeepingEntryById(id: string): Promise<HousekeepingEntry | null> {
  const stayover = await getStayoverById(id);
  if (stayover) return { kind: 'stayover', request: stayover, task: mapStayoverToTask(stayover) };
  const maintenance = await getMaintenanceById(id);
  return maintenance
    ? { kind: 'maintenance', request: maintenance, task: mapMaintenanceToTask(maintenance) }
    : null;
}

export async function getMyCompletedTasks(email: string): Promise<TaskModel[]> {
  const [stayovers, maintenance] = await Promise.all([getStayovers(), getMaintenanceRequests()]);
  return [
    ...stayovers
      .filter(
        (request) =>
          request.status === 'completed' &&
          request.completedByUserEmail?.toLowerCase() === email.toLowerCase(),
      )
      .map(mapStayoverToTask),
    ...maintenance
      .filter(
        (request) =>
          request.status === 'completed' &&
          request.completedByUserEmail?.toLowerCase() === email.toLowerCase(),
      )
      .map(mapMaintenanceToTask),
  ].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}
