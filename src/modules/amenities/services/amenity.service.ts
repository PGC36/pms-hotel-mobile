import { apiClient } from '@/shared/services/api-client';
import { ApiConfigError } from '@/shared/services/api-config-error';
import { HttpError } from '@/shared/services/http-client';
import type { AmenityDTO } from '../dtos/amenity.dto';
import { mapAmenityDTOToModel } from '../mappers/amenity.mapper';
import type { AmenityModel } from '../models/amenity.model';

export class AmenityServiceError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'AmenityServiceError';
  }
}

function amenityError(error: unknown): AmenityServiceError {
  const status = error instanceof HttpError ? error.status : undefined;
  if (error instanceof ApiConfigError)
    return new AmenityServiceError('La URL del servidor no está configurada.');
  if (status === 401)
    return new AmenityServiceError('Tu sesión expiró. Inicia sesión nuevamente.', status);
  if (status === 403)
    return new AmenityServiceError('No tienes permiso para ver esta amenidad.', status);
  if (status === 404) return new AmenityServiceError('La amenidad ya no está disponible.', status);
  if (status === 409)
    return new AmenityServiceError('La amenidad cambió. Actualiza e intenta de nuevo.', status);
  if (error instanceof TypeError)
    return new AmenityServiceError('No se pudo conectar. Revisa tu conexión e intenta de nuevo.');
  return new AmenityServiceError('No se pudieron cargar las amenidades.', status);
}

export async function fetchAmenities(): Promise<AmenityModel[]> {
  try {
    const data = await apiClient.get<AmenityDTO[]>('/guest/amenities');
    return data.map(mapAmenityDTOToModel);
  } catch (error) {
    throw amenityError(error);
  }
}

export async function fetchAmenityById(id: string): Promise<AmenityModel> {
  try {
    const data = await apiClient.get<AmenityDTO>(`/guest/amenities/${id}`);
    return mapAmenityDTOToModel(data);
  } catch (error) {
    throw amenityError(error);
  }
}
