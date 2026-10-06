export type GuestRequestType = 'housekeeping' | 'concierge';
export type GuestRequestStatus = 'pending' | 'accepted' | 'inProgress' | 'completed' | 'rejected' | 'cancelled';

export interface GuestRequestModel {
  id: string;
  type: GuestRequestType;
  title: string;
  description: string;
  status: GuestRequestStatus;
  roomNumber: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function mapGuestRequestStatus(status: string): GuestRequestStatus {
  if (status === 'in_progress') return 'inProgress';
  if (status === 'pending' || status === 'accepted' || status === 'completed' || status === 'rejected' || status === 'cancelled') {
    return status;
  }
  throw new Error(`Estado de solicitud desconocido: ${status}`);
}

export function canGuestCancelRequest(status: GuestRequestStatus): boolean {
  return status === 'pending' || status === 'accepted';
}
