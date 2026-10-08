export interface HousekeepingChecklistItemModel {
  id: string;
  label: string;
  checked: boolean;
  position: number;
  notes: string | null;
}

export interface HousekeepingChecklistModel {
  id: string;
  serviceRequestId: string | null;
  roomId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  items: HousekeepingChecklistItemModel[];
}
