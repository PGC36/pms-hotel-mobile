import type { RoomHousekeepingStatus, RoomStatus } from '@/shared/constants/statuses';

export interface RoomModel {
  id: string;
  roomNumber: string;
  roomTypeId: string;
  floor: number;
  /** Ocupación. Solo lectura para Housekeeping. */
  status: RoomStatus;
  /** Limpieza: `dirty → cleaning → clean → inspected`. */
  housekeepingStatus: RoomHousekeepingStatus;
  notes: string | null;
  /** Trazabilidad del turnover: cada paso puede hacerlo una persona distinta. */
  cleaningUserEmail: string | null;
  cleaningStartedAt: Date | null;
  cleaningCompletedByUserEmail: string | null;
  cleaningCompletedAt: Date | null;
  inspectorUserEmail: string | null;
  inspectedAt: Date | null;
  updatedAt: Date;
}
