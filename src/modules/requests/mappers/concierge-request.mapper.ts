import type { ConciergeRequestStatus } from '@/shared/constants/statuses';

import type { ConciergeRequestDTO, ConciergeRequestStatusDTO } from '../dtos/concierge-request.dto';
import type { ConciergeRequestModel } from '../models/concierge-request.model';

const CONCIERGE_REQUEST_STATUS_FROM_DTO: Record<ConciergeRequestStatusDTO, ConciergeRequestStatus> =
  {
    pending: 'pending',
    accepted: 'accepted',
    in_progress: 'inProgress',
    completed: 'completed',
    rejected: 'rejected',
    cancelled: 'cancelled',
  };

const CONCIERGE_REQUEST_STATUS_TO_DTO: Record<ConciergeRequestStatus, ConciergeRequestStatusDTO> = {
  pending: 'pending',
  accepted: 'accepted',
  inProgress: 'in_progress',
  completed: 'completed',
  rejected: 'rejected',
  cancelled: 'cancelled',
};

export function mapConciergeRequestStatusDTOToModel(
  status: ConciergeRequestStatusDTO,
): ConciergeRequestStatus {
  return CONCIERGE_REQUEST_STATUS_FROM_DTO[status];
}

/** Para el body de `POST .../{requestId}/status` y el filtro `?status=`. */
export function mapConciergeRequestStatusToDTO(
  status: ConciergeRequestStatus,
): ConciergeRequestStatusDTO {
  return CONCIERGE_REQUEST_STATUS_TO_DTO[status];
}

export function mapConciergeRequestDTOToModel(dto: ConciergeRequestDTO): ConciergeRequestModel {
  return {
    id: dto.id,
    bookingId: dto.bookingId,
    roomId: dto.roomId ?? null,
    roomNumber: dto.roomNumber ?? null,
    guestId: dto.guestId ?? null,
    guestName: dto.guestName ?? null,
    responsibleUserId: dto.responsibleUserId ?? null,
    responsibleUserName: dto.responsibleUserName ?? null,
    responsibleUserEmail: dto.responsibleUserEmail ?? null,
    type: dto.type,
    description: dto.description,
    status: mapConciergeRequestStatusDTOToModel(dto.status),
    notes: dto.notes ?? null,
    chargeId: dto.chargeId ?? null,
    requestedAt: new Date(dto.requestedAt),
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}
