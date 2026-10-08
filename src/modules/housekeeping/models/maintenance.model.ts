import type { ServiceRequestStatus } from '@/shared/constants/statuses';

export interface MaintenanceModel {
  id: string;
  roomId: string;
  roomNumber: string;
  responsibleUserEmail: string | null;
  completedByUserEmail: string | null;
  description: string;
  status: ServiceRequestStatus;
  notes: string | null;
  requestedAt: Date;
  completedAt: Date | null;
  updatedAt: Date;
}
