import type { StayoverDTO } from '../dtos/stayover.dto';
import type { StayoverModel } from '../models/stayover.model';

export function mapStayoverDTOToModel(dto: StayoverDTO): StayoverModel {
  return {
    id: dto.id,
    bookingId: dto.bookingId,
    roomId: dto.roomId,
    roomNumber: dto.roomNumber,
    status: dto.status === 'in_progress' ? 'inProgress' : dto.status,
    description: dto.description,
    notes: dto.notes,
    responsibleUserEmail: dto.responsibleUserEmail,
    startedByUserEmail: dto.startedByUserEmail,
    completedByUserEmail: dto.completedByUserEmail,
    requestedAt: new Date(dto.requestedAt),
    completedAt: dto.completedAt ? new Date(dto.completedAt) : null,
    updatedAt: new Date(dto.updatedAt),
  };
}
