/** Estado tal como viaja en el wire (snake_case); el mapper lo traduce a `ConciergeRequestStatus`. */
export type ConciergeRequestStatusDTO =
  'pending' | 'accepted' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';

/** `ServiceRequestType` del backend. Conserjería siempre responde `concierge`. */
export type ServiceRequestTypeDTO = 'housekeeping' | 'concierge' | 'maintenance' | 'other';

/**
 * Forma cruda de una solicitud de conserjería, tal como la devuelven
 * `GET /api/v1/concierge/requests`, `GET .../{requestId}`, `POST`,
 * `POST .../{requestId}/status` y `PUT .../{requestId}`
 * (`ConciergeRequestResponse` del backend, en camelCase). Contrato propio de
 * MOV-11: no reemplaza a `ServiceRequestDTO`, que sigue siendo el mock de
 * Limpieza (MOV-09).
 */
export interface ConciergeRequestDTO {
  id: string;
  bookingId: string;
  /** `null` si la reserva no tiene habitación asignada. */
  roomId: string | null;
  roomNumber: string | null;
  guestId: string | null;
  guestName: string | null;
  /** Lo asigna el backend al aceptar/iniciar/completar (o por `responsibleUserId`). */
  responsibleUserId: string | null;
  responsibleUserName: string | null;
  responsibleUserEmail: string | null;
  type: ServiceRequestTypeDTO;
  description: string;
  status: ConciergeRequestStatusDTO;
  notes: string | null;
  /** El módulo de conserjería no crea cargos: en la práctica siempre `null`. */
  chargeId: string | null;
  requestedAt: string;
  createdAt: string;
  updatedAt: string;
}

/** Body de `POST /api/v1/concierge/requests` (`CreateConciergeRequestRequest`). */
export interface CreateConciergeRequestDTO {
  bookingId: string;
  /** Obligatoria y no vacía. */
  description: string;
  notes?: string;
}

/**
 * Body de `POST /api/v1/concierge/requests/{requestId}/status`
 * (`UpdateConciergeRequestStatusRequest`). `notes` se AGREGA al final de las
 * observaciones existentes; sin `responsibleUserId`, el backend asigna al
 * usuario autenticado al aceptar, iniciar o completar.
 */
export interface UpdateConciergeRequestStatusDTO {
  status: ConciergeRequestStatusDTO;
  responsibleUserId?: string;
  notes?: string;
}

/**
 * Body de `PUT /api/v1/concierge/requests/{requestId}`
 * (`UpdateConciergeRequestRequest`): al menos un campo. `notes` REEMPLAZA las
 * observaciones (vacío las limpia) mientras no sea terminal; `description`
 * solo en `pending`.
 */
export interface UpdateConciergeRequestDTO {
  description?: string;
  notes?: string;
}
