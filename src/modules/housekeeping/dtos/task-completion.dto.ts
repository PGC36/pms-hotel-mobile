/**
 * Quién completó una solicitud de Limpieza. MOCK (MOV-09): `ServiceRequestDTO`
 * no guarda el responsable y no hay endpoint de historial, así que este
 * registro propio de Housekeeping alimenta el historial del usuario en sesión
 * sin cambiar el contrato de `requests`.
 */
export interface HousekeepingTaskCompletionDTO {
  id: string;
  service_request_id: string;
  completed_by_user_id: string;
  completed_at: string;
}
