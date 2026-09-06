import type { StaffRole } from '@/shared/constants/roles';
import type { ServiceRequestStatus } from '@/shared/constants/statuses';

export const SERVICE_REQUEST_CATEGORIES = ['cleaning', 'items', 'concierge'] as const;

export type ServiceRequestCategory = (typeof SERVICE_REQUEST_CATEGORIES)[number];

export interface ServiceRequestItemDTO {
  name: string;
  quantity: number;
}

/**
 * Forma cruda de una solicitud (limpieza, artículos o conserjería), tal como
 * la expondría `GET /service-requests/:id`. `items` solo se usa en la
 * categoría `items` (HU-15) y `preferred_time` solo en `cleaning` (HU-14).
 */
export interface ServiceRequestDTO {
  id: string;
  room_id: string;
  guest_id: string;
  category: ServiceRequestCategory;
  assigned_role: StaffRole;
  title: string;
  description: string;
  items: ServiceRequestItemDTO[] | null;
  preferred_time: string | null;
  status: ServiceRequestStatus;
  rejection_reason: string | null;
  staff_notes: string | null;
  created_at: string;
  updated_at: string;
}
