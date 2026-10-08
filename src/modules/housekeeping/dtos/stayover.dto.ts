export interface StayoverDTO {
  id: string;
  bookingId: string;
  roomId: string;
  roomNumber: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
  description: string;
  notes: string | null;
  responsibleUserEmail: string | null;
  startedByUserEmail: string | null;
  completedByUserEmail: string | null;
  requestedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
