import type { ServiceRequestDTO } from '../dtos/service-request.dto';
import type { ServiceRequestModel } from '../models/service-request.model';

export function mapServiceRequestDTOToModel(dto: ServiceRequestDTO): ServiceRequestModel {
  return {
    id: dto.id,
    bookingId: dto.booking_id,
    roomId: dto.room_id,
    guestId: dto.guest_id,
    type: dto.type,
    description: dto.description,
    status: dto.status,
    notes: dto.notes,
    chargeId: dto.charge_id,
    requestedAt: new Date(dto.requested_at),
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
    assignedRole: dto.assigned_role,
    title: dto.title,
    items: dto.items,
    preferredTime: dto.preferred_time,
    rejectionReason: dto.rejection_reason,
  };
}
