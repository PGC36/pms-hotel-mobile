import { apiClient } from '@/shared/services/api-client';

import type { HousekeepingChecklistDTO } from '../dtos/checklist.dto';
import { mapChecklistDTOToModel, selectTurnoverChecklist } from '../mappers/checklist.mapper';
import type { HousekeepingChecklistModel } from '../models/checklist.model';
import { callHousekeepingApi } from './housekeeping.service';

export async function getTurnoverChecklist(
  roomId: string,
): Promise<HousekeepingChecklistModel | null> {
  const checklists = await callHousekeepingApi(() =>
    apiClient.get<HousekeepingChecklistDTO[]>(
      `/housekeeping/checklists?roomId=${encodeURIComponent(roomId)}`,
    ),
  );
  return selectTurnoverChecklist(checklists ?? []);
}

export async function setChecklistItemChecked(
  checklist: HousekeepingChecklistModel,
  itemId: string,
  checked: boolean,
): Promise<HousekeepingChecklistModel> {
  const items = checklist.items.map((item) => ({
    id: item.id,
    label: item.label,
    checked: item.id === itemId ? checked : item.checked,
    notes: item.notes,
  }));
  const updated = await callHousekeepingApi(() =>
    apiClient.put<HousekeepingChecklistDTO>(
      `/housekeeping/checklists/${encodeURIComponent(checklist.id)}`,
      { items },
    ),
  );
  return mapChecklistDTOToModel(updated);
}

export async function getRequestChecklist(
  roomId: string,
  requestId: string,
): Promise<HousekeepingChecklistModel | null> {
  const data = await callHousekeepingApi(() =>
    apiClient.get<HousekeepingChecklistDTO[]>(
      `/housekeeping/checklists?roomId=${encodeURIComponent(roomId)}`,
    ),
  );
  const checklist = (data ?? []).find((item) => item.serviceRequestId === requestId);
  return checklist ? mapChecklistDTOToModel(checklist) : null;
}

export async function createRequestChecklist(
  requestId: string,
  labels: string[],
): Promise<HousekeepingChecklistModel> {
  const data = await callHousekeepingApi(() =>
    apiClient.post<HousekeepingChecklistDTO>('/housekeeping/checklists', {
      serviceRequestId: requestId,
      items: labels.map((label) => ({ label, checked: false })),
    }),
  );
  return mapChecklistDTOToModel(data);
}

export async function completeRequestChecklist(id: string): Promise<HousekeepingChecklistModel> {
  const data = await callHousekeepingApi(() =>
    apiClient.put<HousekeepingChecklistDTO>(`/housekeeping/checklists/${encodeURIComponent(id)}`, {
      status: 'completed',
    }),
  );
  return mapChecklistDTOToModel(data);
}
