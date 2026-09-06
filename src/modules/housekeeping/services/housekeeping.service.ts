import { roomsDB } from '@/data/db';
import { ROOM_STATUS_TRANSITIONS, type RoomStatus } from '@/shared/constants/statuses';
import { delay } from '@/shared/services/delay';
import { assertValidTransition } from '@/modules/tasks/services/task-transition.service';

import { mapRoomDTOToModel } from '../mappers/room.mapper';
import type { RoomModel } from '../models/room.model';

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

/** Valida la transición contra `ROOM_STATUS_TRANSITIONS` antes de aplicarla. */
export async function updateRoomStatus(id: string, nextStatus: RoomStatus): Promise<RoomModel> {
  await delay();

  const room = roomsDB.find((r) => r.id === id);
  if (!room) throw new RoomNotFoundError(id);

  assertValidTransition(ROOM_STATUS_TRANSITIONS, room.status, nextStatus, 'Room');
  room.status = nextStatus;

  return mapRoomDTOToModel(room);
}
