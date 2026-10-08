import { ApiConfigError, apiClient } from '@/shared/services/api-client';
import { HttpError } from '@/shared/services/http-client';

import type { RoomDTO } from '../dtos/room.dto';
import { mapRoomDTOToModel } from '../mappers/room.mapper';
import type { RoomModel } from '../models/room.model';

/**
 * Habitaciones contra la API real (`HousekeepingController`, MOV-09). El
 * backend es la autoridad sobre las transiciones de limpieza: este servicio
 * no las replica ni consulta el estado antes de cada acción; la pantalla solo
 * ofrece las acciones válidas según `ROOM_HOUSEKEEPING_STATUS_TRANSITIONS`, y
 * si el backend rechaza una (400) el error lo indica para recargar.
 */

export type HousekeepingErrorKind =
  'config' | 'unauthorized' | 'forbidden' | 'notFound' | 'rejected' | 'network' | 'unknown';

const ERROR_MESSAGES: Record<HousekeepingErrorKind, string> = {
  config: 'La URL del servidor no está configurada.',
  unauthorized: 'No hay una sesión autorizada con el servidor.',
  forbidden: 'No tienes permiso para realizar esta operación.',
  notFound: 'La habitación no existe.',
  rejected: 'El servidor rechazó la operación. Actualiza la habitación y vuelve a intentarlo.',
  network: 'No se pudo conectar con el servidor.',
  unknown: 'Ocurrió un error inesperado en el servidor. Intenta de nuevo.',
};

/** Error de este servicio, con un mensaje apto para mostrar y sin detalles del backend. */
export class HousekeepingServiceError extends Error {
  constructor(
    public readonly kind: HousekeepingErrorKind,
    /** Código HTTP, si el error vino de una respuesta del servidor. */
    public readonly status?: number,
  ) {
    super(ERROR_MESSAGES[kind]);
    this.name = 'HousekeepingServiceError';
  }
}

function getErrorKind(error: unknown): HousekeepingErrorKind {
  if (error instanceof ApiConfigError) return 'config';
  if (error instanceof HttpError) {
    if (error.status === 400 || error.status === 409) return 'rejected';
    if (error.status === 401) return 'unauthorized';
    if (error.status === 403) return 'forbidden';
    if (error.status === 404) return 'notFound';
    return 'unknown';
  }
  // `fetch` rechaza con TypeError cuando no hay conexión o el host no responde.
  if (error instanceof TypeError) return 'network';
  return 'unknown';
}

function toServiceError(error: unknown): HousekeepingServiceError {
  return new HousekeepingServiceError(
    getErrorKind(error),
    error instanceof HttpError ? error.status : undefined,
  );
}

/** Solo la llamada HTTP se traduce; un fallo del mapper no debe disfrazarse de error de red. */
async function call<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    throw toServiceError(error);
  }
}

export const callHousekeepingApi = call;

function roomPath(id: string): string {
  return `/housekeeping/rooms/${encodeURIComponent(id)}`;
}

export async function getRooms(): Promise<RoomModel[]> {
  const rooms = await call(() => apiClient.get<RoomDTO[] | undefined>('/housekeeping/rooms'));
  return (rooms ?? []).map(mapRoomDTOToModel);
}

/** `null` si la habitación no existe (404), igual que la versión mock anterior. */
export async function getRoomById(id: string): Promise<RoomModel | null> {
  try {
    const room = await call(() => apiClient.get<RoomDTO | undefined>(roomPath(id)));
    return room ? mapRoomDTOToModel(room) : null;
  } catch (error) {
    if (error instanceof HousekeepingServiceError && error.kind === 'notFound') return null;
    throw error;
  }
}

type RoomAction = 'start' | 'complete' | 'inspect';

/**
 * El backend responde a cada acción con la habitación actualizada. Si algún
 * día respondiera sin cuerpo (204), se pide el detalle para no devolver un
 * estado viejo.
 */
async function runRoomAction(id: string, action: RoomAction): Promise<RoomModel> {
  const updated = await call(() =>
    apiClient.post<RoomDTO | undefined>(`${roomPath(id)}/${action}`),
  );
  if (updated) return mapRoomDTOToModel(updated);

  const room = await getRoomById(id);
  if (!room) throw new HousekeepingServiceError('notFound', 404);
  return room;
}

/** dirty → cleaning (`POST /housekeeping/rooms/{roomId}/start`). */
export function startCleaning(id: string): Promise<RoomModel> {
  return runRoomAction(id, 'start');
}

/** cleaning → clean (`POST /housekeeping/rooms/{roomId}/complete`). */
export function completeCleaning(id: string): Promise<RoomModel> {
  return runRoomAction(id, 'complete');
}

/** clean → inspected (`POST /housekeeping/rooms/{roomId}/inspect`). */
export function inspectRoom(id: string): Promise<RoomModel> {
  return runRoomAction(id, 'inspect');
}
