import { apiClient } from '@/shared/services/api-client';
import type { AmenityDTO } from '../dtos/amenity.dto';
import { mapAmenityDTOToModel } from '../mappers/amenity.mapper';
import type { AmenityModel } from '../models/amenity.model';

export class AmenityServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AmenityServiceError';
  }
}

export async function fetchAmenities(): Promise<AmenityModel[]> {
  try {
    const data = await apiClient.get<AmenityDTO[]>('/guest/amenities');
    return data.map(mapAmenityDTOToModel);
  } catch (error: any) {
    throw new AmenityServiceError('No se pudieron cargar las amenidades.');
  }
}

export async function fetchAmenityById(id: string): Promise<AmenityModel> {
  try {
    const data = await apiClient.get<AmenityDTO>(`/guest/amenities/${id}`);
    return mapAmenityDTOToModel(data);
  } catch (error: any) {
    throw new AmenityServiceError('No se pudo cargar la amenidad.');
  }
}
