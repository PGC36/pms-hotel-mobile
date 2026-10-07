import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { colors, spacing, typography } from '@/shared/theme';
import { formatElapsedTime } from '@/shared/utils/date';
import type { GuestServicesStackParamList } from '@/navigation/routes';

import { canGuestCancelRequest, type GuestRequestModel, type GuestRequestStatus } from '../models/guest-request.model';
import { cancelGuestRequest, getGuestRequests } from '../services/guest-request.service';

type Navigation = NativeStackNavigationProp<GuestServicesStackParamList, 'RequestList'>;
const labels: Record<GuestRequestStatus, string> = {
  pending: 'Pendiente', accepted: 'Aceptada', inProgress: 'En progreso', completed: 'Completada', rejected: 'Rechazada', cancelled: 'Cancelada',
};

export function MyRequestsScreen() {
  const navigation = useNavigation<Navigation>();
  const [requests, setRequests] = useState<GuestRequestModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setRequests(await getGuestRequests());
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar tus solicitudes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const cancel = async (item: GuestRequestModel) => {
    try {
      const updated = await cancelGuestRequest(item.id, item.type, item.status);
      setRequests((current) => current.map((request) => request.id === updated.id ? updated : request));
    } catch (cause) {
      Alert.alert('No se pudo cancelar', cause instanceof Error ? cause.message : 'Actualiza e intenta de nuevo.');
    }
  };

  if (loading && requests.length === 0) return <LoadingState message="Cargando solicitudes..." />;
  if (error && requests.length === 0) return <ErrorState title="No pudimos cargar tus solicitudes" description={error} onRetry={load} />;

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.inlineError}>{error}</Text> : null}
      <FlatList
        data={requests}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} />}
        ListEmptyComponent={<EmptyState title="Sin solicitudes" description="Tus solicitudes de limpieza y conserjería aparecerán aquí." />}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.title}>{item.title}</Text>
              <Badge label={labels[item.status]} variant={item.status === 'completed' ? 'success' : item.status === 'rejected' || item.status === 'cancelled' ? 'neutral' : 'info'} />
            </View>
            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
            <Text style={styles.meta}>{formatElapsedTime(item.createdAt)}{item.roomNumber ? ` · Habitación ${item.roomNumber}` : ''}</Text>
            <View style={styles.actions}>
              <Button label="Ver detalle" variant="secondary" onPress={() => navigation.navigate('RequestDetail', { requestId: item.id, type: item.type })} />
              {canGuestCancelRequest(item.status) ? <Button label="Cancelar" variant="danger" onPress={() => cancel(item)} /> : null}
            </View>
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
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  title: { ...typography.bodyLarge, flex: 1, fontWeight: '600' },
  description: { ...typography.body, color: colors.text.secondary },
  meta: { ...typography.caption, color: colors.text.muted },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
  inlineError: { ...typography.caption, color: colors.state.danger, paddingHorizontal: spacing.md, paddingTop: spacing.sm },
});
