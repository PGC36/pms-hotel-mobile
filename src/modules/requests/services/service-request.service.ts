import { serviceRequestsDB } from '@/data/db';
import {
  SERVICE_REQUEST_STATUS_TRANSITIONS,
  type ServiceRequestStatus,
} from '@/shared/constants/statuses';
import { delay } from '@/shared/services/delay';
import { assertValidTransition } from '@/modules/tasks/services/task-transition.service';

import { mapServiceRequestDTOToModel } from '../mappers/service-request.mapper';
import type { ServiceRequestModel } from '../models/service-request.model';

export class ServiceRequestNotFoundError extends Error {
  constructor(id: string) {
    super(`Solicitud ${id} no encontrada.`);
    this.name = 'ServiceRequestNotFoundError';
  }
}

export interface UpdateServiceRequestStatusOptions {
  /** Obligatorio cuando `nextStatus` es `rejected` (HU-05: rechazar con motivo). */
  rejectionReason?: string;
  staffNotes?: string;
}

export async function getServiceRequests(): Promise<ServiceRequestModel[]> {
  await delay();
  return serviceRequestsDB.map(mapServiceRequestDTOToModel);
}

/** MOV-11 (HU-09): solicitudes activas de una habitación. */
export async function getServiceRequestsByRoom(roomId: string): Promise<ServiceRequestModel[]> {
  await delay();
  return serviceRequestsDB
    .filter((request) => request.room_id === roomId)
    .map(mapServiceRequestDTOToModel);
}

export async function getServiceRequestById(id: string): Promise<ServiceRequestModel | null> {
  await delay();
  const found = serviceRequestsDB.find((request) => request.id === id);
  return found ? mapServiceRequestDTOToModel(found) : null;
}

/** Valida la transición contra `SERVICE_REQUEST_STATUS_TRANSITIONS` antes de aplicarla. */
export async function updateServiceRequestStatus(
  id: string,
  nextStatus: ServiceRequestStatus,
  options: UpdateServiceRequestStatusOptions = {},
): Promise<ServiceRequestModel> {
  await delay();

  const request = serviceRequestsDB.find((r) => r.id === id);
  if (!request) throw new ServiceRequestNotFoundError(id);

  assertValidTransition(
    SERVICE_REQUEST_STATUS_TRANSITIONS,
    request.status,
    nextStatus,
    'ServiceRequest',
  );

  if (nextStatus === 'rejected' && !options.rejectionReason) {
    throw new Error('Se requiere un motivo para rechazar la solicitud.');
  }

  request.status = nextStatus;
  request.updated_at = new Date().toISOString();
  if (options.rejectionReason) request.rejection_reason = options.rejectionReason;
  if (options.staffNotes) request.staff_notes = options.staffNotes;

  return mapServiceRequestDTOToModel(request);
}
