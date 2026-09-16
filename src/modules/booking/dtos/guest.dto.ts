/**
 * Contrato oficial: docs/HANDOFF-MOVIL.md sección 3.4. El mapper traduce
 * `'national_id'` desde el documento guatemalteco (DPI); ver
 * DIAGNOSTICO-CONTRATO.md sección 4 — `'dpi'` no existe en el contrato de la
 * web, se anota como término local pendiente de coordinar.
 */
export type GuestDocumentType = 'passport' | 'national_id' | 'driver_license';

/** Forma cruda de un huésped (persona), tal como la expondría `GET /guests/:id`. */
export interface GuestDTO {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  nationality?: string;
  document_type?: GuestDocumentType;
  document_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
