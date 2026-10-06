export type NotificationType = string;

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
