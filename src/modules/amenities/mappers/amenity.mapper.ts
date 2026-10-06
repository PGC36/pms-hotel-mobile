import type { AmenityDTO } from '../dtos/amenity.dto';
import type { AmenityModel } from '../models/amenity.model';

export function mapAmenityDTOToModel(dto: AmenityDTO): AmenityModel {
  const openingTime = dto.opensAt.slice(0, 5);
  const closingTime = dto.closesAt.slice(0, 5);

  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    category: dto.category,
    location: dto.location,
    openingTime,
    closingTime,
    scheduleLabel: `${openingTime} - ${closingTime}`,
    isActive: dto.active,
  };
}
