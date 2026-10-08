import { ApiConfigError } from '@/shared/services/api-config-error';
import { HttpError } from '@/shared/services/http-client';
import { apiClient } from '@/shared/services/api-client';

import { mapGuestRequestStatus, type GuestRequestModel, type GuestRequestStatus, type GuestRequestType } from '../models/guest-request.model';

interface HousekeepingRequestDTO {
  id: string;
  roomNumber: string;
  status: string;
  description: string;
  notes: string | null;
  requestedAt: string;
  updatedAt: string;
}

interface ConciergeRequestDTO {
  id: string;
  roomNumber: string;
  type: string;
  description: string;
  status: string;
  notes: string | null;
  requestedAt: string;
  updatedAt: string;
}

interface HousekeepingItemRequestDTO {
  id: string;
  roomNumber: string;
  status: string;
  description: string;
  notes: string | null;
  requestedAt: string;
  updatedAt: string;
}

export interface HousekeepingItemOption {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  currentQuantity: number;
}

export interface ConciergeServiceOption {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
}

export class GuestRequestError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'GuestRequestError';
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiConfigError) return 'La URL del servidor no está configurada.';
  if (error instanceof HttpError) {
    if (error.status === 401) return 'Tu sesión expiró. Inicia sesión nuevamente.';
    if (error.status === 403) return 'No tienes permiso para consultar esta solicitud.';
    if (error.status === 404) return 'La solicitud ya no está disponible.';
    if (error.status === 409) return 'La solicitud cambió. Actualiza la lista e intenta de nuevo.';
    return 'El servidor no pudo completar la solicitud.';
  }
  if (error instanceof TypeError) return 'No se pudo conectar. Revisa tu conexión e intenta de nuevo.';
  return 'Ocurrió un error inesperado. Intenta de nuevo.';
}

async function request<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw new GuestRequestError(
      getErrorMessage(error),
      error instanceof HttpError ? error.status : undefined,
    );
  }
}

function mapHousekeeping(dto: HousekeepingRequestDTO): GuestRequestModel {
  return {
    id: dto.id,
    type: 'housekeeping',
    title: 'Limpieza y artículos',
    description: dto.description,
    status: mapGuestRequestStatus(dto.status),
    roomNumber: dto.roomNumber ?? null,
    notes: dto.notes ?? null,
    createdAt: new Date(dto.requestedAt),
    updatedAt: new Date(dto.updatedAt),
  };
}

function mapConcierge(dto: ConciergeRequestDTO): GuestRequestModel {
  return {
    id: dto.id,
    type: 'concierge',
    title: dto.type === 'tour' ? 'Tour' : dto.type === 'transport' ? 'Transporte' : 'Conserjería',
    description: dto.description,
    status: mapGuestRequestStatus(dto.status),
    roomNumber: dto.roomNumber ?? null,
    notes: dto.notes ?? null,
    createdAt: new Date(dto.requestedAt),
    updatedAt: new Date(dto.updatedAt),
  };
}

export async function getGuestRequests(): Promise<GuestRequestModel[]> {
  const [housekeeping, concierge] = await Promise.all([
    request(() => apiClient.get<HousekeepingRequestDTO[]>('/guest/housekeeping/requests')),
    request(() => apiClient.get<ConciergeRequestDTO[]>('/guest/concierge/requests')),
  ]);
  return [...housekeeping.map(mapHousekeeping), ...concierge.map(mapConcierge)].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
}

export async function getGuestConciergeServices(): Promise<ConciergeServiceOption[]> {
  return request(() => apiClient.get<ConciergeServiceOption[]>('/guest/concierge/services'));
}

export async function getGuestHousekeepingItems(): Promise<HousekeepingItemOption[]> {
  return request(() => apiClient.get<HousekeepingItemOption[]>('/guest/housekeeping/items'));
}

export async function createGuestHousekeepingItemRequest(
  itemId: string,
  quantity: number,
  notes?: string,
): Promise<GuestRequestModel> {
  const dto = await request(() =>
    apiClient.post<HousekeepingItemRequestDTO>('/guest/housekeeping/item-requests', {
      itemId,
      quantity,
      notes: notes?.trim() || null,
    }),
  );
  return mapHousekeeping(dto);
}

export async function getGuestRequest(id: string, type: GuestRequestType): Promise<GuestRequestModel> {
  if (type === 'housekeeping') {
    const requests = await request(() => apiClient.get<HousekeepingRequestDTO[]>('/guest/housekeeping/requests'));
    const found = requests.find((item) => item.id === id);
    if (!found) throw new GuestRequestError('La solicitud ya no está disponible.', 404);
    return mapHousekeeping(found);
  }
  const dto = await request(() =>
    apiClient.get<ConciergeRequestDTO>(`/guest/concierge/requests/${encodeURIComponent(id)}`),
  );
  return mapConcierge(dto);
}

export async function createGuestRequest(
  type: GuestRequestType,
  description: string,
  notes?: string,
  serviceId?: string,
): Promise<GuestRequestModel> {
  const body = type === 'concierge'
    ? { description: description.trim(), notes: notes?.trim() || null, serviceId }
    : { description: description.trim() };
  const path = type === 'housekeeping' ? '/guest/housekeeping/requests' : '/guest/concierge/requests';
  const dto = await request(() =>
    apiClient.post<HousekeepingRequestDTO | ConciergeRequestDTO>(path, body),
  );
  return type === 'housekeeping'
    ? mapHousekeeping(dto as HousekeepingRequestDTO)
    : mapConcierge(dto as ConciergeRequestDTO);
}

export async function cancelGuestRequest(
  requestId: string,
  type: GuestRequestType,
  currentStatus: GuestRequestStatus,
): Promise<GuestRequestModel> {
  if (currentStatus !== 'pending' && currentStatus !== 'accepted') {
    throw new GuestRequestError('Solo puedes cancelar solicitudes pendientes o aceptadas.');
  }
  const path = type === 'housekeeping' ? 'housekeeping' : 'concierge';
  const dto = await request(() =>
    apiClient.post<HousekeepingRequestDTO | ConciergeRequestDTO>(
      `/guest/${path}/requests/${encodeURIComponent(requestId)}/cancel`,
    ),
  );
  return type === 'housekeeping'
    ? mapHousekeeping(dto as HousekeepingRequestDTO)
    : mapConcierge(dto as ConciergeRequestDTO);
}
