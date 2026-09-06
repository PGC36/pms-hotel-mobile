import type { NotificationType } from '../dtos/notification.dto';

export interface NotificationModel {
  id: string;
  guestId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityId: string | null;
  isRead: boolean;
  createdAt: Date;
}
