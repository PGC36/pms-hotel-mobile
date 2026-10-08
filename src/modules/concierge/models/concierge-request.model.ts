import type { ServiceRequestStatus } from '@/shared/constants/statuses';

export interface ConciergeRequestModel {
  id: string;
  bookingId: string;
  roomId: string;
  roomNumber: string;
  guestName: string;
  responsibleUserEmail: string | null;
  completedByUserEmail: string | null;
  description: string;
  status: ServiceRequestStatus;
  notes: string | null;
  requestedAt: Date;
  updatedAt: Date;
}
