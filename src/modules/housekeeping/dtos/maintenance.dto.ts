export interface MaintenanceDTO {
  id: string;
  roomId: string;
  roomNumber: string;
  responsibleUserEmail: string | null;
  type: 'maintenance';
  description: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
  notes: string | null;
  requestedAt: string;
  completedAt: string | null;
  updatedAt: string;
}
