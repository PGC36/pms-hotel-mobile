import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';

import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { colors } from '@/shared/theme/colors';

import type { NotificationModel } from '../models/notification.model';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notification.service';
import { formatElapsedTime } from '@/shared/utils/date';

export function NotificationListScreen() {
  const [notifications, setNotifications] = useState<NotificationModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar notificaciones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleMarkAsRead = async (id: string) => {
    try {
      const updated = await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? updated : n)));
    } catch (err) {
      // Ignorar fallo por simplicidad
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setIsLoading(true);
      const data = await markAllNotificationsRead();
      setNotifications(data);
    } catch (err) {
      // Ignorar fallo
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !isRefreshing && notifications.length === 0) {
    return <LoadingState message="Cargando notificaciones..." />;
  }

  if (error && notifications.length === 0) {
    return <ErrorState title="Error" description={error} onRetry={load} />;
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {unreadCount > 0 && (
          <Button
            label="Marcar todas leídas"
            variant="secondary"
            onPress={handleMarkAllRead}
            disabled={isLoading}
          />
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <EmptyState
            title="No tienes notificaciones"
            description="Aquí aparecerán tus avisos de solicitudes y pedidos."
            icon="notifications"
          />
        }
        renderItem={({ item }) => (
          <Card style={[styles.card, !item.isRead && styles.unreadCard]}>
            <View style={styles.cardHeader}>
              {!item.isRead && <Badge label="Nueva" variant="info" />}
              <Badge label={item.type === 'orderStatus' ? 'Pedido' : item.type === 'requestStatus' ? 'Solicitud' : 'General'} variant="neutral" />
            </View>
            <View style={styles.content}>
              <View style={styles.textContent}>
                <View style={styles.titleRow}>
                  <Text style={styles.titleText}>{item.title}</Text>
                  <Text style={styles.timeText}>{formatElapsedTime(item.createdAt)}</Text>
                </View>
                <Text style={styles.messageText}>{item.message}</Text>
              </View>
            </View>
            {!item.isRead && (
              <View style={styles.actions}>
                <Button
                  label="Marcar leída"
                  variant="secondary"
                  onPress={() => handleMarkAsRead(item.id)}
                />
              </View>
            )}
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sand[50],
  },
  header: {
    padding: spacing.md,
    alignItems: 'flex-end',
  },
  list: {
    padding: spacing.md,
    flexGrow: 1,
  },
  card: {
    marginBottom: spacing.md,
  },
  unreadCard: {
    borderColor: colors.brand[300],
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  content: {
    marginBottom: spacing.sm,
  },
  textContent: {},
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  titleText: {
    ...typography.bodyLarge,
    fontWeight: 'bold',
    flex: 1,
  },
  timeText: {
    ...typography.bodySmall,
    color: colors.text.muted,
  },
  messageText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  actions: {
    alignItems: 'flex-end',
  },
});
