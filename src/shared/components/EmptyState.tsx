import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, spacing, typography } from '@/shared/theme';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

export function EmptyState({ icon = '🗂️', title, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  icon: {
    fontSize: fontSize.display,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
