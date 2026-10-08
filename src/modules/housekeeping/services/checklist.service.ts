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
