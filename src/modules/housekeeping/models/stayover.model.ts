export interface StayoverModel {
  id: string;
  bookingId: string;
  roomId: string;
  roomNumber: string;
  status: 'pending' | 'inProgress' | 'completed' | 'cancelled' | 'rejected';
  description: string;
  notes: string | null;
  responsibleUserEmail: string | null;
  startedByUserEmail: string | null;
  completedByUserEmail: string | null;
  requestedAt: Date;
  completedAt: Date | null;
  updatedAt: Date;
}
