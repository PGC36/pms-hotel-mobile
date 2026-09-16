import { isRoomAssignable } from '@/shared/constants/statuses';
import type { RoomDTO } from '../dtos/room.dto';
import type { RoomModel } from '../models/room.model';

export function mapRoomDTOToModel(dto: RoomDTO): RoomModel {
  return {
    id: dto.id,
    roomNumber: dto.room_number,
    roomTypeId: dto.room_type_id,
    floor: dto.floor,
    status: dto.status,
    housekeepingStatus: dto.housekeeping_status,
    isAssignable: isRoomAssignable(dto.status, dto.housekeeping_status),
    notes: dto.notes,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
    description: dto.description,
    imageUrl: dto.image_url,
    isActive: dto.is_active,
  };
}
