import { apiClient } from '@/shared/services/api-client';
import {
  SERVICE_REQUEST_STATUS_TRANSITIONS,
  type ServiceRequestStatus,
} from '@/shared/constants/statuses';
import { assertValidTransition } from '@/modules/tasks/services/task-transition.service';

import type { MaintenanceDTO } from '../dtos/maintenance.dto';
import { mapMaintenanceDTOToModel } from '../mappers/maintenance.mapper';
import type { MaintenanceModel } from '../models/maintenance.model';
import { callHousekeepingApi, HousekeepingServiceError } from './housekeeping.service';

const PATH = '/service-requests';

export async function getMaintenanceRequests(roomId?: string): Promise<MaintenanceModel[]> {
  const query = `?type=maintenance${roomId ? `&roomId=${encodeURIComponent(roomId)}` : ''}`;
  const data = await callHousekeepingApi(() => apiClient.get<MaintenanceDTO[]>(`${PATH}${query}`));
  return (data ?? []).map(mapMaintenanceDTOToModel);
}

export async function getMaintenanceById(id: string): Promise<MaintenanceModel | null> {
  try {
    const data = await callHousekeepingApi(() =>
      apiClient.get<MaintenanceDTO>(`${PATH}/${encodeURIComponent(id)}`),
    );
    return data.type === 'maintenance' ? mapMaintenanceDTOToModel(data) : null;
  } catch (error) {
    if (error instanceof HousekeepingServiceError && error.kind === 'notFound') return null;
    throw error;
  }
}

export async function createMaintenanceRequest(
  roomId: string,
  description: string,
  notes?: string,
): Promise<MaintenanceModel> {
  const data = await callHousekeepingApi(() =>
    apiClient.post<MaintenanceDTO>(PATH, { roomId, type: 'maintenance', description, notes }),
  );
  return mapMaintenanceDTOToModel(data);
}

export async function updateMaintenanceStatus(
  request: MaintenanceModel,
  status: ServiceRequestStatus,
  notes?: string,
): Promise<MaintenanceModel> {
  assertValidTransition(
    SERVICE_REQUEST_STATUS_TRANSITIONS,
    request.status,
    status,
    'ServiceRequest',
  );
  const data = await callHousekeepingApi(() =>
    apiClient.post<MaintenanceDTO>(`${PATH}/${encodeURIComponent(request.id)}/status`, {
      status: status === 'inProgress' ? 'in_progress' : status,
      notes,
    }),
  );
  return mapMaintenanceDTOToModel(data);
}
