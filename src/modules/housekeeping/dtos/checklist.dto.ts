export interface HousekeepingChecklistItemDTO {
  id: string;
  label: string;
  checked: boolean;
  position: number;
  notes: string | null;
}

export interface HousekeepingChecklistDTO {
  id: string;
  serviceRequestId: string | null;
  roomId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  items: HousekeepingChecklistItemDTO[];
}

export interface HousekeepingChecklistTemplateDTO {
  code: string;
  name: string;
  items: string[];
  updatedAt: string;
}
