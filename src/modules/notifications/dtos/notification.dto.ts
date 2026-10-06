export const NOTIFICATION_TYPES = ['orderStatus', 'requestStatus', 'general'] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface NotificationDTO {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  resourceType: string | null;
  resourceId: string | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}
