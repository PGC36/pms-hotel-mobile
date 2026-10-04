import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

import {
  ROOM_HOUSEKEEPING_STATUS_LABELS,
  ROOM_STATUS_LABELS,
  RoomStatusBadge,
} from './RoomStatusBadge';
import type { RoomModel } from '../models/room.model';

export interface RoomCardProps {
  room: RoomModel;
  onPress?: (room: RoomModel) => void;
}

/** Tarjeta de habitación: ocupación (solo lectura) y limpieza como dos estados separados. */
export function RoomCard({ room, onPress }: RoomCardProps) {
  const content = (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          Habitación {room.roomNumber}
        </Text>
        <Text style={styles.meta}>Piso {room.floor}</Text>
      </View>
      <View style={styles.statuses}>
        <RoomStatusBadge kind="housekeeping" status={room.housekeepingStatus} />
        <RoomStatusBadge kind="occupancy" status={room.status} />
      </View>
    </Card>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={() => onPress(room)}
      accessibilityRole="button"
      accessibilityLabel={`Habitación ${room.roomNumber}, piso ${room.floor}. Limpieza: ${
        ROOM_HOUSEKEEPING_STATUS_LABELS[room.housekeepingStatus]
      }. Ocupación: ${ROOM_STATUS_LABELS[room.status]}.`}
      accessibilityHint="Abre el detalle de la habitación"
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    flex: 1,
  },
  meta: {
    ...typography.caption,
    color: colors.text.muted,
  },
  statuses: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
});
