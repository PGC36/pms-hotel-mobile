import { useFocusEffect, useRoute, type RouteProp } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import type { GuestRoomServiceStackParamList } from '@/navigation/routes';
import { ORDER_STATUS_LABELS } from '@/shared/constants/statuses';
import { colors, spacing, typography } from '@/shared/theme';
import { formatMoney } from '@/shared/utils/formatters';

import type { OrderModel } from '../../models/order.model';
import { canGuestCancelOrder, cancelGuestOrder, getGuestOrder } from '../services/guest-room-service.service';

export function OrderTrackingScreen() {
  const { params } = useRoute<RouteProp<GuestRoomServiceStackParamList, 'OrderDetail'>>();
  const [order, setOrder] = useState<OrderModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setOrder(await getGuestOrder(params.orderId));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cargar el pedido.');
    } finally {
      setLoading(false);
    }
  }, [params.orderId]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const cancel = async () => {
    if (!order) return;
    try {
      setOrder(await cancelGuestOrder(order));
      setError(null);
    } catch (cause) {
      Alert.alert('No se pudo cancelar', cause instanceof Error ? cause.message : 'Actualiza el pedido e intenta de nuevo.');
      await load();
    }
  };

  if (loading && !order) return <LoadingState message="Cargando seguimiento..." />;
  if (error && !order) return <ErrorState title="No pudimos cargar el pedido" description={error} onRetry={load} />;
  if (!order) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
      <View style={styles.row}><Text style={styles.title}>Pedido {order.id.slice(0, 8)}</Text><Badge label={ORDER_STATUS_LABELS[order.status]} variant={order.status === 'delivered' ? 'success' : order.status === 'rejected' || order.status === 'cancelled' ? 'neutral' : 'info'} /></View>
      {order.items.map((item) => <Text key={item.id} style={styles.item}>{item.quantity} × {item.productName}</Text>)}
      <View style={styles.totalRow}><Text style={styles.totalLabel}>Total confirmado</Text><Text style={styles.total}>{formatMoney(order.totalCents, order.currency)}</Text></View>
      {order.notes ? <Text style={styles.notes}>Nota: {order.notes}</Text> : null}
      {canGuestCancelOrder(order.status) ? <Button label="Cancelar pedido" variant="danger" onPress={cancel} loading={loading} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[50] },
  content: { padding: spacing.md, gap: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  title: { ...typography.h2, flex: 1 },
  item: { ...typography.body, paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.sand[200] },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { ...typography.body },
  total: { ...typography.h2, color: colors.brand[600] },
  notes: { ...typography.bodySmall, color: colors.text.secondary },
  error: { ...typography.caption, color: colors.state.danger },
});
