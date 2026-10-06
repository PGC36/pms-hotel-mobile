import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/shared/components/Badge';
import { Card } from '@/shared/components/Card';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import type { GuestRoomServiceStackParamList } from '@/navigation/routes';
import { colors, spacing, typography } from '@/shared/theme';
import { formatMoney } from '@/shared/utils/formatters';
import { ORDER_STATUS_LABELS } from '@/shared/constants/statuses';
import type { OrderModel } from '../../models/order.model';
import { getGuestOrders } from '../services/guest-room-service.service';

type Navigation = NativeStackNavigationProp<GuestRoomServiceStackParamList, 'Orders'>;

export function MyOrdersScreen() {
  const navigation = useNavigation<Navigation>();
  const [orders, setOrders] = useState<OrderModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      setOrders(await getGuestOrders());
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los pedidos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  if (loading && !orders.length) return <LoadingState message="Cargando pedidos..." />;
  if (error && !orders.length) return <ErrorState title="No pudimos cargar tus pedidos" description={error} onRetry={load} />;

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} />}
        ListEmptyComponent={<EmptyState title="Aún no tienes pedidos" description="Tus pedidos de Room Service aparecerán aquí." />}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.title}>Pedido {item.id.slice(0, 8)}</Text>
              <Badge label={ORDER_STATUS_LABELS[item.status]} variant={item.status === 'delivered' ? 'success' : item.status === 'rejected' || item.status === 'cancelled' ? 'neutral' : 'info'} />
            </View>
            <Text style={styles.description}>{item.itemsCount} artículos · {formatMoney(item.totalCents, item.currency)}</Text>
            <Text style={styles.meta}>{item.items.map((orderItem) => `${orderItem.quantity} × ${orderItem.productName}`).join(', ')}</Text>
            <Text style={styles.link} onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}>Ver seguimiento</Text>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[50] },
  list: { padding: spacing.md, gap: spacing.sm, flexGrow: 1 },
  card: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  title: { ...typography.bodyLarge, fontWeight: '600' },
  description: { ...typography.body, color: colors.text.primary },
  meta: { ...typography.bodySmall, color: colors.text.secondary },
  link: { ...typography.button, color: colors.brand[600], textAlign: 'right' },
  error: { ...typography.caption, color: colors.state.danger, padding: spacing.md },
});
