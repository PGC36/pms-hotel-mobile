import { useFocusEffect, useRoute, type RouteProp } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/shared/components/Badge';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { colors, spacing, typography } from '@/shared/theme';
import type { GuestServicesStackParamList } from '@/navigation/routes';

import type { AmenityModel } from '../models/amenity.model';
import { fetchAmenityById } from '../services/amenity.service';

export function AmenityDetailScreen() {
  const { params } = useRoute<RouteProp<GuestServicesStackParamList, 'AmenityDetail'>>();
  const [amenity, setAmenity] = useState<AmenityModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setAmenity(await fetchAmenityById(params.amenityId));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cargar la amenidad.');
    } finally {
      setLoading(false);
    }
  }, [params.amenityId]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  if (loading && !amenity) return <LoadingState message="Cargando amenidad..." />;
  if (error && !amenity) return <ErrorState title="Amenidad no disponible" description={error} onRetry={load} />;
  if (!amenity) return null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      <View style={styles.heading}>
        <Text style={styles.title}>{amenity.name}</Text>
        <Badge label={amenity.isActive ? 'Disponible' : 'Cerrada'} variant={amenity.isActive ? 'success' : 'neutral'} />
      </View>
      <Text style={styles.description}>{amenity.description}</Text>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Ubicación</Text>
        <Text style={styles.value}>{amenity.location}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Horario</Text>
        <Text style={styles.value}>{amenity.scheduleLabel}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Categoría</Text>
        <Text style={styles.value}>{amenity.category}</Text>
      </View>
      {error ? <Text style={styles.inlineError}>{error}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[50] },
  content: { padding: spacing.md, gap: spacing.md },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  title: { ...typography.h2, flex: 1 },
  description: { ...typography.body, color: colors.text.secondary },
  detailRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.sand[200], gap: spacing.xs },
  label: { ...typography.caption, color: colors.text.muted },
  value: { ...typography.body, color: colors.text.primary },
  inlineError: { ...typography.caption, color: colors.state.danger },
});
