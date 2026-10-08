import { apiClient } from '@/shared/services/api-client';

import type { HousekeepingChecklistDTO, HousekeepingChecklistTemplateDTO } from '../dtos/checklist.dto';
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

export async function getGuestCleaningChecklistTemplate(): Promise<string[]> {
  const template = await callHousekeepingApi(() =>
    apiClient.get<HousekeepingChecklistTemplateDTO>('/housekeeping/checklist-template'),
  );
  return template.items;
}

export async function getOrCreateRequestChecklist(
  roomId: string,
  requestId: string,
): Promise<HousekeepingChecklistModel> {
  const existing = await getRequestChecklist(roomId, requestId);
  if (existing) return existing;

  const labels = await getGuestCleaningChecklistTemplate();
  try {
    return await createRequestChecklist(requestId, labels);
  } catch (error) {
    // Another staff member may have opened this request at the same time.
    const createdByAnotherStaff = await getRequestChecklist(roomId, requestId);
    if (createdByAnotherStaff) return createdByAnotherStaff;
    throw error;
  }
}

export async function addChecklistItem(
  checklist: HousekeepingChecklistModel,
  label: string,
): Promise<HousekeepingChecklistModel> {
  const items = [
    ...checklist.items.map((item) => ({
      id: item.id,
      label: item.label,
      checked: item.checked,
      notes: item.notes,
    })),
    { label: label.trim(), checked: false },
  ];
  const updated = await callHousekeepingApi(() =>
    apiClient.put<HousekeepingChecklistDTO>(
      `/housekeeping/checklists/${encodeURIComponent(checklist.id)}`,
      { items },
    ),
  );
  return mapChecklistDTOToModel(updated);
}

export async function completeRequestChecklist(id: string): Promise<HousekeepingChecklistModel> {
  const data = await callHousekeepingApi(() =>
    apiClient.put<HousekeepingChecklistDTO>(`/housekeeping/checklists/${encodeURIComponent(id)}`, {
      status: 'completed',
    }),
  );
  return mapChecklistDTOToModel(data);
}
