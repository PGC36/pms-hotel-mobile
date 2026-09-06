import type { GuestDTO } from '../dtos/guest.dto';
import type { GuestModel } from '../models/guest.model';

export function mapGuestDTOToModel(dto: GuestDTO): GuestModel {
  return {
    id: dto.id,
    fullName: dto.full_name,
    email: dto.email,
    phone: dto.phone,
    documentType: dto.document_type,
    documentNumber: dto.document_number,
    nationality: dto.nationality,
    createdAt: new Date(dto.created_at),
  };
}
