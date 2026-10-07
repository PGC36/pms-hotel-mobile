import type { NotificationDTO } from '../dtos/notification.dto';
import type { NotificationModel } from '../models/notification.model';

export function mapNotificationDTOToModel(dto: NotificationDTO): NotificationModel {
  return {
    id: dto.id,
    type: dto.type,
    title: dto.title,
    message: dto.message,
    resourceType: dto.resourceType,
    resourceId: dto.resourceId,
    isRead: dto.read,
    readAt: dto.readAt ? new Date(dto.readAt) : null,
    createdAt: new Date(dto.createdAt),
  };
}
