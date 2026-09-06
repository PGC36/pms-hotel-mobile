import type { AmenityDTO } from '../dtos/amenity.dto';
import type { AmenityModel } from '../models/amenity.model';

export function mapAmenityDTOToModel(dto: AmenityDTO): AmenityModel {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    category: dto.category,
    location: dto.location,
    openingTime: dto.opening_time,
    closingTime: dto.closing_time,
    scheduleLabel: `${dto.opening_time} – ${dto.closing_time}`,
    imageUrl: dto.image_url,
    isActive: dto.is_active,
  };
}
