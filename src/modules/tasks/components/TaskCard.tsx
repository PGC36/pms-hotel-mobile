import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';
import { formatElapsedTime } from '@/shared/utils/date';

import { StatusBadge } from './StatusBadge';
import type { TaskModel } from '../models/task.model';

export interface TaskCardProps {
  task: TaskModel;
  onPress?: (task: TaskModel) => void;
}

/**
 * Configurable por tipo de entidad a través de `task.entityType` — el mismo
 * componente renderiza una solicitud de limpieza, un pedido de Room Service
 * o una solicitud de conserjería sin ninguna rama específica por tipo
 * (architecture.md sección 3, MOV-07 criterio de aceptación 1).
 */
export function TaskCard({ task, onPress }: TaskCardProps) {
  const content = (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {task.title}
        </Text>
        <StatusBadge entityType={task.entityType} status={task.status} />
      </View>
      <Text style={styles.description} numberOfLines={2}>
        {task.description}
      </Text>
      <View style={styles.footer}>
        <Text style={styles.meta}>{task.roomLabel ?? 'Sin habitación asignada'}</Text>
        {task.meta ? <Text style={styles.meta}>{task.meta}</Text> : null}
        <Text style={styles.meta}>{formatElapsedTime(task.createdAt)}</Text>
      </View>
    </Card>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={() => onPress(task)} accessibilityRole="button">
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    flex: 1,
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  meta: {
    ...typography.caption,
    color: colors.text.muted,
  },
});
