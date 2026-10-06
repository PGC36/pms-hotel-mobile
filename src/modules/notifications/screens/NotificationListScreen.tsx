import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { colors, spacing, typography } from '@/shared/theme';
import { formatElapsedTime } from '@/shared/utils/date';

import type { NotificationModel } from '../models/notification.model';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notification.service';

export function NotificationListScreen({ onUnreadCountChange }: { onUnreadCountChange: (count: number) => void }) {
  const [notifications, setNotifications] = useState<NotificationModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [data, unreadCount] = await Promise.all([fetchNotifications(), fetchUnreadCount()]);
      setNotifications(data);
      onUnreadCountChange(unreadCount);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar las notificaciones.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [onUnreadCountChange]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const markRead = async (id: string) => {
    setActionError(null);
    try {
      const updated = await markNotificationRead(id);
      setNotifications((current) => current.map((item) => item.id === id ? updated : item));
      onUnreadCountChange(await fetchUnreadCount());
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'No se pudo actualizar la notificación.');
    }
  };

  const markAllRead = async () => {
    setIsLoading(true);
    setActionError(null);
    try {
      setNotifications(await markAllNotificationsRead());
      onUnreadCountChange(0);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'No se pudieron actualizar las notificaciones.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && notifications.length === 0) return <LoadingState message="Cargando notificaciones..." />;
  if (error && notifications.length === 0) return <ErrorState title="No pudimos cargar las notificaciones" description={error} onRetry={load} />;

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.count}>{unreadCount ? `${unreadCount} sin leer` : 'Todo al día'}</Text>
        {unreadCount > 0 ? <Button label="Marcar todas leídas" variant="secondary" onPress={markAllRead} disabled={isLoading} /> : null}
      </View>
      {error || actionError ? <Text style={styles.error}>{actionError ?? error}</Text> : null}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); void load(); }} />}
        ListEmptyComponent={<EmptyState title="No tienes notificaciones" description="Aquí aparecerán avisos de tus solicitudes y pedidos." />}
        renderItem={({ item }) => {
          const label = item.type.toLowerCase().includes('order') ? 'Pedido' : item.type.toLowerCase().includes('housekeeping') || item.type.toLowerCase().includes('concierge') || item.type.toLowerCase().includes('request') ? 'Solicitud' : 'Hotel';
          return (
            <Card style={[styles.card, !item.isRead && styles.unreadCard]}>
              <View style={styles.row}>
                <Text style={styles.title}>{item.title}</Text>
                <Badge label={label} variant="neutral" />
              </View>
              <Text style={styles.message}>{item.message}</Text>
              <View style={styles.footer}>
                <Text style={styles.time}>{formatElapsedTime(item.createdAt)}</Text>
                {!item.isRead ? <Button label="Marcar leída" variant="secondary" onPress={() => markRead(item.id)} /> : <Badge label="Leída" variant="success" />}
              </View>
            </Card>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[50] },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, padding: spacing.md },
  count: { ...typography.body, color: colors.text.secondary },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm, flexGrow: 1 },
  card: { gap: spacing.sm },
  unreadCard: { borderWidth: 1, borderColor: colors.brand[300] },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  title: { ...typography.bodyLarge, flex: 1, fontWeight: '600' },
  message: { ...typography.body, color: colors.text.secondary },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  time: { ...typography.caption, color: colors.text.muted },
  error: { ...typography.caption, color: colors.state.danger, paddingHorizontal: spacing.md },
});
