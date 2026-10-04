import type { RoomHousekeepingStatus } from '@/shared/constants/statuses';

/** Ocupación tal como viaja en el wire (snake_case); el mapper la traduce a `RoomStatus`. */
export type RoomStatusDTO = 'available' | 'occupied' | 'maintenance' | 'out_of_service';

/**
 * Forma cruda de una habitación, tal como la devuelve
 * `GET /api/v1/housekeeping/rooms` y `GET /api/v1/housekeeping/rooms/{roomId}`
 * (y los POST `start`/`complete`/`inspect`). Este endpoint responde en
 * camelCase — a diferencia del resto de DTOs de `db.ts` — porque el DTO
 * refleja el wire real, no la convención interna (architecture.md sección 2).
 * No expone `createdAt`.
 */
export interface RoomDTO {
  id: string;
  roomNumber: string;
  roomTypeId: string;
  floor: number;
  /** Ocupación: la controla la web. Solo lectura para Housekeeping. */
  status: RoomStatusDTO;
  /** Limpieza: la transiciona Housekeeping. */
  housekeepingStatus: RoomHousekeepingStatus;
  notes?: string | null;
  cleaningUserEmail?: string | null;
  cleaningStartedAt?: string | null;
  cleaningCompletedByUserEmail?: string | null;
  cleaningCompletedAt?: string | null;
  inspectorUserEmail?: string | null;
  inspectedAt?: string | null;
  updatedAt: string;
}
