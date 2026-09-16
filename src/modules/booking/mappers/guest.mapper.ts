import type { GuestDTO, GuestDocumentType as GuestDocumentTypeDto } from '../dtos/guest.dto';
import type { GuestModel, GuestDocumentType } from '../models/guest.model';

const DOCUMENT_TYPE_DTO_TO_MODEL: Record<GuestDocumentTypeDto, GuestDocumentType> = {
  passport: 'passport',
  national_id: 'nationalId',
  driver_license: 'driverLicense',
};

export function mapGuestDTOToModel(dto: GuestDTO): GuestModel {
  return {
    id: dto.id,
    firstName: dto.first_name,
    lastName: dto.last_name,
    email: dto.email,
    phone: dto.phone,
    nationality: dto.nationality,
    documentType: dto.document_type ? DOCUMENT_TYPE_DTO_TO_MODEL[dto.document_type] : undefined,
    documentNumber: dto.document_number,
    notes: dto.notes,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
  };
}
