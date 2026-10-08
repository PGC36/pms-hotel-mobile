import { useCallback, useEffect, useReducer } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ConciergeStackParamList } from '@/navigation/routes';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

import { getConciergeRequests } from '../services/concierge.service';

type Props = NativeStackScreenProps<ConciergeStackParamList, 'Rooms'>;
interface RoomSummary {
  id: string;
  number: string;
  count: number;
}
type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; rooms: RoomSummary[] };
type Action =
  { type: 'LOAD' } | { type: 'LOADED'; rooms: RoomSummary[] } | { type: 'ERROR'; message: string };
function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD':
      return { status: 'loading' };
    case 'LOADED':
      return { status: 'ready', rooms: action.rooms };
    case 'ERROR':
      return { status: 'error', message: action.message };
  }
}

export function ConciergeRoomsScreen({ navigation }: Props) {
  const [state, dispatch] = useReducer(reducer, { status: 'loading' });
  const load = useCallback(async () => {
    try {
      const requests = await getConciergeRequests();
      const rooms = new Map<string, RoomSummary>();
      for (const request of requests) {
        const room = rooms.get(request.roomId);
        rooms.set(request.roomId, {
          id: request.roomId,
          number: request.roomNumber,
          count: (room?.count ?? 0) + 1,
        });
      }
      dispatch({
        type: 'LOADED',
        rooms: [...rooms.values()].sort((a, b) =>
          a.number.localeCompare(b.number, 'es', { numeric: true }),
        ),
      });
    } catch (error) {
      dispatch({
        type: 'ERROR',
        message: error instanceof Error ? error.message : 'No se pudieron cargar las habitaciones.',
      });
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  if (state.status === 'loading') return <LoadingState message="Cargando habitaciones..." />;
  if (state.status === 'error')
    return (
      <ErrorState
        title="No se pudieron cargar las habitaciones"
        description={state.message}
        onRetry={() => {
          dispatch({ type: 'LOAD' });
          void load();
        }}
      />
    );
  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={state.rooms}
      keyExtractor={(room) => room.id}
      ListEmptyComponent={<EmptyState title="No hay solicitudes por habitación" />}
      renderItem={({ item }) => (
        <Pressable
          style={styles.row}
          accessibilityRole="button"
          onPress={() =>
            navigation.navigate('RoomRequests', { roomId: item.id, roomNumber: item.number })
          }
        >
          <View>
            <Text style={styles.title}>Habitación {item.number}</Text>
            <Text style={styles.meta}>{item.count} solicitudes</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[50] },
  content: { padding: spacing.md, gap: spacing.sm },
  row: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.sand[300],
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { ...typography.body, color: colors.text.primary },
  meta: { ...typography.caption, color: colors.text.muted },
  arrow: { fontSize: 24, color: colors.brand[600] },
});
