export type GuestDocumentType = 'dpi' | 'passport';

/** Forma cruda de un huésped (persona), tal como la expondría `GET /guests/:id`. */
export interface GuestDTO {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  document_type: GuestDocumentType;
  document_number: string;
  nationality: string;
  created_at: string;
}
