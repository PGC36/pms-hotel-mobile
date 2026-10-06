import type { NotificationType } from '../dtos/notification.dto';

export interface NotificationModel {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  resourceType: string | null;
  resourceId: string | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
}
