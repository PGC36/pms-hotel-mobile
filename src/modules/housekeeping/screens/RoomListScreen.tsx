import { useCallback, useLayoutEffect, useMemo, useReducer } from 'react';
import { Pressable, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { HousekeepingStackParamList } from '@/navigation/routes';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

import { RoomCard } from '../components/RoomCard';
import type { RoomModel } from '../models/room.model';
import { getRooms, HousekeepingServiceError } from '../services/housekeeping.service';

type Props = NativeStackScreenProps<HousekeepingStackParamList, 'RoomList'>;

interface State {
  status: 'loading' | 'error' | 'ready';
  rooms: RoomModel[];
  isRefreshing: boolean;
  errorMessage: string | null;
}

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; rooms: RoomModel[] }
  | { type: 'FETCH_ERROR'; message: string }
  | { type: 'REFRESH_START' };

const initialState: State = {
  status: 'loading',
  rooms: [],
  isRefreshing: false,
  errorMessage: null,
};

/** `dispatch` en vez de setters de `useState`, igual que `TaskListScreen` (react-hooks/set-state-in-effect). */
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      // Al volver al foco con datos ya cargados se recarga sin tapar la lista.
      return { ...state, status: state.status === 'ready' ? 'ready' : 'loading' };
    case 'FETCH_SUCCESS':
      return { status: 'ready', rooms: action.rooms, isRefreshing: false, errorMessage: null };
    case 'FETCH_ERROR':
      return { ...state, status: 'error', isRefreshing: false, errorMessage: action.message };
    case 'REFRESH_START':
      return { ...state, isRefreshing: true };
    default:
      return state;
  }
}

export interface RoomFloorSection {
  floor: number;
  title: string;
  data: RoomModel[];
}

/** Agrupa por piso (ascendente) y ordena por número de forma natural ("2" < "10" < "10A"). */
export function buildFloorSections(rooms: RoomModel[]): RoomFloorSection[] {
  const byFloor = new Map<number, RoomModel[]>();
  for (const room of rooms) {
    byFloor.set(room.floor, [...(byFloor.get(room.floor) ?? []), room]);
  }

  return [...byFloor.entries()]
    .sort(([a], [b]) => a - b)
    .map(([floor, floorRooms]) => ({
      floor,
      title: `Piso ${floor}`,
      data: [...floorRooms].sort((a, b) =>
        a.roomNumber.localeCompare(b.roomNumber, 'es', { numeric: true, sensitivity: 'base' }),
      ),
    }));
}

function getErrorMessage(error: unknown): string {
  return error instanceof HousekeepingServiceError
    ? error.message
    : 'No se pudieron cargar las habitaciones. Intenta de nuevo.';
}

export function RoomListScreen({ navigation }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const load = useCallback(async () => {
    try {
      const rooms = await getRooms();
      dispatch({ type: 'FETCH_SUCCESS', rooms });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', message: getErrorMessage(error) });
    }
  }, []);

  // `useFocusEffect` (como `TaskListScreen`) para reflejar el estado real del
  // backend al volver del detalle después de una acción de limpieza.
  useFocusEffect(
    useCallback(() => {
      dispatch({ type: 'FETCH_START' });
      load();
    }, [load]),
  );

  const retry = useCallback(() => {
    dispatch({ type: 'FETCH_START' });
    load();
  }, [load]);

  const handleRefresh = useCallback(() => {
    dispatch({ type: 'REFRESH_START' });
    load();
  }, [load]);

  // En el encabezado (no en la lista) para que siga visible aunque la API de
  // habitaciones falle: las solicitudes no dependen de ella.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => navigation.navigate('Requests')}
            accessibilityRole="button"
            accessibilityLabel="Ver solicitudes de huéspedes"
            hitSlop={spacing.sm}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text style={styles.headerAction}>Solicitudes</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('History')}
            accessibilityRole="button"
            accessibilityLabel="Ver mi historial de tareas completadas"
            hitSlop={spacing.sm}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text style={styles.headerAction}>Historial</Text>
          </Pressable>
        </View>
      ),
    });
  }, [navigation]);

  const sections = useMemo(() => buildFloorSections(state.rooms), [state.rooms]);

  if (state.status === 'loading') {
    return <LoadingState message="Cargando habitaciones..." />;
  }

  if (state.status === 'error') {
    return (
      <ErrorState
        title="No se pudieron cargar las habitaciones"
        description={state.errorMessage ?? undefined}
        onRetry={retry}
      />
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(room) => room.id}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionTitle} accessibilityRole="header">
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <RoomCard
            room={item}
            onPress={(room) => navigation.navigate('RoomDetail', { roomId: room.id })}
          />
        )}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={state.isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.brand[600]]}
            tintColor={colors.brand[600]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="🛏️"
            title="No hay habitaciones"
            description="El servidor no devolvió habitaciones para limpieza."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sand[50],
  },
  listContent: {
    flexGrow: 1,
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text.primary,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  separator: {
    height: spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  headerAction: {
    ...typography.button,
    color: colors.brand[600],
  },
});
