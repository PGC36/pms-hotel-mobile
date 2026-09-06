import type { RoomStatus } from '@/shared/constants/statuses';
import type { RoomType } from '../dtos/room.dto';

export interface RoomModel {
  id: string;
  number: string;
  floor: number;
  type: RoomType;
  status: RoomStatus;
  capacity: number;
  pricePerNight: number;
  description: string;
  imageUrl: string;
  isActive: boolean;
}
