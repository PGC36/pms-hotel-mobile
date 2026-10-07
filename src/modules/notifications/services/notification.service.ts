import { apiClient } from '@/shared/services/api-client';
import { ApiConfigError } from '@/shared/services/api-config-error';
import { HttpError } from '@/shared/services/http-client';
import type { NotificationDTO } from '../dtos/notification.dto';
import { mapNotificationDTOToModel } from '../mappers/notification.mapper';
import type { NotificationModel } from '../models/notification.model';

export class NotificationServiceError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'NotificationServiceError';
  }
}

function notificationError(error: unknown, fallback: string): NotificationServiceError {
  const status = error instanceof HttpError ? error.status : undefined;
  if (error instanceof ApiConfigError) return new NotificationServiceError('La URL del servidor no está configurada.');
  if (status === 401) return new NotificationServiceError('Tu sesión expiró. Inicia sesión nuevamente.', status);
  if (status === 403) return new NotificationServiceError('No tienes permiso para acceder a estas notificaciones.', status);
  if (status === 404) return new NotificationServiceError('La notificación ya no está disponible.', status);
  if (status === 409) return new NotificationServiceError('Las notificaciones cambiaron. Actualiza e intenta de nuevo.', status);
  if (error instanceof TypeError) return new NotificationServiceError('No se pudo conectar. Revisa tu conexión e intenta de nuevo.');
  return new NotificationServiceError(fallback, status);
}

export async function fetchNotifications(): Promise<NotificationModel[]> {
  try {
    const data = await apiClient.get<NotificationDTO[]>('/guest/notifications');
    return data.map(mapNotificationDTOToModel);
  } catch (error) {
    throw notificationError(error, 'No se pudieron cargar las notificaciones.');
  }
}

export async function fetchUnreadCount(): Promise<number> {
  try {
    const data = await apiClient.get<{ unreadCount: number }>('/guest/notifications/unread-count');
    return data.unreadCount;
  } catch (error) {
    throw notificationError(error, 'No se pudo cargar el conteo de notificaciones.');
  }
}

export async function markNotificationRead(id: string): Promise<NotificationModel> {
  try {
    const data = await apiClient.post<NotificationDTO>(`/guest/notifications/${id}/read`);
    return mapNotificationDTOToModel(data);
  } catch (error) {
    throw notificationError(error, 'No se pudo marcar la notificación como leída.');
  }
}

export async function markAllNotificationsRead(): Promise<NotificationModel[]> {
  try {
    const data = await apiClient.post<NotificationDTO[]>('/guest/notifications/read-all');
    return data.map(mapNotificationDTOToModel);
  } catch (error) {
    throw notificationError(error, 'No se pudieron marcar todas las notificaciones como leídas.');
  }
}
