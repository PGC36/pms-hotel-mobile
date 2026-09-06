import type { RoomStatus } from '@/shared/constants/statuses';

export const ROOM_TYPES = ['single', 'double', 'suite', 'deluxe'] as const;

export type RoomType = (typeof ROOM_TYPES)[number];

/** Forma cruda de una habitación, tal como la expondría `GET /rooms/:id`. */
export interface RoomDTO {
  id: string;
  number: string;
  floor: number;
  type: RoomType;
  status: RoomStatus;
  capacity: number;
  price_per_night: number;
  description: string;
  image_url: string;
  is_active: boolean;
}
