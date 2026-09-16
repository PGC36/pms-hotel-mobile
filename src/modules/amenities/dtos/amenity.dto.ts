/**
 * Taxonomía provisional — docs/HANDOFF-MOVIL.md sección 7.3 (D-005). Se
 * adoptan los literales actuales del contrato tal cual.
 */
export const AMENITY_CATEGORIES = ['room', 'hotel', 'service'] as const;

export type AmenityCategory = (typeof AMENITY_CATEGORIES)[number];

/**
 * Forma cruda de una amenidad, tal como la expondría `GET /amenities/:id`.
 * Contrato oficial: docs/HANDOFF-MOVIL.md sección 3.7. Móvil solo lee.
 * `opens_at`/`closes_at` ausentes significa servicio continuo (24h).
 */
export interface AmenityDTO {
  id: string;
  name: string;
  description?: string;
  category: AmenityCategory;
  location?: string;
  opens_at?: string;
  closes_at?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  /** Campo que el contrato no define — se conserva, ver PROGRESO-CONTRATO.md. */
  image_url?: string;
}
