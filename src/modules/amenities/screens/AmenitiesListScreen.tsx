import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';
import { colors } from '@/shared/theme/colors';

import type { AmenityModel } from '../models/amenity.model';
import { fetchAmenities } from '../services/amenity.service';
import type { GuestServicesStackParamList } from '@/navigation/routes';

type NavigationProp = NativeStackNavigationProp<GuestServicesStackParamList, 'AmenitiesList'>;

export function AmenitiesListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [amenities, setAmenities] = useState<AmenityModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchAmenities();
      setAmenities(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar amenidades');
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

  if (isLoading && !isRefreshing && amenities.length === 0) {
    return <LoadingState message="Cargando amenidades..." />;
  }

  if (error && amenities.length === 0) {
    return <ErrorState title="Error" description={error} onRetry={load} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={amenities}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <EmptyState
            title="Sin amenidades"
            description="El hotel no ha registrado amenidades por el momento."
            icon="business"
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('AmenityDetail', { amenityId: item.id })}>
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.titleText}>{item.name}</Text>
                {item.isActive ? (
                  <Badge label="Activa" variant="success" />
                ) : (
                  <Badge label="Cerrado" variant="neutral" />
                )}
              </View>
              <Text style={styles.categoryText}>{item.category.toUpperCase()} • {item.location}</Text>
              <Text style={styles.scheduleText}>Horario: {item.scheduleLabel}</Text>
            </Card>
          </TouchableOpacity>
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
  list: {
    padding: spacing.md,
    flexGrow: 1,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
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
  categoryText: {
    ...typography.bodySmall,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
  scheduleText: {
    ...typography.body,
    color: colors.text.secondary,
  },
});
