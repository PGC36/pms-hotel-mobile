import type { ServiceRequestDTO } from '../dtos/service-request.dto';
import type { ServiceRequestModel } from '../models/service-request.model';

export function mapServiceRequestDTOToModel(dto: ServiceRequestDTO): ServiceRequestModel {
  return {
    id: dto.id,
    roomId: dto.room_id,
    guestId: dto.guest_id,
    category: dto.category,
    assignedRole: dto.assigned_role,
    title: dto.title,
    description: dto.description,
    items: dto.items,
    preferredTime: dto.preferred_time,
    status: dto.status,
    rejectionReason: dto.rejection_reason,
    staffNotes: dto.staff_notes,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
  };
}
