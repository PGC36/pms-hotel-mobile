import type { MaintenanceDTO } from '../dtos/maintenance.dto';
import type { MaintenanceModel } from '../models/maintenance.model';

export function mapMaintenanceDTOToModel(dto: MaintenanceDTO): MaintenanceModel {
  return {
    id: dto.id,
    roomId: dto.roomId,
    roomNumber: dto.roomNumber,
    responsibleUserEmail: dto.responsibleUserEmail,
    description: dto.description,
    status: dto.status === 'in_progress' ? 'inProgress' : dto.status,
    notes: dto.notes,
    requestedAt: new Date(dto.requestedAt),
    completedAt: dto.completedAt ? new Date(dto.completedAt) : null,
    updatedAt: new Date(dto.updatedAt),
  };
}
