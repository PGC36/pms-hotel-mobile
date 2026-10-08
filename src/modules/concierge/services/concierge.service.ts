import {
  SERVICE_REQUEST_STATUS_TRANSITIONS,
  type ServiceRequestStatus,
} from '@/shared/constants/statuses';
import { apiClient, ApiConfigError } from '@/shared/services/api-client';
import { HttpError } from '@/shared/services/http-client';
import { assertValidTransition } from '@/modules/tasks/services/task-transition.service';

import type { ConciergeRequestDTO } from '../dtos/concierge-request.dto';
import { mapConciergeDTOToModel } from '../mappers/concierge-request.mapper';
import type { ConciergeRequestModel } from '../models/concierge-request.model';

const PATH = '/concierge/requests';

export class ConciergeServiceError extends Error {
  constructor(
    public readonly status: number | null,
    message: string,
  ) {
    super(message);
    this.name = 'ConciergeServiceError';
  }
}

async function call<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    if (error instanceof HttpError) {
      const messages: Record<number, string> = {
        400: 'La solicitud cambió o no permite esta operación. Recarga e intenta de nuevo.',
        401: 'La sesión expiró. Inicia sesión de nuevo.',
        403: 'No tienes permiso para ver o modificar esta solicitud.',
        404: 'La solicitud no existe.',
        409: 'La solicitud cambió. Recarga e intenta de nuevo.',
      };
      throw new ConciergeServiceError(
        error.status,
        messages[error.status] ?? 'No se pudo completar la operación.',
      );
    }
    if (error instanceof ApiConfigError)
      throw new ConciergeServiceError(null, 'La URL del servidor no está configurada.');
    if (error instanceof TypeError)
      throw new ConciergeServiceError(null, 'No se pudo conectar con el servidor.');
    throw error;
  }
}

export async function getConciergeRequests(): Promise<ConciergeRequestModel[]> {
  const data = await call(() => apiClient.get<ConciergeRequestDTO[]>(PATH));
  return (data ?? []).map(mapConciergeDTOToModel);
}

export async function getConciergeRequestById(id: string): Promise<ConciergeRequestModel | null> {
  try {
    const data = await call(() =>
      apiClient.get<ConciergeRequestDTO>(`${PATH}/${encodeURIComponent(id)}`),
    );
    return mapConciergeDTOToModel(data);
  } catch (error) {
    if (error instanceof ConciergeServiceError && error.status === 404) return null;
    throw error;
  }
}

export async function updateConciergeStatus(
  request: ConciergeRequestModel,
  status: ServiceRequestStatus,
  reason?: string,
): Promise<ConciergeRequestModel> {
  assertValidTransition(
    SERVICE_REQUEST_STATUS_TRANSITIONS,
    request.status,
    status,
    'ServiceRequest',
  );
  if (status === 'rejected' && !reason?.trim())
    throw new ConciergeServiceError(null, 'Indica el motivo del rechazo.');
  const data = await call(() =>
    apiClient.post<ConciergeRequestDTO>(`${PATH}/${encodeURIComponent(request.id)}/status`, {
      status: status === 'inProgress' ? 'in_progress' : status,
      notes: reason?.trim(),
    }),
  );
  return mapConciergeDTOToModel(data);
}
