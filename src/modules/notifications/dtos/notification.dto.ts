export const NOTIFICATION_TYPES = ['orderStatus', 'requestStatus', 'general'] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/** Forma cruda de una notificación, tal como la expondría `GET /notifications`. */
export interface NotificationDTO {
  id: string;
  guest_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_entity_id: string | null;
  is_read: boolean;
  created_at: string;
}
