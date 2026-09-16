/**
 * Forma cruda de una característica de habitación (aire acondicionado,
 * balcón...), tal como la expondría `GET /room-features/:id`. Entidad
 * distinta de `amenity` — nunca la referencia `room` directamente, solo
 * `room-type.room_feature_ids`. Contrato oficial: docs/HANDOFF-MOVIL.md
 * sección 3.3. Móvil solo lee esta entidad.
 */
export interface RoomFeatureDTO {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}
