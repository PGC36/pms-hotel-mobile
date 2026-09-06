import type { NotificationDTO } from '../dtos/notification.dto';
import type { NotificationModel } from '../models/notification.model';

export function mapNotificationDTOToModel(dto: NotificationDTO): NotificationModel {
  return {
    id: dto.id,
    guestId: dto.guest_id,
    type: dto.type,
    title: dto.title,
    message: dto.message,
    relatedEntityId: dto.related_entity_id,
    isRead: dto.is_read,
    createdAt: new Date(dto.created_at),
  };
}
