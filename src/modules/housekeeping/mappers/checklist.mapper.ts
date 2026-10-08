import type { HousekeepingChecklistDTO } from '../dtos/checklist.dto';
import type { HousekeepingChecklistModel } from '../models/checklist.model';

export function mapChecklistDTOToModel(dto: HousekeepingChecklistDTO): HousekeepingChecklistModel {
  return {
    id: dto.id,
    serviceRequestId: dto.serviceRequestId,
    roomId: dto.roomId,
    status: dto.status,
    createdAt: new Date(dto.createdAt),
    items: dto.items
      .map(({ id, label, checked, position, notes }) => ({
        id,
        label,
        checked,
        position,
        notes,
      }))
      .sort((a, b) => a.position - b.position),
  };
}

export function selectTurnoverChecklist(
  checklists: HousekeepingChecklistDTO[],
): HousekeepingChecklistModel | null {
  const turnover = checklists
    .filter((checklist) => checklist.serviceRequestId === null && checklist.status !== 'cancelled')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  return turnover ? mapChecklistDTOToModel(turnover) : null;
}
