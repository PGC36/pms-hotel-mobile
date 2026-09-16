import type { AmenityDTO } from '../dtos/amenity.dto';
import type { AmenityModel } from '../models/amenity.model';

function buildScheduleLabel(opensAt?: string, closesAt?: string): string {
  if (!opensAt || !closesAt) return 'Abierto las 24 horas';
  return `${opensAt} – ${closesAt}`;
}

export function mapAmenityDTOToModel(dto: AmenityDTO): AmenityModel {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    category: dto.category,
    location: dto.location,
    opensAt: dto.opens_at,
    closesAt: dto.closes_at,
    scheduleLabel: buildScheduleLabel(dto.opens_at, dto.closes_at),
    active: dto.active,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
    imageUrl: dto.image_url,
  };
}
