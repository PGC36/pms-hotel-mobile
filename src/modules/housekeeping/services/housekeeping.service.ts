import { roomFeaturesDB, roomsDB, roomTypesDB } from '@/data/db';
import { ROOM_HOUSEKEEPING_STATUS_TRANSITIONS, type RoomHousekeepingStatus } from '@/shared/constants/statuses';
import { delay } from '@/shared/services/delay';
import { assertValidTransition } from '@/modules/tasks/services/task-transition.service';

import { mapRoomDTOToModel } from '../mappers/room.mapper';
import { mapRoomFeatureDTOToModel } from '../mappers/room-feature.mapper';
import { mapRoomTypeDTOToModel } from '../mappers/room-type.mapper';
import type { RoomModel } from '../models/room.model';
import type { RoomFeatureModel } from '../models/room-feature.model';
import type { RoomTypeModel } from '../models/room-type.model';

export class RoomNotFoundError extends Error {
  constructor(id: string) {
    super(`Habitación ${id} no encontrada.`);
    this.name = 'RoomNotFoundError';
  }
}

export async function getRooms(): Promise<RoomModel[]> {
  await delay();
  return roomsDB.map(mapRoomDTOToModel);
}

export async function getRoomById(id: string): Promise<RoomModel | null> {
  await delay();
  const found = roomsDB.find((room) => room.id === id);
  return found ? mapRoomDTOToModel(found) : null;
}

/**
 * Transiciona `housekeeping_status` (limpieza) — la única mitad de `room`
 * que móvil escribe. `status` (ocupación) es de solo lectura, la escribe la
 * web (docs/HANDOFF-MOVIL.md sección 3.1).
 */
export async function updateRoomHousekeepingStatus(
  id: string,
  nextStatus: RoomHousekeepingStatus,
): Promise<RoomModel> {
  await delay();

  const room = roomsDB.find((r) => r.id === id);
  if (!room) throw new RoomNotFoundError(id);

  assertValidTransition(
    ROOM_HOUSEKEEPING_STATUS_TRANSITIONS,
    room.housekeeping_status,
    nextStatus,
    'RoomHousekeeping',
  );
  room.housekeeping_status = nextStatus;

  return mapRoomDTOToModel(room);
}

export async function getRoomTypes(): Promise<RoomTypeModel[]> {
  await delay();
  return roomTypesDB.map(mapRoomTypeDTOToModel);
}

export async function getRoomTypeById(id: string): Promise<RoomTypeModel | null> {
  await delay();
  const found = roomTypesDB.find((roomType) => roomType.id === id);
  return found ? mapRoomTypeDTOToModel(found) : null;
}

export async function getRoomFeatures(): Promise<RoomFeatureModel[]> {
  await delay();
  return roomFeaturesDB.map(mapRoomFeatureDTOToModel);
}
