import type { TaskModel } from '@/modules/tasks/models/task.model';

import type { ConciergeRequestDTO } from '../dtos/concierge-request.dto';
import type { ConciergeRequestModel } from '../models/concierge-request.model';

export function mapConciergeDTOToModel(dto: ConciergeRequestDTO): ConciergeRequestModel {
  return {
    id: dto.id,
    bookingId: dto.bookingId,
    roomId: dto.roomId,
    roomNumber: dto.roomNumber,
    guestName: dto.guestName,
    responsibleUserEmail: dto.responsibleUserEmail,
    description: dto.description,
    status: dto.status === 'in_progress' ? 'inProgress' : dto.status,
    notes: dto.notes,
    requestedAt: new Date(dto.requestedAt),
    updatedAt: new Date(dto.updatedAt),
  };
}

export function mapConciergeToTask(request: ConciergeRequestModel): TaskModel {
  return {
    id: request.id,
    entityType: 'serviceRequest',
    title: request.description,
    description: request.guestName,
    roomLabel: `Habitación ${request.roomNumber}`,
    meta: request.responsibleUserEmail ? `Responsable: ${request.responsibleUserEmail}` : undefined,
    notes: request.notes ?? undefined,
    status: request.status,
    createdAt: request.requestedAt,
    updatedAt: request.updatedAt,
  };
}
