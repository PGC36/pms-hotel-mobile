import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography } from '@/shared/theme';

import {
  getStatusColor,
  getStatusLabel,
  type TaskEntityType,
  type TaskStatus,
} from '../models/task.model';

export interface StatusBadgeProps {
  entityType: TaskEntityType;
  status: TaskStatus;
}

/**
 * Como `shared/components/Badge`, pero coloreado desde `statusColors`
 * (shared/theme/colors.ts) en vez de su set fijo de variantes — las máquinas
 * de estado no encajan en el enum `neutral | accent | success | ...` de Badge.
 */
export function StatusBadge({ entityType, status }: StatusBadgeProps) {
  const { background, text } = getStatusColor(entityType, status);
  const label = getStatusLabel(entityType, status);

  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
  label: {
    ...typography.caption,
  },
});
