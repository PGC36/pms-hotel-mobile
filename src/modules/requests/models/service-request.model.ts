import type { StaffRole } from '@/shared/constants/roles';
import type { ServiceRequestStatus } from '@/shared/constants/statuses';
import type { ServiceRequestType } from '../dtos/service-request.dto';

export interface ServiceRequestItem {
  name: string;
  quantity: number;
}

export interface ServiceRequestModel {
  id: string;
  bookingId: string;
  roomId: string;
  guestId?: string;
  type: ServiceRequestType;
  description: string;
  status: ServiceRequestStatus;
  notes?: string;
  chargeId?: string;
  requestedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  assignedRole?: StaffRole;
  title?: string;
  items?: ServiceRequestItem[];
  preferredTime?: string;
  rejectionReason?: string;
}
