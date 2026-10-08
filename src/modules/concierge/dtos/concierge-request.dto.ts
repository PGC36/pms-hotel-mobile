export interface ConciergeRequestDTO {
  id: string;
  bookingId: string;
  roomId: string;
  roomNumber: string;
  guestName: string;
  responsibleUserEmail: string | null;
  completedByUserEmail?: string | null;
  type: 'concierge';
  description: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
  notes: string | null;
  requestedAt: string;
  updatedAt: string;
}
