import type { StaffRole } from '@/shared/constants/roles';
import type { ServiceRequestStatus } from '@/shared/constants/statuses';
import type { ServiceRequestCategory } from '../dtos/service-request.dto';

export interface ServiceRequestItem {
  name: string;
  quantity: number;
}

export interface ServiceRequestModel {
  id: string;
  roomId: string;
  guestId: string;
  category: ServiceRequestCategory;
  assignedRole: StaffRole;
  title: string;
  description: string;
  items: ServiceRequestItem[] | null;
  preferredTime: string | null;
  status: ServiceRequestStatus;
  rejectionReason: string | null;
  staffNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
