import type { RoomFeatureDTO } from '../dtos/room-feature.dto';
import type { RoomFeatureModel } from '../models/room-feature.model';

export function mapRoomFeatureDTOToModel(dto: RoomFeatureDTO): RoomFeatureModel {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
  };
}
