import { apiClient } from '@/shared/services/api-client';
import type { NotificationDTO } from '../dtos/notification.dto';
import { mapNotificationDTOToModel } from '../mappers/notification.mapper';
import type { NotificationModel } from '../models/notification.model';

export class NotificationServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotificationServiceError';
  }
}

export async function fetchNotifications(): Promise<NotificationModel[]> {
  try {
    const data = await apiClient.get<NotificationDTO[]>('/guest/notifications');
    return data.map(mapNotificationDTOToModel);
  } catch (error: any) {
    throw new NotificationServiceError('No se pudieron cargar las notificaciones.');
  }
}

export async function fetchUnreadCount(): Promise<number> {
  try {
    const data = await apiClient.get<{ unreadCount: number }>('/guest/notifications/unread-count');
    return data.unreadCount;
  } catch (error: any) {
    throw new NotificationServiceError('No se pudo cargar el conteo de notificaciones.');
  }
}

export async function markNotificationRead(id: string): Promise<NotificationModel> {
  try {
    const data = await apiClient.post<NotificationDTO>(`/guest/notifications/${id}/read`);
    return mapNotificationDTOToModel(data);
  } catch (error: any) {
    throw new NotificationServiceError('No se pudo marcar la notificación como leída.');
  }
}

export async function markAllNotificationsRead(): Promise<NotificationModel[]> {
  try {
    const data = await apiClient.post<NotificationDTO[]>('/guest/notifications/read-all');
    return data.map(mapNotificationDTOToModel);
  } catch (error: any) {
    throw new NotificationServiceError('No se pudieron marcar todas las notificaciones como leídas.');
  }
}
