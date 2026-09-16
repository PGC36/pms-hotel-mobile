import type { RoomHousekeepingStatus, RoomStatus } from '@/shared/constants/statuses';

/**
 * Forma cruda de una habitación, tal como la expondría `GET /rooms/:id`.
 * Contrato oficial: docs/HANDOFF-MOVIL.md sección 3.1. `status` (ocupación)
 * la escribe la web — móvil solo lee. `housekeeping_status` (limpieza) la
 * escribe móvil. Tipo de habitación y tarifa no viven aquí: `room_type_id`
 * referencia `room-type`; la tarifa por noche es de `rate`, exclusiva de la
 * web y fuera del alcance de móvil.
 */
export interface RoomDTO {
  id: string;
  room_number: string;
  room_type_id: string;
  floor: number;
  status: RoomStatus;
  housekeeping_status: RoomHousekeepingStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  /**
   * Campos que el contrato oficial no define para `room` (ver
   * PROGRESO-CONTRATO.md, sección "campos exclusivos de móvil"). Se
   * conservan porque ya hay datos reales y podrían usarlos las pantallas de
   * MOV-09+; no se borran sin coordinar con el equipo.
   */
  description?: string;
  image_url?: string;
  is_active?: boolean;
}
