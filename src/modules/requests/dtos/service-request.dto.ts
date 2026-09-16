import type { StaffRole } from '@/shared/constants/roles';
import type { ServiceRequestStatus } from '@/shared/constants/statuses';

/**
 * Contrato oficial: docs/HANDOFF-MOVIL.md sección 3.10. La categoría propia
 * de móvil (`cleaning`/`items`/`concierge`) se reconcilia contra estos 4
 * literales — ver PROGRESO-CONTRATO.md para el mapeo campo por campo.
 */
export type ServiceRequestType = 'housekeeping' | 'concierge' | 'maintenance' | 'other';

export interface ServiceRequestItemDTO {
  name: string;
  quantity: number;
}

/**
 * Forma cruda de una solicitud (limpieza, artículos o conserjería), tal
 * como la expondría `GET /service-requests/:id`. Mismo patrón que `order`,
 * sin `items` de producto: viaja un `type` y una `description` libre.
 * Móvil opera esta entidad de punta a punta.
 */
export interface ServiceRequestDTO {
  id: string;
  booking_id: string;
  room_id: string;
  guest_id?: string;
  type: ServiceRequestType;
  description: string;
  status: ServiceRequestStatus;
  notes?: string;
  /**
   * FK a `charge` (sección 5.3 del handoff) — caso poco común (ej. un taxi
   * que cobra conserjería). Nada lo llena todavía, no inventar el
   * mecanismo desde móvil.
   */
  charge_id?: string;
  requested_at: string;
  created_at: string;
  updated_at: string;
  /**
   * Campos que el contrato no define para `service_request` (ver
   * PROGRESO-CONTRATO.md). Se conservan, no se borran sin coordinar.
   */
  assigned_role?: StaffRole;
  title?: string;
  items?: ServiceRequestItemDTO[];
  preferred_time?: string;
  rejection_reason?: string;
}
