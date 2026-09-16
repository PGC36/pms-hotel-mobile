export type GuestDocumentType = 'passport' | 'nationalId' | 'driverLicense';

export interface GuestModel {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  nationality?: string;
  documentType?: GuestDocumentType;
  documentNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
