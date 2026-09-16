import type { RoomTypeDTO } from '../dtos/room-type.dto';
import type { RoomTypeModel } from '../models/room-type.model';

export function mapRoomTypeDTOToModel(dto: RoomTypeDTO): RoomTypeModel {
  return {
    id: dto.id,
    code: dto.code,
    name: dto.name,
    description: dto.description,
    capacity: dto.capacity,
    bedConfiguration: dto.bed_configuration,
    roomFeatureIds: dto.room_feature_ids,
    active: dto.active,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
  };
}
