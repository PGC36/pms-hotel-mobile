import type { RoomDTO } from '../dtos/room.dto';
import type { RoomModel } from '../models/room.model';

export function mapRoomDTOToModel(dto: RoomDTO): RoomModel {
  return {
    id: dto.id,
    number: dto.number,
    floor: dto.floor,
    type: dto.type,
    status: dto.status,
    capacity: dto.capacity,
    pricePerNight: dto.price_per_night,
    description: dto.description,
    imageUrl: dto.image_url,
    isActive: dto.is_active,
  };
}
