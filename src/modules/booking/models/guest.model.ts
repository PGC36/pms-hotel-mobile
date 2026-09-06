import type { GuestDocumentType } from '../dtos/guest.dto';

export interface GuestModel {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  documentType: GuestDocumentType;
  documentNumber: string;
  nationality: string;
  createdAt: Date;
}
