import type { RoomHousekeepingStatus, RoomStatus } from '@/shared/constants/statuses';

export interface RoomModel {
  id: string;
  roomNumber: string;
  roomTypeId: string;
  floor: number;
  status: RoomStatus;
  housekeepingStatus: RoomHousekeepingStatus;
  /** Calculado por el mapper — nunca reimplementar esta comparación (`isRoomAssignable`). */
  isAssignable: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}
