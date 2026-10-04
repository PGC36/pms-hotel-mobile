import type { RoomStatus } from '@/shared/constants/statuses';

import type { RoomDTO, RoomStatusDTO } from '../dtos/room.dto';
import type { RoomModel } from '../models/room.model';

const ROOM_STATUS_FROM_DTO: Record<RoomStatusDTO, RoomStatus> = {
  available: 'available',
  occupied: 'occupied',
  maintenance: 'maintenance',
  out_of_service: 'outOfService',
};

function toDateOrNull(value: string | null | undefined): Date | null {
  return value ? new Date(value) : null;
}

export function mapRoomDTOToModel(dto: RoomDTO): RoomModel {
  return {
    id: dto.id,
    roomNumber: dto.roomNumber,
    roomTypeId: dto.roomTypeId,
    floor: dto.floor,
    status: ROOM_STATUS_FROM_DTO[dto.status],
    housekeepingStatus: dto.housekeepingStatus,
    notes: dto.notes ?? null,
    cleaningUserEmail: dto.cleaningUserEmail ?? null,
    cleaningStartedAt: toDateOrNull(dto.cleaningStartedAt),
    cleaningCompletedByUserEmail: dto.cleaningCompletedByUserEmail ?? null,
    cleaningCompletedAt: toDateOrNull(dto.cleaningCompletedAt),
    inspectorUserEmail: dto.inspectorUserEmail ?? null,
    inspectedAt: toDateOrNull(dto.inspectedAt),
    updatedAt: new Date(dto.updatedAt),
  };
}
