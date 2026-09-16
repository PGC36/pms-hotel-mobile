/**
 * Forma cruda de un tipo de habitación, tal como la expondría
 * `GET /room-types/:id`. Contrato oficial: docs/HANDOFF-MOVIL.md sección 3.2.
 * Móvil solo lee esta entidad.
 */
export interface RoomTypeDTO {
  id: string;
  code: string;
  name: string;
  description?: string;
  capacity: number;
  bed_configuration: string;
  room_feature_ids: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}
