import { canTransitionConciergeRequest } from '@/modules/tasks/services/task-transition.service';
import type { ConciergeRequestStatus } from '@/shared/constants/statuses';
import { apiClient } from '@/shared/services/api-client';

import type {
  ConciergeRequestDTO,
  CreateConciergeRequestDTO,
  UpdateConciergeRequestDTO,
  UpdateConciergeRequestStatusDTO,
} from '../dtos/concierge-request.dto';
import {
  mapConciergeRequestDTOToModel,
  mapConciergeRequestStatusToDTO,
} from '../mappers/concierge-request.mapper';
import {
  buildConciergeRejectionNote,
  type ConciergeRequestModel,
} from '../models/concierge-request.model';
import { callConciergeApi, ConciergeRequestServiceError } from './concierge-request-error';

/**
 * Solicitudes de conserjería contra la API real (`ConciergeRequestController`,
 * backend `b127535`, MOV-11). El backend es la autoridad: valida la reserva
 * (`confirmed`/`checked_in`), las transiciones y la edición, asigna el
 * responsable y nunca crea cargos. Este servicio solo traduce entre la
 * pantalla y la API.
 */

const BASE_PATH = '/concierge/requests';

function requestPath(id: string): string {
  return `${BASE_PATH}/${encodeURIComponent(id)}`;
}

function invalidInput(message: string): ConciergeRequestServiceError {
  return new ConciergeRequestServiceError('invalidInput', undefined, message);
}

export interface ConciergeRequestFilters {
  bookingId?: string;
  status?: ConciergeRequestStatus;
}

/** `GET /concierge/requests`. Orden del backend: de la más antigua a la más reciente. */
export async function listConciergeRequests(
  filters: ConciergeRequestFilters = {},
): Promise<ConciergeRequestModel[]> {
  const params = new URLSearchParams();
  if (filters.bookingId) params.set('bookingId', filters.bookingId);
  if (filters.status) params.set('status', mapConciergeRequestStatusToDTO(filters.status));
  const query = params.toString();

  const requests = await callConciergeApi(() =>
    apiClient.get<ConciergeRequestDTO[] | undefined>(`${BASE_PATH}${query ? `?${query}` : ''}`),
  );
  return (requests ?? []).map(mapConciergeRequestDTOToModel);
}

/** `GET /concierge/requests/{id}`. `null` si no existe (404). */
export async function getConciergeRequest(id: string): Promise<ConciergeRequestModel | null> {
  try {
    const request = await callConciergeApi(() =>
      apiClient.get<ConciergeRequestDTO | undefined>(requestPath(id)),
    );
    return request ? mapConciergeRequestDTOToModel(request) : null;
  } catch (error) {
    if (error instanceof ConciergeRequestServiceError && error.kind === 'notFound') return null;
    throw error;
  }
}

/** Si el backend respondiera sin cuerpo, se pide el detalle para no devolver un estado viejo. */
async function resolveResponse(
  id: string,
  dto: ConciergeRequestDTO | undefined,
): Promise<ConciergeRequestModel> {
  if (dto) return mapConciergeRequestDTOToModel(dto);
  const fresh = await getConciergeRequest(id);
  if (!fresh) throw new ConciergeRequestServiceError('notFound', 404);
  return fresh;
}

export interface CreateConciergeRequestInput {
  bookingId: string;
  description: string;
  notes?: string;
}

/**
 * `POST /concierge/requests`. Pertenece al contrato del dominio, pero el
 * personal no crea solicitudes desde su bandeja (MOV-11). La validez de la
 * reserva la decide el backend.
 */
export async function createConciergeRequest(
  input: CreateConciergeRequestInput,
): Promise<ConciergeRequestModel> {
  if (!input.description.trim()) throw invalidInput('Escribe la descripción de la solicitud.');
  const body: CreateConciergeRequestDTO = {
    bookingId: input.bookingId,
    description: input.description,
  };
  if (input.notes !== undefined) body.notes = input.notes;

  const created = await callConciergeApi(() =>
    apiClient.post<ConciergeRequestDTO | undefined>(BASE_PATH, body),
  );
  if (!created) throw new ConciergeRequestServiceError('unknown');
  return mapConciergeRequestDTOToModel(created);
}

export interface UpdateConciergeRequestStatusOptions {
  /** Si se omite, el backend asigna al usuario autenticado al aceptar, iniciar o completar. */
  responsibleUserId?: string;
  /** Se AGREGA al final de las observaciones existentes (no las reemplaza). */
  notes?: string;
}

/**
 * `POST /concierge/requests/{id}/status`. Recibe la solicitud tal como la
 * conoce la pantalla para no enviar transiciones obviamente inválidas
 * (`CONCIERGE_REQUEST_STATUS_TRANSITIONS`); si cambió en el servidor, el
 * backend la rechaza (400).
 */
export async function updateConciergeRequestStatus(
  request: ConciergeRequestModel,
  nextStatus: ConciergeRequestStatus,
  options: UpdateConciergeRequestStatusOptions = {},
): Promise<ConciergeRequestModel> {
  if (!canTransitionConciergeRequest(request.status, nextStatus)) {
    throw new ConciergeRequestServiceError('invalidTransition');
  }
  const body: UpdateConciergeRequestStatusDTO = {
    status: mapConciergeRequestStatusToDTO(nextStatus),
  };
  if (options.responsibleUserId !== undefined) body.responsibleUserId = options.responsibleUserId;
  if (options.notes !== undefined) body.notes = options.notes;

  const updated = await callConciergeApi(() =>
    apiClient.post<ConciergeRequestDTO | undefined>(`${requestPath(request.id)}/status`, body),
  );
  return resolveResponse(request.id, updated);
}

/**
 * Rechazo (solo desde `pending`): el motivo es obligatorio y viaja como una
 * línea `Motivo de rechazo: …` en `notes`, que el backend agrega a las
 * observaciones existentes.
 */
export function rejectConciergeRequest(
  request: ConciergeRequestModel,
  reason: string,
): Promise<ConciergeRequestModel> {
  const note = buildConciergeRejectionNote(reason);
  if (!note) return Promise.reject(invalidInput('Escribe el motivo del rechazo.'));
  return updateConciergeRequestStatus(request, 'rejected', { notes: note });
}

export interface UpdateConciergeRequestInput {
  /** Solo en `pending` (lo valida el backend). */
  description?: string;
  /** Reemplaza las observaciones; vacío las limpia. */
  notes?: string;
}

/**
 * `PUT /concierge/requests/{id}`: al menos un campo. El backend permite
 * `notes` en `pending`, `accepted` e `inProgress`, y `description` solo en
 * `pending`; una solicitud terminal responde 400.
 */
export async function updateConciergeRequest(
  id: string,
  input: UpdateConciergeRequestInput,
): Promise<ConciergeRequestModel> {
  if (input.description === undefined && input.notes === undefined) {
    throw invalidInput('No hay cambios para guardar.');
  }
  if (input.description !== undefined && !input.description.trim()) {
    throw invalidInput('La descripción no puede quedar vacía.');
  }
  const body: UpdateConciergeRequestDTO = {};
  if (input.description !== undefined) body.description = input.description;
  if (input.notes !== undefined) body.notes = input.notes;

  const updated = await callConciergeApi(() =>
    apiClient.put<ConciergeRequestDTO | undefined>(requestPath(id), body),
  );
  return resolveResponse(id, updated);
}

/**
 * Observaciones de atención (HU-08): REEMPLAZA el texto con `notes` tal como
 * llega (vacío las limpia, así que la pantalla debe confirmarlo antes). El
 * backend no define límite de longitud.
 */
export function updateConciergeRequestNotes(
  id: string,
  notes: string,
): Promise<ConciergeRequestModel> {
  return updateConciergeRequest(id, { notes });
}
