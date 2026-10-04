import { StyleSheet, Text, View } from 'react-native';

import type { RoomHousekeepingStatus, RoomStatus } from '@/shared/constants/statuses';
import { colors, radius, spacing, statusColors, typography } from '@/shared/theme';

/** Texto visible para la ocupación (`Room.status`). */
export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  available: 'Disponible',
  occupied: 'Ocupada',
  maintenance: 'Mantenimiento',
  outOfService: 'Fuera de servicio',
};

/** Texto visible para la limpieza (`Room.housekeepingStatus`). */
export const ROOM_HOUSEKEEPING_STATUS_LABELS: Record<RoomHousekeepingStatus, string> = {
  dirty: 'Sucia',
  cleaning: 'En limpieza',
  clean: 'Limpia',
  inspected: 'Inspeccionada',
};

export type RoomStatusBadgeProps =
  | { kind: 'occupancy'; status: RoomStatus }
  | { kind: 'housekeeping'; status: RoomHousekeepingStatus };

/**
 * Muestra uno de los dos estados de una habitación con su nombre delante
 * ("Ocupación" / "Limpieza"), para que no se confundan entre sí ni dependan
 * solo del color. Mismo estilo de píldora que `tasks/components/StatusBadge`.
 */
export function RoomStatusBadge(props: RoomStatusBadgeProps) {
  const { title, label, color } =
    props.kind === 'occupancy'
      ? {
          title: 'Ocupación',
          label: ROOM_STATUS_LABELS[props.status],
          color: statusColors.roomOccupancy[props.status],
        }
      : {
          title: 'Limpieza',
          label: ROOM_HOUSEKEEPING_STATUS_LABELS[props.status],
          color: statusColors.room[props.status],
        };

  return (
    <View style={styles.container} accessible accessibilityLabel={`${title}: ${label}`}>
      <Text style={styles.title}>{title}</Text>
      <View style={[styles.badge, { backgroundColor: color.background }]}>
        <Text style={[styles.label, { color: color.text }]}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    ...typography.caption,
    color: colors.text.muted,
  },
  badge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
  label: {
    ...typography.caption,
  },
});
