import { apiClient } from '@/shared/services/api-client';

import type { StayoverDTO } from '../dtos/stayover.dto';
import { mapStayoverDTOToModel } from '../mappers/stayover.mapper';
import type { StayoverModel } from '../models/stayover.model';
import { callHousekeepingApi } from './housekeeping.service';

const PATH = '/housekeeping/rooms/stayover-cleanings';

export async function getStayovers(): Promise<StayoverModel[]> {
  const data = await callHousekeepingApi(() => apiClient.get<StayoverDTO[]>(PATH));
  return (data ?? []).map(mapStayoverDTOToModel);
}

export async function getStayoverById(id: string): Promise<StayoverModel | null> {
  return (await getStayovers()).find((request) => request.id === id) ?? null;
}

export async function advanceStayover(
  id: string,
  action: 'start' | 'complete',
): Promise<StayoverModel> {
  const data = await callHousekeepingApi(() =>
    apiClient.post<StayoverDTO>(`${PATH}/${encodeURIComponent(id)}/${action}`),
  );
  return mapStayoverDTOToModel(data);
}
