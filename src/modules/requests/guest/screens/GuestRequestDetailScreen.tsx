import { useFocusEffect, useRoute, type RouteProp } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';

import { Badge } from '@/shared/components/Badge';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { colors, spacing, typography } from '@/shared/theme';
import { formatElapsedTime } from '@/shared/utils/date';
import type { GuestServicesStackParamList } from '@/navigation/routes';

import type { GuestRequestModel, GuestRequestStatus } from '../models/guest-request.model';
import { getGuestRequest } from '../services/guest-request.service';

const labels: Record<GuestRequestStatus, string> = {
  pending: 'Pendiente', accepted: 'Aceptada', inProgress: 'En progreso', completed: 'Completada', rejected: 'Rechazada', cancelled: 'Cancelada',
};

export function GuestRequestDetailScreen() {
  const { params } = useRoute<RouteProp<GuestServicesStackParamList, 'RequestDetail'>>();
  const [request, setRequest] = useState<GuestRequestModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRequest(await getGuestRequest(params.requestId, params.type));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cargar la solicitud.');
    } finally {
      setLoading(false);
    }
  }, [params.requestId, params.type]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  if (loading && !request) return <LoadingState message="Cargando solicitud..." />;
  if (error && !request) return <ErrorState title="Solicitud no disponible" description={error} onRetry={load} />;
  if (!request) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
      <Text style={styles.title}>{request.title}</Text>
      <Badge label={labels[request.status]} variant={request.status === 'completed' ? 'success' : request.status === 'rejected' || request.status === 'cancelled' ? 'neutral' : 'info'} />
      <Text style={styles.label}>Detalle</Text>
      <Text style={styles.value}>{request.description}</Text>
      {request.notes ? <><Text style={styles.label}>Notas</Text><Text style={styles.value}>{request.notes}</Text></> : null}
      {request.roomNumber ? <Text style={styles.value}>Habitación {request.roomNumber}</Text> : null}
      <Text style={styles.meta}>Solicitada {formatElapsedTime(request.createdAt)}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[50] },
  content: { padding: spacing.md, gap: spacing.md },
  title: { ...typography.h2 },
  label: { ...typography.caption, color: colors.text.muted },
  value: { ...typography.body, color: colors.text.primary },
  meta: { ...typography.caption, color: colors.text.secondary },
  error: { ...typography.caption, color: colors.state.danger },
});
